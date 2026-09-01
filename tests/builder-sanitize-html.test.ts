import test from 'node:test'
import assert from 'node:assert/strict'

import { sanitizeBuilderHtml } from '../src/lib/builder/sanitize-html.ts'

test('allowed tags pass through unchanged', () => {
  assert.equal(sanitizeBuilderHtml('<p>Hello <strong>world</strong></p>'), '<p>Hello <strong>world</strong></p>')
  assert.equal(sanitizeBuilderHtml('<ul><li>one</li><li>two</li></ul>'), '<ul><li>one</li><li>two</li></ul>')
})

test('a script tag is removed along with its content', () => {
  assert.equal(sanitizeBuilderHtml('<p>hi</p><script>alert(1)</script>'), '<p>hi</p>')
})

test('an onerror-style attribute is dropped: no tag here keeps attributes except <a>', () => {
  assert.equal(sanitizeBuilderHtml('<p onclick="evil()">hi</p>'), '<p>hi</p>')
})

test('an unlisted tag is stripped but its text survives', () => {
  assert.equal(sanitizeBuilderHtml('<div>kept text</div>'), 'kept text')
  assert.equal(sanitizeBuilderHtml('<h1>heading text</h1>'), 'heading text')
})

test('a safe href on <a> is kept, rebuilt with no other attributes', () => {
  assert.equal(
    sanitizeBuilderHtml('<a href="https://body-work.pl" onclick="evil()">link</a>'),
    '<a href="https://body-work.pl">link</a>',
  )
})

test('a javascript: href is dropped, the link text is not', () => {
  assert.equal(sanitizeBuilderHtml('<a href="javascript:alert(1)">click</a>'), '<a>click</a>')
})

test('target="_blank" gains rel="noopener noreferrer"; another target value is dropped', () => {
  assert.equal(
    sanitizeBuilderHtml('<a href="/x" target="_blank">go</a>'),
    '<a href="/x" target="_blank" rel="noopener noreferrer">go</a>',
  )
  assert.equal(sanitizeBuilderHtml('<a href="/x" target="_top">go</a>'), '<a href="/x">go</a>')
})

test('br is normalised regardless of how it was written', () => {
  assert.equal(sanitizeBuilderHtml('a<br/>b<br>c<br />d'), 'a<br>b<br>c<br>d')
})

test('non-string or empty input returns an empty string', () => {
  assert.equal(sanitizeBuilderHtml(null), '')
  assert.equal(sanitizeBuilderHtml(undefined), '')
  assert.equal(sanitizeBuilderHtml(42), '')
  assert.equal(sanitizeBuilderHtml(''), '')
})

test('an svg smuggling a script is removed wholesale', () => {
  assert.equal(sanitizeBuilderHtml('<p>x</p><svg><script>alert(1)</script></svg>'), '<p>x</p>')
})
