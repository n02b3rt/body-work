import test from 'node:test'
import assert from 'node:assert/strict'

import {
  coerceBuilderDoc,
  collectMediaIds,
  emptyBuilderDoc,
  findParent,
  headingCount,
  isBuilderDoc,
  reachableIds,
  walkBuilderDoc,
  wordCount,
  type BuilderDoc,
} from '../src/lib/builder/types.ts'

test('emptyBuilderDoc is a root with no children', () => {
  const doc = emptyBuilderDoc()
  assert.equal(doc.version, 2)
  assert.equal(doc.nodes[doc.root]?.type, 'root')
  assert.deepEqual(doc.nodes[doc.root]?.children, [])
})

test('isBuilderDoc rejects anything that is not a valid tree', () => {
  assert.equal(isBuilderDoc(null), false)
  assert.equal(isBuilderDoc(undefined), false)
  assert.equal(isBuilderDoc('a string'), false)
  assert.equal(isBuilderDoc({}), false)
  assert.equal(isBuilderDoc({ version: 1, root: 'root', nodes: {} }), false) // wrong version
  assert.equal(isBuilderDoc({ version: 2, root: 'missing', nodes: {} }), false) // root not in nodes
  assert.equal(isBuilderDoc(emptyBuilderDoc()), true)
})

test('coerceBuilderDoc passes a valid doc through and replaces garbage with an empty one', () => {
  const valid = emptyBuilderDoc()
  assert.equal(coerceBuilderDoc(valid), valid)
  assert.deepEqual(coerceBuilderDoc(null), emptyBuilderDoc())
  assert.deepEqual(coerceBuilderDoc('garbage'), emptyBuilderDoc())
  assert.deepEqual(coerceBuilderDoc({ some: 'legacy shape' }), emptyBuilderDoc())
})

/** A small tree: root -> section -> [heading, container -> [text]]. */
function sampleDoc(): BuilderDoc {
  return {
    version: 2,
    root: 'root',
    nodes: {
      root: { id: 'root', type: 'root', children: ['section-1'], props: {}, tw: {} },
      'section-1': {
        id: 'section-1',
        type: 'section',
        children: ['heading-1', 'container-1'],
        props: {},
        tw: {},
      },
      'heading-1': {
        id: 'heading-1',
        type: 'heading',
        children: [],
        props: { html: 'Witaj <strong>świecie</strong>' },
        tw: {},
      },
      'container-1': {
        id: 'container-1',
        type: 'container',
        children: ['text-1'],
        props: {},
        tw: {},
      },
      'text-1': {
        id: 'text-1',
        type: 'text',
        children: [],
        props: { html: '<p>Trzy słowa tutaj.</p>' },
        tw: {},
      },
    },
  }
}

test('walkBuilderDoc visits every node parent-first, in document order', () => {
  const seen: string[] = []
  walkBuilderDoc(sampleDoc(), (node) => seen.push(node.id))
  assert.deepEqual(seen, ['root', 'section-1', 'heading-1', 'container-1', 'text-1'])
})

test('walkBuilderDoc hands each node its real parent', () => {
  const pairs: [string, string | null][] = []
  walkBuilderDoc(sampleDoc(), (node, parent) => pairs.push([node.id, parent?.id ?? null]))
  assert.deepEqual(pairs, [
    ['root', null],
    ['section-1', 'root'],
    ['heading-1', 'section-1'],
    ['container-1', 'section-1'],
    ['text-1', 'container-1'],
  ])
})

test('reachableIds finds every node, and nothing that is not there', () => {
  const ids = reachableIds(sampleDoc())
  assert.deepEqual(
    [...ids].sort(),
    ['container-1', 'heading-1', 'root', 'section-1', 'text-1'].sort(),
  )
})

test('reachableIds does not include an orphaned node missing from the tree', () => {
  const doc = sampleDoc()
  doc.nodes['orphan'] = { id: 'orphan', type: 'text', children: [], props: {}, tw: {} }
  const ids = reachableIds(doc)
  assert.equal(ids.has('orphan'), false)
})

test('wordCount sums plain and HTML text across every node', () => {
  // "Witaj świecie" (2) + "Trzy słowa tutaj" (3) = 5, tags stripped either way.
  assert.equal(wordCount(sampleDoc()), 5)
})

test('wordCount counts repeater entries too, every string field in each entry', () => {
  const doc: BuilderDoc = {
    version: 2,
    root: 'root',
    nodes: {
      root: { id: 'root', type: 'root', children: ['list-1'], props: {}, tw: {} },
      'list-1': {
        id: 'list-1',
        type: 'list',
        children: [],
        // 'check' (1) + 'Jeden dwa' (2) + 'check' (1) + 'Trzy' (1) = 5: the icon slug
        // is a string field like any other, so it is swept up too. A soft estimate
        // for a "N min read" label, not a precise count.
        props: { items: [{ icon: 'check', html: 'Jeden dwa' }, { icon: 'check', html: 'Trzy' }] },
        tw: {},
      },
    },
  }
  assert.equal(wordCount(doc), 5)
})

test('wordCount is zero for an empty document', () => {
  assert.equal(wordCount(emptyBuilderDoc()), 0)
})

test('headingCount only counts heading nodes', () => {
  assert.equal(headingCount(sampleDoc()), 1)
  assert.equal(headingCount(emptyBuilderDoc()), 0)
})

test('collectMediaIds gathers mediaId, posterId and mediaIds, but not icon names', () => {
  const doc: BuilderDoc = {
    version: 2,
    root: 'root',
    nodes: {
      root: { id: 'root', type: 'root', children: ['image-1', 'video-1', 'gallery-1', 'features-1'], props: {}, tw: {} },
      'image-1': { id: 'image-1', type: 'image', children: [], props: { mediaId: 5 }, tw: {} },
      'video-1': { id: 'video-1', type: 'video', children: [], props: { mediaId: 6, posterId: 7 }, tw: {} },
      'gallery-1': { id: 'gallery-1', type: 'gallery', children: [], props: { mediaIds: [8, 9] }, tw: {} },
      'features-1': {
        id: 'features-1',
        type: 'features',
        children: [],
        props: { items: [{ icon: 'check', heading: 'X' }] },
        tw: {},
      },
    },
  }
  assert.deepEqual([...collectMediaIds(doc)].sort((a, b) => a - b), [5, 6, 7, 8, 9])
})

test('collectMediaIds returns nothing for a tree with no media', () => {
  assert.deepEqual(collectMediaIds(sampleDoc()), [])
})

test('findParent finds the one node whose children include the target', () => {
  const doc = sampleDoc()
  assert.equal(findParent(doc, 'heading-1')?.id, 'section-1')
  assert.equal(findParent(doc, 'text-1')?.id, 'container-1')
  assert.equal(findParent(doc, 'section-1')?.id, 'root')
})

test('findParent returns undefined for the root and for an id not in the tree', () => {
  const doc = sampleDoc()
  assert.equal(findParent(doc, doc.root), undefined)
  assert.equal(findParent(doc, 'does-not-exist'), undefined)
})
