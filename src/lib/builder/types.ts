/**
 * The page builder's data model: a flat, normalised tree.
 *
 * A flat `nodes` map rather than a nested tree: `move`, `duplicate` and `remove`
 * become edits to one or two map entries instead of rewriting a branch, and a
 * store selector can subscribe to a single node so editing one element does not
 * re-render the whole canvas.
 *
 * This is the contract every other part of the builder is written against: the
 * editor shell, the renderer, the inspector and the a11y audit all import from
 * here rather than inventing their own shape of a node.
 */

export type NodeId = string

export type Breakpoint = 'base' | 'md' | 'lg'

/** Mobile-first, matching Tailwind's own default breakpoint order. */
export const BREAKPOINTS: Breakpoint[] = ['base', 'md', 'lg']

export type ElementType =
  | 'root'
  | 'section'
  | 'container'
  | 'heading'
  | 'text'
  | 'image'
  | 'button'
  | 'icon'
  | 'list'
  | 'divider'
  | 'spacer'
  | 'gallery'
  | 'carousel'
  | 'video'
  | 'accordion'
  | 'hero'
  | 'cta'
  | 'features'
  | 'savedComponent'

export type BuilderNode = {
  id: NodeId
  type: ElementType
  children: NodeId[]
  /** Element-specific data: text HTML, media id, href, list items, and so on. */
  props: Record<string, unknown>
  /** Tailwind utility classes, one list per breakpoint. Mobile-first: `md`/`lg` override `base`. */
  tw: Partial<Record<Breakpoint, string[]>>
  /**
   * Escape hatch for values outside the token scale (arbitrary px, a one-off hex): camelCase
   * CSS property names to literal values, one bucket per breakpoint like `tw`. Wins over `tw`
   * at every breakpoint it is set for — rendered as a generated per-node stylesheet rule
   * rather than an inline `style`, specifically so it *can* vary by breakpoint the same way a
   * `tw` class does (`src/components/builder/render/class-names.ts`).
   */
  css?: Partial<Record<Breakpoint, Record<string, string>>>
  a11y?: {
    ariaLabel?: string
    role?: string
    /** Only meaningful on `type: 'heading'`; kept here too so the a11y audit does not special-case it. */
    headingLevel?: 1 | 2 | 3 | 4 | 5 | 6
  }
  meta?: {
    /** Editor-facing name in the tree, distinct from the element type label. */
    name?: string
    /** Prevents accidental move/delete/duplicate from the canvas; the tree can still select it. */
    locked?: boolean
    hiddenOn?: Breakpoint[]
  }
  /** Present only on `type: 'savedComponent'` in reference mode. */
  ref?: {
    component: string
  }
}

export type BuilderDoc = {
  version: 2
  root: NodeId
  nodes: Record<NodeId, BuilderNode>
}

export function emptyBuilderDoc(): BuilderDoc {
  const root: NodeId = 'root'
  return {
    version: 2,
    root,
    nodes: {
      [root]: { id: root, type: 'root', children: [], props: {}, tw: {} },
    },
  }
}

export function isBuilderDoc(value: unknown): value is BuilderDoc {
  if (!value || typeof value !== 'object') return false
  const doc = value as Partial<BuilderDoc>
  return (
    doc.version === 2 &&
    typeof doc.root === 'string' &&
    typeof doc.nodes === 'object' &&
    doc.nodes !== null &&
    doc.root in doc.nodes
  )
}

/** A document freshly read from Payload's `json` field: `null`, `undefined`, or garbage are all normal for a page nobody has opened in the builder yet. */
export function coerceBuilderDoc(value: unknown): BuilderDoc {
  return isBuilderDoc(value) ? value : emptyBuilderDoc()
}

/** Depth-first pre-order walk, parent before children. */
export function walkBuilderDoc(
  doc: BuilderDoc,
  visit: (node: BuilderNode, parent: BuilderNode | null) => void,
): void {
  function step(id: NodeId, parent: BuilderNode | null) {
    const node = doc.nodes[id]
    if (!node) return
    visit(node, parent)
    for (const childId of node.children) step(childId, node)
  }
  step(doc.root, null)
}

/** The one node whose `children` includes `id`, or `undefined` for the root (which has no parent). */
export function findParent(doc: BuilderDoc, id: NodeId): BuilderNode | undefined {
  return Object.values(doc.nodes).find((node) => node.children.includes(id))
}

/** Every node id reachable from the root, root included. Used to detect orphans and reference cycles. */
export function reachableIds(doc: BuilderDoc): Set<NodeId> {
  const seen = new Set<NodeId>()
  walkBuilderDoc(doc, (node) => seen.add(node.id))
  return seen
}

function wordsInPlainText(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

function wordsInHtml(html: string): number {
  return wordsInPlainText(html.replace(/<[^>]+>/g, ' '))
}

/**
 * Sums the words across every node's text-bearing props: `props.html` for
 * `heading`/`text`, plus `label`/`heading`/`text` on the data-driven blocks
 * (buttons, hero, cta, features, accordion, list) and their repeater entries.
 * An estimate for a "N min read" label and for `content-health.ts`, not a
 * copy-editing tool.
 */
export function wordCount(doc: BuilderDoc): number {
  let total = 0
  for (const node of Object.values(doc.nodes)) {
    for (const value of Object.values(node.props ?? {})) {
      if (typeof value === 'string') {
        total += /<[a-z][\s\S]*>/i.test(value) ? wordsInHtml(value) : wordsInPlainText(value)
      } else if (Array.isArray(value)) {
        for (const entry of value) {
          if (entry && typeof entry === 'object') {
            for (const inner of Object.values(entry as Record<string, unknown>)) {
              if (typeof inner === 'string') total += wordsInHtml(inner)
            }
          }
        }
      }
    }
  }
  return total
}

/** How many `heading` nodes the tree has, for the "no subheadings at all" content-health check. */
export function headingCount(doc: BuilderDoc): number {
  let count = 0
  for (const node of Object.values(doc.nodes)) {
    if (node.type === 'heading') count += 1
  }
  return count
}

const MEDIA_ID_PROPS = new Set(['mediaId', 'posterId'])
const MEDIA_ID_LIST_PROPS = new Set(['mediaIds'])

/**
 * Every Media id a tree points at, from `props.mediaId`/`props.posterId`
 * (single) and `props.mediaIds` (gallery/carousel), plus repeater entries
 * carrying either shape (features/list item icons are icon names, not media,
 * so they are deliberately not swept up here).
 */
export function collectMediaIds(doc: BuilderDoc): number[] {
  const ids = new Set<number>()
  const take = (value: unknown) => {
    if (typeof value === 'number') ids.add(value)
  }
  for (const node of Object.values(doc.nodes)) {
    for (const [key, value] of Object.entries(node.props ?? {})) {
      if (MEDIA_ID_PROPS.has(key)) take(value)
      if (MEDIA_ID_LIST_PROPS.has(key) && Array.isArray(value)) value.forEach(take)
      if (Array.isArray(value)) {
        for (const entry of value) {
          if (!entry || typeof entry !== 'object') continue
          for (const [innerKey, innerValue] of Object.entries(entry as Record<string, unknown>)) {
            if (MEDIA_ID_PROPS.has(innerKey)) take(innerValue)
          }
        }
      }
    }
  }
  return [...ids]
}
