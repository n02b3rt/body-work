import test from 'node:test'
import assert from 'node:assert/strict'

import {
  COLOR_TOKENS,
  findColorToken,
  GRID_COLUMNS,
  NONE_COLOR,
  RADIUS_SCALE,
  spacingClass,
  SPACING_PROPERTIES,
  SPACING_SCALE,
} from '../src/lib/builder/tw-tokens.ts'

test('COLOR_TOKENS carries one entry per theme token, no duplicates', () => {
  const values = COLOR_TOKENS.map((t) => t.value)
  assert.equal(new Set(values).size, values.length)
  assert.ok(COLOR_TOKENS.length > 0)
})

test('every COLOR_TOKENS value is a real Tailwind utility suffix, none are the placeholder empty string', () => {
  for (const token of COLOR_TOKENS) {
    assert.ok(token.value.length > 0, `token ${token.themePath} has no utility suffix`)
  }
})

test('findColorToken looks up by utility suffix, and misses return undefined', () => {
  const brand = findColorToken('brand')
  assert.ok(brand)
  assert.equal(brand?.themePath, 'brand.primary')
  assert.equal(findColorToken('not-a-real-token'), undefined)
  assert.equal(findColorToken(null), undefined)
})

test('NONE_COLOR has no theme path: it means "no colour set", not a real token', () => {
  assert.equal(NONE_COLOR.themePath, null)
  assert.equal(NONE_COLOR.value, '')
})

test('spacingClass composes the property and the scale value literally', () => {
  assert.equal(spacingClass('p', 4), 'p-4')
  assert.equal(spacingClass('gap', 0), 'gap-0')
  assert.equal(spacingClass('mt', 32), 'mt-32')
})

test('SPACING_SCALE is sorted ascending with no duplicates', () => {
  const sorted = [...SPACING_SCALE].sort((a, b) => a - b)
  assert.deepEqual([...SPACING_SCALE], sorted)
  assert.equal(new Set(SPACING_SCALE).size, SPACING_SCALE.length)
})

test('SPACING_PROPERTIES has no duplicates', () => {
  assert.equal(new Set(SPACING_PROPERTIES).size, SPACING_PROPERTIES.length)
})

test('RADIUS_SCALE starts at none and ends at full', () => {
  assert.equal(RADIUS_SCALE[0], 'none')
  assert.equal(RADIUS_SCALE.at(-1), 'full')
})

test('GRID_COLUMNS only offers values that divide a row sensibly', () => {
  for (const cols of GRID_COLUMNS) assert.ok(Number.isInteger(cols) && cols > 0)
})
