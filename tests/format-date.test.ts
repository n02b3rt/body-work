import test from 'node:test'
import assert from 'node:assert/strict'

import {
  DISPLAY_LOCALE,
  formatDatePl,
  formatDateTimePl,
  formatDateTimeWithSecondsPl,
  parseDisplayDate,
} from '../src/lib/format-date.ts'

test('the display locale is Polish', () => {
  assert.equal(DISPLAY_LOCALE, 'pl-PL')
})

test('parseDisplayDate rejects nothing and nonsense', () => {
  assert.equal(parseDisplayDate(null), null)
  assert.equal(parseDisplayDate(undefined), null)
  assert.equal(parseDisplayDate('not a date'), null)
  assert.equal(parseDisplayDate(new Date('nope')), null)
})

test('parseDisplayDate accepts an ISO string, a Date and a timestamp', () => {
  const iso = parseDisplayDate('2026-07-26T14:30:00.000Z')
  assert.ok(iso instanceof Date)
  assert.equal(iso?.toISOString(), '2026-07-26T14:30:00.000Z')

  const now = new Date()
  assert.equal(parseDisplayDate(now)?.getTime(), now.getTime())
  assert.equal(parseDisplayDate(0)?.getTime(), 0)
})

test('dates render as DD.MM.YYYY', () => {
  // Asserted by shape rather than an exact string: the separator and digit forms are
  // ICU's, and pinning them would make the suite fail on a Node upgrade for no reason.
  assert.match(formatDatePl('2026-07-26T12:00:00.000Z'), /^\d{2}\.\d{2}\.\d{4}$/)
})

test('date and time render 24-hour, with an optional seconds variant', () => {
  assert.match(formatDateTimePl('2026-07-26T14:30:00.000Z'), /^\d{2}\.\d{2}\.\d{4}, \d{2}:\d{2}$/)
  assert.match(
    formatDateTimeWithSecondsPl('2026-07-26T14:30:05.000Z'),
    /^\d{2}\.\d{2}\.\d{4}, \d{2}:\d{2}:\d{2}$/,
  )
})

test('invalid or missing input formats to an empty string, never "Invalid Date"', () => {
  for (const format of [formatDatePl, formatDateTimePl, formatDateTimeWithSecondsPl]) {
    assert.equal(format(null), '')
    assert.equal(format(undefined), '')
    assert.equal(format('not a date'), '')
  }
})
