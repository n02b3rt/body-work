/**
 * Exercises the blog write path the admin panel uses: upload an image, create a draft,
 * publish it, confirm the hooks and the public queries behave, then remove it all again.
 *
 * Runs through the Local API, so it needs no credentials: the same code path the panel
 * uses server-side.
 *
 *   pnpm payload run scripts/smoke-blog-write.ts
 */
import { readFile } from 'fs/promises'
import path from 'path'

import { getPayload } from 'payload'
import config from '@payload-config'

const say = (line: string) => process.stdout.write(line + '\n')
const check = (label: string, ok: boolean, detail = '') =>
  say(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? ': ' + detail : ''}`)

const payload = await getPayload({ config })

let postId: number | null = null
let mediaId: number | null = null

try {
  const file = await readFile(path.resolve('public/images/instrukcja/trainers.webp'))
  const media = await payload.create({
    collection: 'media',
    data: { alt: 'Smoke test upload' } as never,
    file: { data: file, mimetype: 'image/webp', name: 'smoke-test.webp', size: file.length },
  })
  mediaId = media.id

  const sizes = Object.entries(media.sizes ?? {}).filter(
    ([, value]) => value && (value as { url?: string }).url,
  )
  check('upload accepted', Boolean(media.id))
  check(
    'four image sizes generated',
    sizes.length === 4,
    sizes.map(([name, value]) => `${name}:${(value as { width?: number }).width}w`).join(' '),
  )
  check(
    'original capped at 2560px',
    (media.width ?? 0) <= 2560 && (media.height ?? 0) <= 2560,
    `${media.width}x${media.height}`,
  )
  check('stored as webp', media.mimeType === 'image/webp', String(media.mimeType))

  const category = (await payload.find({ collection: 'categories', limit: 1 })).docs[0]
  const author = (await payload.find({ collection: 'authors', limit: 1 })).docs[0]

  const paragraph = () => ({
    type: 'paragraph',
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr',
    children: [
      {
        type: 'text',
        text: 'slowo '.repeat(140).trim(),
        format: 0,
        style: '',
        mode: 'normal',
        detail: 0,
        version: 1,
      },
    ],
  })

  const draft = await payload.create({
    collection: 'posts',
    data: {
      title: 'Smoke test: wpis kontrolny',
      content: {
        root: {
          type: 'root',
          format: '',
          indent: 0,
          version: 1,
          direction: 'ltr',
          children: [paragraph(), paragraph(), paragraph()],
        },
      },
      author: author?.id,
      categories: category ? [category.id] : undefined,
      featuredImage: mediaId,
      publishedAt: new Date().toISOString(),
      _status: 'draft',
    } as never,
  })
  postId = draft.id

  check('draft created', Boolean(draft.id))
  check('slug generated from the title', Boolean(draft.slug), String(draft.slug))
  check(
    'reading time filled in by the hook',
    (draft.readingMinutes ?? 0) >= 2,
    `${draft.readingMinutes} min for ~420 words`,
  )

  const hidden = await payload.find({
    collection: 'posts',
    where: { and: [{ slug: { equals: draft.slug } }, { _status: { not_equals: 'draft' } }] },
  })
  check('draft stays out of the public query', hidden.totalDocs === 0)

  const published = await payload.update({
    collection: 'posts',
    id: draft.id,
    data: { _status: 'published' } as never,
  })
  check('publish succeeded', published._status === 'published')

  const visible = await payload.find({
    collection: 'posts',
    depth: 1,
    where: { and: [{ slug: { equals: draft.slug } }, { _status: { not_equals: 'draft' } }] },
  })
  check('visible to the public query once published', visible.totalDocs === 1)
  check('author relationship populated', typeof visible.docs[0]?.author === 'object')
  check('featured image populated', typeof visible.docs[0]?.featuredImage === 'object')

  const listing = await fetch('http://localhost:3000/blog').then((r) => r.text())
  check('shows up on /blog', listing.includes('Smoke test'))

  const response = await fetch(`http://localhost:3000/blog/${draft.slug}`)
  const html = await response.text()
  check('post page renders', response.status === 200 && html.includes('blog-prose'))
  check('no dashboard host in the markup', !html.includes('dash.localhost'))
} finally {
  if (postId) {
    await payload.delete({ collection: 'posts', id: postId })
    say('cleanup: test post deleted')
  }
  if (mediaId) {
    await payload.delete({ collection: 'media', id: mediaId })
    say('cleanup: test upload deleted')
  }
}

process.exit(0)
