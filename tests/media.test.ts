import test from 'node:test'
import assert from 'node:assert/strict'

import { mediaFrom, mediaPath } from '../src/lib/media.ts'

/** A Payload media doc, trimmed to what `mediaFrom` reads. */
function doc(sizes: Record<string, { url: string; width?: number; height?: number }>, extra = {}) {
  return { url: '/api/media/file/original.webp', alt: '', sizes, ...extra }
}

test('mediaPath strips the dashboard origin', () => {
  // serverURL points at the dashboard host so the admin links correctly. The public
  // site must not reference it, and next/image rejects it as an unconfigured host.
  assert.equal(
    mediaPath('https://dash.body-work.pl/api/media/file/hero.webp'),
    '/api/media/file/hero.webp',
  )
})

test('mediaPath keeps a query string', () => {
  assert.equal(mediaPath('https://dash.localhost:3000/api/media/file/a.webp?v=2'), '/api/media/file/a.webp?v=2')
})

test('mediaPath passes an already relative path through', () => {
  assert.equal(mediaPath('/api/media/file/a.webp'), '/api/media/file/a.webp')
})

test('mediaPath returns null for nothing', () => {
  assert.equal(mediaPath(null), null)
  assert.equal(mediaPath(undefined), null)
  assert.equal(mediaPath(''), null)
})

test('mediaPath returns the input when it cannot be parsed', () => {
  assert.equal(mediaPath('not a url'), 'not a url')
})

test('mediaFrom returns null for anything that is not a doc', () => {
  assert.equal(mediaFrom(null, 'hero'), null)
  assert.equal(mediaFrom(undefined, 'hero'), null)
  assert.equal(mediaFrom('string', 'hero'), null)
})

test('mediaFrom returns the size that was asked for', () => {
  const resolved = mediaFrom(
    doc({ hero: { url: '/h.webp', width: 1920, height: 1080 }, card: { url: '/c.webp' } }),
    'hero',
  )
  assert.equal(resolved?.url, '/h.webp')
  assert.equal(resolved?.width, 1920)
  assert.equal(resolved?.height, 1080)
})

test('cardWide never substitutes for another size', () => {
  // The documented invariant in src/lib/media.ts: cardWide is the 16:9 crop, and a
  // cropped tile must never stand in for an in-article or hero image. It is asked
  // for by name and is deliberately absent from the fallback order.
  const resolved = mediaFrom(doc({ cardWide: { url: '/crop.webp' } }), 'hero')
  assert.notEqual(resolved?.url, '/crop.webp')
  assert.equal(resolved?.url, '/api/media/file/original.webp')
})

test('cardWide is still returned when it is the one requested', () => {
  assert.equal(mediaFrom(doc({ cardWide: { url: '/crop.webp' } }), 'cardWide')?.url, '/crop.webp')
})

test('mediaFrom falls back hero, content, card, thumbnail', () => {
  // A size is missing whenever the upload was narrower than its target, because of
  // withoutEnlargement on the collection.
  assert.equal(mediaFrom(doc({ content: { url: '/co.webp' }, card: { url: '/ca.webp' }, thumbnail: { url: '/t.webp' } }), 'hero')?.url, '/co.webp')
  assert.equal(mediaFrom(doc({ card: { url: '/ca.webp' }, thumbnail: { url: '/t.webp' } }), 'hero')?.url, '/ca.webp')
  assert.equal(mediaFrom(doc({ thumbnail: { url: '/t.webp' } }), 'hero')?.url, '/t.webp')
})

test('mediaFrom falls back to the original when no size exists', () => {
  assert.equal(mediaFrom(doc({}), 'hero')?.url, '/api/media/file/original.webp')
})

test('mediaFrom strips the origin from a size URL too', () => {
  const resolved = mediaFrom(doc({ hero: { url: 'https://dash.body-work.pl/api/media/file/h.webp' } }), 'hero')
  assert.equal(resolved?.url, '/api/media/file/h.webp')
})

test('the document alt wins, the fallback fills in', () => {
  assert.equal(mediaFrom(doc({ hero: { url: '/h.webp' } }, { alt: 'Real alt' }), 'hero', 'Post title')?.alt, 'Real alt')
  assert.equal(mediaFrom(doc({ hero: { url: '/h.webp' } }), 'hero', 'Post title')?.alt, 'Post title')
  assert.equal(mediaFrom(doc({ hero: { url: '/h.webp' } }), 'hero')?.alt, '')
})

test('blurDataURL is carried through when the import produced one', () => {
  const blur = 'data:image/webp;base64,AAAA'
  assert.equal(mediaFrom(doc({ hero: { url: '/h.webp' } }, { blurDataURL: blur }), 'hero')?.blurDataURL, blur)
  assert.equal(mediaFrom(doc({ hero: { url: '/h.webp' } }), 'hero')?.blurDataURL, undefined)
})
