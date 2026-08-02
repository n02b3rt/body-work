import test from 'node:test'
import assert from 'node:assert/strict'

import { formatSlug } from '../src/lib/format-slug.ts'

test('Polish diacritics become ASCII', () => {
  // Most decompose under NFD and lose their combining mark. "ł" does not, which is
  // why the implementation special-cases it: drop that line and slugs keep a "ł".
  assert.equal(formatSlug('Łódź'), 'lodz')
  assert.equal(formatSlug('Zdrowy brzuch: ćwiczenia'), 'zdrowy-brzuch-cwiczenia')
  assert.equal(formatSlug('Gęś ŻÓŁW ąęćńśźż'), 'ges-zolw-aecnszz')
})

test('runs of non-alphanumerics collapse into one dash', () => {
  assert.equal(formatSlug('a   b'), 'a-b')
  assert.equal(formatSlug('a -- b'), 'a-b')
  assert.equal(formatSlug('Trening / w parze'), 'trening-w-parze')
})

test('leading and trailing dashes are trimmed', () => {
  assert.equal(formatSlug('  hello  '), 'hello')
  assert.equal(formatSlug('!!!hello!!!'), 'hello')
  assert.equal(formatSlug('---'), '')
})

test('digits survive, everything else is dropped', () => {
  assert.equal(formatSlug('Plan 2026 (nowy)'), 'plan-2026-nowy')
})

test('the result is capped at 120 characters', () => {
  const slug = formatSlug('a'.repeat(200))
  assert.equal(slug.length, 120)
})

test('empty input gives an empty slug', () => {
  assert.equal(formatSlug(''), '')
  assert.equal(formatSlug('   '), '')
})
