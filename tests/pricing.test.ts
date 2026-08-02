import test from 'node:test'
import assert from 'node:assert/strict'

import { priceRangeFrom } from '../src/lib/pricing.ts'

test('both Polish price markers are read', () => {
  assert.deepEqual(priceRangeFrom(['Trening 240,-']), { low: 240, high: 240, count: 1 })
  assert.deepEqual(priceRangeFrom(['Trening 560zł']), { low: 560, high: 560, count: 1 })
  assert.deepEqual(priceRangeFrom(['Trening 795 zł']), { low: 795, high: 795, count: 1 })
})

test('a number without a price marker is not a price', () => {
  // The whole safety argument of this module: the pricing copy is full of incidental
  // numbers, and none of them carries a marker. Drop the marker from the regex and
  // "1,5h" starts publishing itself as 1 zł.
  assert.equal(priceRangeFrom(['Konsultacja USG + trening (1,5h)']), null)
  assert.equal(priceRangeFrom(['Karnet (pakiet 5x)']), null)
  assert.equal(priceRangeFrom(['Zajęcia grupowe, 60 minut']), null)
})

test('the range spans every amount found across the pieces of copy', () => {
  assert.deepEqual(priceRangeFrom(['1 trening 240,-\n5 treningów 1100,-', 'Pakiet 2000 zł']), {
    low: 240,
    high: 2000,
    count: 3,
  })
})

test('thousands written with a space are one amount, not two', () => {
  assert.deepEqual(priceRangeFrom(['Pakiet roczny 2 400,-']), { low: 2400, high: 2400, count: 1 })
})

test('copy that names no price at all gives null', () => {
  assert.equal(priceRangeFrom([]), null)
  assert.equal(priceRangeFrom(['Zapraszamy na konsultację']), null)
})

test('missing pieces of copy are skipped, not counted', () => {
  assert.deepEqual(priceRangeFrom([null, undefined, '', 'Trening 180,-']), {
    low: 180,
    high: 180,
    count: 1,
  })
})

test('the shared regex does not carry state between calls', () => {
  // `PRICE` is a module-level `/g` regex. `matchAll` resets `lastIndex`, but a
  // refactor to `exec` would not, and the second call would silently start midway.
  const first = priceRangeFrom(['Trening 240,-'])
  const second = priceRangeFrom(['Trening 240,-'])
  assert.deepEqual(first, second)
})
