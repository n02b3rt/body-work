import test from 'node:test'
import assert from 'node:assert/strict'

import { getDisplayName } from '../src/lib/users/display-name.ts'
import { generateStrongPassword } from '../src/lib/users/password.ts'
import { stripPolish } from '../src/lib/users/slugify-pl.ts'

test('stripPolish maps Polish diacritics to ASCII', () => {
  assert.equal(stripPolish('Zażółć gęślą jaźń'), 'zazolcgeslajazn')
  assert.equal(stripPolish('Łukasz'), 'lukasz')
})

test('stripPolish handles the other Latin diacritics the map covers', () => {
  assert.equal(stripPolish('Straße'), 'strasse')
  assert.equal(stripPolish('Dvořák'), 'dvorak')
  assert.equal(stripPolish('Müller'), 'muller')
})

test('stripPolish keeps letters and digits and drops everything else', () => {
  assert.equal(stripPolish('  Jan Kowalski-2  '), 'jankowalski2')
  assert.equal(stripPolish('a.b@c!d'), 'abcd')
  assert.equal(stripPolish(''), '')
  assert.equal(stripPolish('!!!'), '')
})

test('generateStrongPassword has the default length and never goes below eight', () => {
  assert.equal(generateStrongPassword().length, 20)
  assert.equal(generateStrongPassword(32).length, 32)
  assert.equal(generateStrongPassword(4).length, 8)
})

test('generateStrongPassword always carries all four character classes', () => {
  // The generator is hand-rolled crypto rather than a dependency, so this guarantee
  // is ours to keep. Run it enough times that a shuffle bug cannot hide.
  for (let i = 0; i < 200; i += 1) {
    const password = generateStrongPassword(8)
    assert.match(password, /[a-z]/, password)
    assert.match(password, /[A-Z]/, password)
    assert.match(password, /[0-9]/, password)
    assert.match(password, /[!@#$%^&*\-_=+]/, password)
  }
})

test('generateStrongPassword does not repeat itself', () => {
  const seen = new Set(Array.from({ length: 50 }, () => generateStrongPassword()))
  assert.equal(seen.size, 50)
})

test('getDisplayName prefers the full name', () => {
  assert.equal(getDisplayName({ firstName: 'Jan', lastName: 'Kowalski', username: 'jkowalski' }), 'Jan Kowalski')
  assert.equal(getDisplayName({ firstName: 'Jan', username: 'jkowalski' }), 'Jan')
  assert.equal(getDisplayName({ lastName: 'Kowalski', username: 'jkowalski' }), 'Kowalski')
})

test('getDisplayName falls back to username, then email', () => {
  assert.equal(getDisplayName({ username: 'jkowalski', email: 'jan@example.com' }), 'jkowalski')
  assert.equal(getDisplayName({ email: 'jan@example.com' }), 'jan@example.com')
})

test('getDisplayName treats whitespace as absent and never returns undefined', () => {
  assert.equal(getDisplayName({ firstName: '  ', lastName: '  ', username: 'jk' }), 'jk')
  assert.equal(getDisplayName({ username: '   ', email: 'jan@example.com' }), 'jan@example.com')
  assert.equal(getDisplayName({}), '')
  assert.equal(getDisplayName(null), '')
  assert.equal(getDisplayName(undefined), '')
})
