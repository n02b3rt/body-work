import test from 'node:test'
import assert from 'node:assert/strict'

import {
  canContain,
  defaultSectionProps,
  ELEMENT_BY_TYPE,
  ELEMENT_DEFINITIONS,
  elementDefinition,
  elementLabel,
  MAX_TREE_DEPTH,
  SECTION_CHILDREN,
} from '../src/lib/builder/elements/registry.ts'

test('the root only ever contains a section', () => {
  assert.equal(canContain('root', 'section'), true)
  assert.equal(canContain('root', 'heading'), false)
  assert.equal(canContain('root', 'container'), false)
})

test('a section accepts everything in the library, and nothing outside it', () => {
  for (const definition of ELEMENT_DEFINITIONS) {
    assert.equal(canContain('section', definition.type), true, `section should accept ${definition.type}`)
  }
  assert.equal(canContain('section', 'root'), false)
  assert.equal(canContain('section', 'section'), false)
})

test('a container accepts another container: unbounded nesting is the whole point', () => {
  assert.equal(canContain('container', 'container'), true)
  assert.equal(canContain('container', 'heading'), true)
})

test('leaf elements accept nothing: their content is props, not child nodes', () => {
  const leaves = ELEMENT_DEFINITIONS.filter((d) => d.allowedChildren === 'none')
  assert.ok(leaves.length > 0)
  for (const leaf of leaves) {
    assert.equal(canContain(leaf.type, 'heading'), false, `${leaf.type} should accept no children`)
  }
})

test('canContain is false for a type the registry does not know', () => {
  // @ts-expect-error deliberately not a real ElementType
  assert.equal(canContain('nonsense', 'heading'), false)
})

test('SECTION_CHILDREN lists every non-section element, container included', () => {
  assert.ok(SECTION_CHILDREN.includes('container'))
  assert.ok(SECTION_CHILDREN.includes('heading'))
  assert.equal(SECTION_CHILDREN.includes('section' as never), false)
})

test('every element type appears exactly once in ELEMENT_DEFINITIONS', () => {
  const types = ELEMENT_DEFINITIONS.map((d) => d.type)
  assert.equal(new Set(types).size, types.length)
})

test('elementDefinition and elementLabel agree with ELEMENT_BY_TYPE', () => {
  for (const definition of ELEMENT_DEFINITIONS) {
    assert.equal(elementDefinition(definition.type), definition)
    assert.equal(elementLabel(definition.type), definition.label)
    assert.equal(ELEMENT_BY_TYPE[definition.type], definition)
  }
})

test('elementLabel falls back to the raw type for an unknown slug', () => {
  assert.equal(elementLabel('made-up-type'), 'made-up-type')
})

test('elementDefinition returns undefined for section and root: neither is a library entry', () => {
  assert.equal(elementDefinition('section'), undefined)
  assert.equal(elementDefinition('root'), undefined)
})

test('defaultSectionProps gives every new section the same starting shape', () => {
  assert.deepEqual(defaultSectionProps(), {
    width: 'container',
    spacing: 'md',
    background: '',
    anchor: '',
  })
})

test('MAX_TREE_DEPTH is a sane positive bound', () => {
  assert.ok(MAX_TREE_DEPTH > 0)
  assert.ok(Number.isInteger(MAX_TREE_DEPTH))
})
