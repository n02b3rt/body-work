/**
 * End-to-end check for the page builder: creates a page exercising every
 * current element type, saves it through Payload the same way `/edytor`'s
 * `saveBuilderDoc` does, reads it back, and confirms the tree survived the
 * round trip and the public route renders it with a 200.
 *
 * Run with: `pnpm smoke:builder`
 *
 * Cleans up the page it creates, published or not, in a `finally` — a failed
 * assertion still leaves the database as it found it.
 */
import { getPayload } from 'payload'
import config from '@payload-config'

import type { BuilderDoc, ElementType } from '../src/lib/builder/types.ts'

const payload = await getPayload({ config })

function node(id: string, type: ElementType, children: string[], props: Record<string, unknown> = {}) {
  return { id, type, children, props, tw: { base: ['p-4'] } }
}

const doc: BuilderDoc = {
  version: 2,
  root: 'root',
  nodes: {
    root: node('root', 'root', ['section-1']),
    'section-1': { ...node('section-1', 'section', ['container-1'], { width: 'container', spacing: 'md' }) },
    'container-1': node('container-1', 'container', ['heading-1', 'text-1', 'button-1', 'divider-1']),
    'heading-1': { ...node('heading-1', 'heading', [], { html: 'Smoke test' }), a11y: { headingLevel: 2 } },
    'text-1': node('text-1', 'text', [], { html: '<p>Sprawdzenie <strong>kreatora</strong>.</p>' }),
    'button-1': node('button-1', 'button', [], { label: 'Kliknij', href: '/kontakt', variant: 'primary' }),
    'divider-1': node('divider-1', 'divider', []),
  },
}

let pageId: number | string | null = null

try {
  const slug = `smoke-builder-${Date.now()}`
  const created = await payload.create({
    collection: 'pages',
    data: { title: 'Smoke test kreatora', slug, builder: doc, _status: 'published' },
    overrideAccess: true,
  })
  pageId = created.id
  console.log(`created page ${pageId} at slug "${slug}"`)

  const fetched = await payload.findByID({ collection: 'pages', id: pageId, overrideAccess: true })
  const roundTripped = fetched.builder as unknown as BuilderDoc

  const originalTypes = Object.values(doc.nodes).map((n) => n.type).sort()
  const roundTrippedTypes = Object.values(roundTripped.nodes).map((n) => n.type).sort()

  if (JSON.stringify(originalTypes) !== JSON.stringify(roundTrippedTypes)) {
    throw new Error(
      `round trip lost or changed node types.\n  wrote:  ${originalTypes.join(', ')}\n  read:   ${roundTrippedTypes.join(', ')}`,
    )
  }
  console.log(`round trip: ${roundTrippedTypes.length} nodes, all types intact`)

  const publicURL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
  const response = await fetch(`${publicURL}/pl/${slug}`).catch(() => null)
  if (!response) {
    console.log('public route: skipped (dev server not reachable at ' + publicURL + ')')
  } else if (!response.ok) {
    throw new Error(`public route returned ${response.status} for /pl/${slug}`)
  } else {
    const html = await response.text()
    // 'root' is never itself rendered as a node — only its children are — so it never carries
    // a `data-node-type`, unlike everything else in the tree.
    const renderedTypes = originalTypes.filter((type) => type !== 'root')
    const missing = renderedTypes.filter((type) => !html.includes(`data-node-type="${type}"`))
    if (missing.length > 0) {
      throw new Error(`public route rendered, but these node types are missing from the HTML: ${missing.join(', ')}`)
    }
    console.log(`public route: 200, every node type present in the markup`)
  }

  console.log('\nsmoke:builder passed')
} finally {
  if (pageId !== null) {
    await payload.delete({ collection: 'pages', id: pageId, overrideAccess: true })
    console.log(`cleaned up page ${pageId}`)
  }
}

process.exit(0)
