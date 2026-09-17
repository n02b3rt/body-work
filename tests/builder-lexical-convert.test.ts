import test from 'node:test'
import assert from 'node:assert/strict'

import {
  convertLexicalToBuilderDoc,
  convertLexicalToBuilderNodes,
  type LexicalNode,
  type LexicalRichText,
} from '../src/lib/builder/convert/lexical-to-builder.ts'

/** Minimal fixtures matching the real shape Payload's Lexical field stores. */
const text = (value: string, format = 0): LexicalNode => ({ type: 'text', text: value, format })
const paragraph = (...children: LexicalNode[]): LexicalNode => ({ type: 'paragraph', children })
const heading = (tag: string, ...children: LexicalNode[]): LexicalNode => ({ type: 'heading', tag, children })
const link = (url: string, ...children: LexicalNode[]): LexicalNode => ({ type: 'link', url, children })
const upload = (id: number): LexicalNode => ({ type: 'upload', value: { id } })
const listItem = (...children: LexicalNode[]): LexicalNode => ({ type: 'listitem', children })
const list = (listType: string, ...items: LexicalNode[]): LexicalNode => ({
  type: 'list',
  listType,
  children: items,
})
const root = (...children: LexicalNode[]): LexicalRichText => ({ root: { children } })

test('a plain paragraph becomes a text node wrapped in <p>', () => {
  const { nodes } = convertLexicalToBuilderNodes(root(paragraph(text('Witaj świecie'))))
  assert.equal(nodes.length, 1)
  assert.equal(nodes[0]?.type, 'text')
  assert.equal(nodes[0]?.props.html, '<p>Witaj świecie</p>')
})

test('bold and italic formatting survive as <strong>/<em>', () => {
  const { nodes } = convertLexicalToBuilderNodes(
    root(paragraph(text('bold', 1), text(' and '), text('italic', 2))),
  )
  assert.equal(nodes[0]?.props.html, '<p><strong>bold</strong> and <em>italic</em></p>')
})

test('a link keeps its href and inner text', () => {
  const { nodes } = convertLexicalToBuilderNodes(
    root(paragraph(text('visit '), link('https://body-work.pl', text('us')))),
  )
  assert.equal(nodes[0]?.props.html, '<p>visit <a href="https://body-work.pl">us</a></p>')
})

test('text is HTML-escaped so a literal < or & cannot break the markup', () => {
  const { nodes } = convertLexicalToBuilderNodes(root(paragraph(text('a < b & c'))))
  assert.equal(nodes[0]?.props.html, '<p>a &lt; b &amp; c</p>')
})

test('a linebreak becomes <br>', () => {
  const { nodes } = convertLexicalToBuilderNodes(
    root(paragraph(text('one'), { type: 'linebreak' }, text('two'))),
  )
  assert.equal(nodes[0]?.props.html, '<p>one<br>two</p>')
})

test('an empty paragraph is dropped, not converted into a blank node', () => {
  const { nodes } = convertLexicalToBuilderNodes(root(paragraph()))
  assert.equal(nodes.length, 0)
})

test('a heading becomes a heading node with the right level in a11y.headingLevel', () => {
  const { nodes } = convertLexicalToBuilderNodes(root(heading('h3', text('Section title'))))
  assert.equal(nodes[0]?.type, 'heading')
  assert.equal(nodes[0]?.props.html, 'Section title')
  assert.equal(nodes[0]?.a11y?.headingLevel, 3)
})

test('an unrecognised heading tag falls back to level 2', () => {
  const { nodes } = convertLexicalToBuilderNodes(root(heading('h9', text('x'))))
  assert.equal(nodes[0]?.a11y?.headingLevel, 2)
})

test('an upload node becomes an image node with the media id carried over', () => {
  const { nodes } = convertLexicalToBuilderNodes(root(upload(42)))
  assert.equal(nodes[0]?.type, 'image')
  assert.equal(nodes[0]?.props.mediaId, 42)
})

test('a horizontal rule becomes a divider', () => {
  const { nodes } = convertLexicalToBuilderNodes(root({ type: 'horizontalrule' }))
  assert.equal(nodes[0]?.type, 'divider')
})

test('a bullet list becomes a list node with one item per <li>, no report entry', () => {
  const { nodes, report } = convertLexicalToBuilderNodes(
    root(list('bullet', listItem(text('First')), listItem(text('Second')))),
  )
  assert.equal(nodes[0]?.type, 'list')
  assert.deepEqual(nodes[0]?.props.items, [
    { icon: 'check', html: 'First' },
    { icon: 'check', html: 'Second' },
  ])
  assert.equal(report.numberedListsFlattened, 0)
})

test('a numbered list converts but is flagged as flattened', () => {
  const { nodes, report } = convertLexicalToBuilderNodes(
    root(list('number', listItem(text('First')), listItem(text('Second')))),
  )
  assert.equal(nodes[0]?.type, 'list')
  assert.equal(report.numberedListsFlattened, 1)
})

test('a quote converts to a text node: the words survive, the styling does not', () => {
  const { nodes } = convertLexicalToBuilderNodes(root({ type: 'quote', children: [text('A quote')] }))
  assert.equal(nodes[0]?.type, 'text')
  assert.equal(nodes[0]?.props.html, '<p>A quote</p>')
})

test('an unrecognised block type is skipped and named in the report, not guessed at', () => {
  const { nodes, report } = convertLexicalToBuilderNodes(root({ type: 'table', children: [] }))
  assert.equal(nodes.length, 0)
  assert.deepEqual(report.skipped, ['table'])
})

test('an empty or missing document converts to zero nodes with an empty report', () => {
  assert.deepEqual(convertLexicalToBuilderNodes(null), {
    nodes: [],
    report: { skipped: [], numberedListsFlattened: 0 },
  })
  assert.deepEqual(convertLexicalToBuilderNodes(undefined).nodes, [])
  assert.deepEqual(convertLexicalToBuilderNodes({}).nodes, [])
})

test('convertLexicalToBuilderDoc wraps every block in one section under root', () => {
  const { doc } = convertLexicalToBuilderDoc(
    root(heading('h2', text('Title')), paragraph(text('Body copy'))),
  )
  const sectionId = doc.nodes[doc.root]?.children[0]
  assert.ok(sectionId)
  const section = doc.nodes[sectionId!]
  assert.equal(section?.type, 'section')
  assert.equal(section?.children.length, 2)
  assert.equal(doc.nodes[section!.children[0]!]?.type, 'heading')
  assert.equal(doc.nodes[section!.children[1]!]?.type, 'text')
})

test('every generated node id within one document is unique', () => {
  const { doc } = convertLexicalToBuilderDoc(
    root(paragraph(text('a')), paragraph(text('b')), paragraph(text('c'))),
  )
  // Every id is a distinct map key by construction; this only catches a generator
  // that produced the *same* id twice and silently overwrote a node.
  assert.equal(Object.keys(doc.nodes).length, 1 /* root */ + 1 /* section */ + 3 /* paragraphs */)
})

test('generated ids differ across separate conversion calls (the "root" id excepted, one per document)', () => {
  const first = convertLexicalToBuilderDoc(root(paragraph(text('a')))).doc
  const second = convertLexicalToBuilderDoc(root(paragraph(text('b')))).doc
  const firstIds = Object.keys(first.nodes).filter((id) => id !== 'root')
  const secondIds = Object.keys(second.nodes).filter((id) => id !== 'root')
  assert.equal(firstIds.some((id) => secondIds.includes(id)), false)
})
