import test from 'node:test'
import assert from 'node:assert/strict'

import { computeDropPosition } from '../src/components/builder/editor/drop-position.ts'

const target = { top: 100, height: 40 } // spans 100..140

test('the top quarter is "before", inside allowed or not', () => {
  assert.equal(computeDropPosition({ top: 95, height: 10 }, target, true), 'before') // center 100 -> relative 0
  assert.equal(computeDropPosition({ top: 95, height: 10 }, target, false), 'before')
})

test('the bottom quarter is "after"', () => {
  assert.equal(computeDropPosition({ top: 135, height: 10 }, target, true), 'after') // center 140 -> relative 1
  assert.equal(computeDropPosition({ top: 135, height: 10 }, target, false), 'after')
})

test('the middle half is "inside" only when the target can contain the dragged type', () => {
  assert.equal(computeDropPosition({ top: 115, height: 10 }, target, true), 'inside') // center 120 -> relative 0.5
  assert.equal(computeDropPosition({ top: 115, height: 10 }, target, false), 'after')
})

test('a leaf target (cannot be inside) splits evenly at the midpoint', () => {
  assert.equal(computeDropPosition({ top: 105, height: 4 }, target, false), 'before') // center 107 -> relative 0.175
  assert.equal(computeDropPosition({ top: 125, height: 4 }, target, false), 'after') // center 127 -> relative 0.675
})

test('a zero-height target does not divide by zero: relative is treated as the midpoint', () => {
  const zeroHeight = { top: 50, height: 0 }
  assert.equal(computeDropPosition({ top: 40, height: 10 }, zeroHeight, true), 'inside')
  assert.equal(computeDropPosition({ top: 40, height: 10 }, zeroHeight, false), 'after')
})
