/**
 * Converts a Lexical `richText` value (the shape Payload stores for
 * `pages.content` before this rewrite, and still stores for
 * `post-translations.content`) into a `BuilderDoc`.
 *
 * Not a general Lexical renderer: it covers the node types the imported blog
 * content and hand-written pages actually used (see
 * `scripts/import-blog.ts`), and it is deliberately lossy where the builder's
 * element library has no equivalent:
 *
 * - **Ordered vs. unordered lists collapse into one `list` element type.**
 *   The registry (`src/lib/builder/elements/registry.ts`) has an icon list,
 *   not a numbered one; a `listType: 'number'` list converts with its item
 *   text intact but its numbering is gone. Flagged in the returned report.
 * - **Blockquotes convert to a plain `text` node.** There is no `quote`
 *   element in the library; the words survive, the visual distinction does not.
 * - **Anything else unrecognised is skipped**, not guessed at, and named in
 *   the report so a human decides rather than the converter inventing content.
 */

import type { BuilderDoc, BuilderNode, ElementType, NodeId } from '../types'

export type LexicalNode = {
  type?: string
  tag?: string
  text?: string
  format?: number | string
  listType?: string
  url?: string
  value?: unknown
  children?: LexicalNode[]
  fields?: { displaySize?: string }
}

export type LexicalRichText = { root?: LexicalNode } | null | undefined

export type ConversionReport = {
  /** Node types encountered that this converter does not know how to place. */
  skipped: string[]
  /** How many `list` nodes lost their `listType: 'number'` numbering. */
  numberedListsFlattened: number
}

let counter = 0
function nextId(): NodeId {
  counter += 1
  return `conv_${counter}_${Math.random().toString(36).slice(2, 8)}`
}

const INLINE_FORMAT_BOLD = 1
const INLINE_FORMAT_ITALIC = 2

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/** Renders one inline run: bold/italic formatting, links, line breaks. */
function inlineHtml(node: LexicalNode): string {
  if (node.type === 'linebreak') return '<br>'

  if (node.type === 'text') {
    const format = Number(node.format ?? 0)
    let text = escapeHtml(node.text ?? '')
    if (format & INLINE_FORMAT_BOLD) text = `<strong>${text}</strong>`
    if (format & INLINE_FORMAT_ITALIC) text = `<em>${text}</em>`
    return text
  }

  if (node.type === 'link' || node.type === 'autolink') {
    const inner = (node.children ?? []).map(inlineHtml).join('')
    const href = typeof node.url === 'string' ? node.url : ''
    return `<a href="${escapeHtml(href)}">${inner}</a>`
  }

  // An inline node this converter does not special-case (unlikely, but the imported
  // content is not fully known): fall through to its own children's text rather than
  // dropping it silently.
  return (node.children ?? []).map(inlineHtml).join('')
}

function blockInlineHtml(node: LexicalNode): string {
  return (node.children ?? []).map(inlineHtml).join('')
}

function headingLevel(tag: unknown): 1 | 2 | 3 | 4 | 5 | 6 {
  const level = Number(String(tag ?? '2').replace('h', ''))
  return (level >= 1 && level <= 6 ? level : 2) as 1 | 2 | 3 | 4 | 5 | 6
}

function makeNode(type: ElementType, props: Record<string, unknown>): BuilderNode {
  return { id: nextId(), type, children: [], props, tw: {} }
}

/** Converts one Lexical upload node's `displaySize` into the builder's `aspectRatio`/`fit`. */
function imageNodeFrom(node: LexicalNode): BuilderNode {
  const value = node.value as { id?: number } | number | undefined
  const mediaId = typeof value === 'number' ? value : (value?.id ?? null)
  return makeNode('image', { mediaId, aspectRatio: 'auto', fit: 'cover', caption: '' })
}

function listItemText(item: LexicalNode): string {
  return blockInlineHtml(item)
}

/**
 * Walks a Lexical root's top-level blocks and returns the equivalent builder
 * nodes, flat (a section's `children`), plus a report of what did not convert
 * cleanly.
 */
export function convertLexicalToBuilderNodes(
  value: LexicalRichText,
): { nodes: BuilderNode[]; report: ConversionReport } {
  const report: ConversionReport = { skipped: [], numberedListsFlattened: 0 }
  const blocks = value?.root?.children ?? []
  const nodes: BuilderNode[] = []

  for (const block of blocks) {
    switch (block.type) {
      case 'paragraph': {
        const html = blockInlineHtml(block).trim()
        if (html.length > 0) nodes.push(makeNode('text', { html: `<p>${html}</p>` }))
        break
      }
      case 'heading': {
        const html = blockInlineHtml(block).trim()
        const level = headingLevel(block.tag)
        const node = makeNode('heading', { html })
        node.a11y = { headingLevel: level }
        nodes.push(node)
        break
      }
      case 'quote': {
        const html = blockInlineHtml(block).trim()
        if (html.length > 0) nodes.push(makeNode('text', { html: `<p>${html}</p>` }))
        break
      }
      case 'upload': {
        nodes.push(imageNodeFrom(block))
        break
      }
      case 'horizontalrule': {
        nodes.push(makeNode('divider', {}))
        break
      }
      case 'list': {
        if (block.listType === 'number') report.numberedListsFlattened += 1
        const items = (block.children ?? [])
          .map((item) => ({ icon: 'check', html: listItemText(item) }))
          .filter((item) => item.html.trim().length > 0)
        if (items.length > 0) nodes.push(makeNode('list', { items }))
        break
      }
      default: {
        if (block.type) report.skipped.push(block.type)
      }
    }
  }

  return { nodes, report }
}

/** Wraps the converted blocks in one section, ready to assign to `pages.builder` / `posts.builder`. */
export function convertLexicalToBuilderDoc(value: LexicalRichText): {
  doc: BuilderDoc
  report: ConversionReport
} {
  const { nodes, report } = convertLexicalToBuilderNodes(value)

  const rootId: NodeId = 'root'
  const sectionId: NodeId = nextId()

  const docNodes: Record<NodeId, BuilderNode> = {
    [rootId]: { id: rootId, type: 'root', children: [sectionId], props: {}, tw: {} },
    [sectionId]: {
      id: sectionId,
      type: 'section',
      children: nodes.map((n) => n.id),
      props: { width: 'container', spacing: 'md', background: '', anchor: '' },
      tw: {},
    },
  }
  for (const node of nodes) docNodes[node.id] = node

  return { doc: { version: 2, root: rootId, nodes: docNodes }, report }
}
