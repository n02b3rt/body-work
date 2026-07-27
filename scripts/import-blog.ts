/**
 * One-off migration: the 62 scraped blog posts -> Payload.
 *
 * Run with Payload's own runner so the config and env are loaded:
 *
 *   pnpm payload run scripts/import-blog.ts              # everything
 *   pnpm payload run scripts/import-blog.ts -- --limit 3 # trial slice
 *   pnpm payload run scripts/import-blog.ts -- --force   # re-import existing slugs
 *
 * Idempotent by slug: an existing post is skipped unless --force, in which case it is
 * updated in place. Media and authors are deduplicated by the scrape's own hash, so a
 * re-run doesn't pile up copies.
 *
 * Parsing goes through jsdom rather than regexes on purpose: the page-builder emits class
 * names like `[>ul]:f3s4`, and the `>` inside an attribute breaks any naive tag stripper —
 * CSS soup then leaks into what looks like body text.
 */
import { randomUUID } from 'crypto'
import { existsSync } from 'fs'
import { readFile, readdir } from 'fs/promises'
import path from 'path'

import { convertHTMLToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import { getPayload } from 'payload'
import config from '@payload-config'

/** jsdom is imported dynamically: a static import gets hoisted and `require()`d by
 * Payload's tsx-based runner, and jsdom 30 pulls an ESM-only dependency that then blows
 * up with ERR_REQUIRE_ESM. A dynamic import stays in ESM. */
type JSDOMCtor = new (html: string, options?: { virtualConsole?: unknown }) => {
  window: { document: Document }
}

/** Parses to a document, with jsdom's CSS warnings silenced. Passed around as a plain
 * factory rather than a constructor — the wrapper isn't newable. */
type ParseHTML = (html: string) => { window: { document: Document } }

const SCRAPE = path.resolve('scripts/scrape/scraped')
const BLOG = path.join(SCRAPE, 'blog')
const AUTHORS_DIR = path.join(SCRAPE, 'content', '_autors')

/** Builder category id -> display name, read off the listing's filter select. */
const CATEGORY_NAMES: Record<string, string> = {
  '84pnUXVxG': 'Fizjoterapia',
  '84o42ua9K': 'Masaż',
  '84obvLpkY': 'Trening',
  '84ua64YcM': 'Dietetyka',
}

const argv = process.argv.slice(2)
const FORCE = argv.includes('--force')
const LIMIT = (() => {
  const i = argv.indexOf('--limit')
  return i >= 0 && argv[i + 1] ? Number(argv[i + 1]) : Infinity
})()

const HASH = /\/([0-9A-Za-z]{9})[-.]/

function hashOf(src: string): string | null {
  return HASH.exec(src)?.[1] ?? null
}

/** The scraped `<picture>` markup sometimes leaves the `<img src>` empty while the
 * sibling `<source srcset>` holds the real file — six posts lost every image to that.
 * Falls back to the srcset when the img itself carries nothing usable. */
function imageSourceOf(img: Element): string {
  const src = img.getAttribute('src') ?? ''
  if (hashOf(src)) return src
  const picture = img.closest('picture')
  for (const source of Array.from(picture?.querySelectorAll('source') ?? [])) {
    const srcset = source.getAttribute('srcset') ?? ''
    if (hashOf(srcset)) return srcset
  }
  return src
}

/** `DD.MM.YYYY` -> ISO. */
function parseDate(value: string): string | null {
  const m = /(\d{2})\.(\d{2})\.(\d{4})/.exec(value)
  if (!m) return null
  const [, d, mo, y] = m
  const date = new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d)))
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

async function findMediaFile(dir: string, hash: string): Promise<string | null> {
  if (!existsSync(dir)) return null
  const files = await readdir(dir)
  // Skip the `__<digest>` duplicates the scraper leaves behind — byte-identical copies.
  const match = files.find((f) => f.startsWith(hash + '.') && !f.includes('__'))
  return match ? path.join(dir, match) : null
}

type PostMeta = {
  slug: string
  title: string
  date: string | null
  readingMinutes: number | null
  authorName: string | null
  authorRole: string | null
  authorHash: string | null
  authorPhotoHash: string | null
  excerpt: string | null
  /** Body as an ordered list of chunks: HTML runs and images. */
  blocks: Array<{ kind: 'html'; html: string } | { kind: 'image'; hash: string }>
}

function extractPost(parse: ParseHTML, slug: string, html: string): PostMeta | null {
  const { document } = parse(html).window
  const main = document.querySelector('main')
  if (!main) return null

  // Strip everything that isn't the article: the shared footer, the promo aside, the
  // breadcrumb, and the author card (its role line would otherwise read as body copy).
  main.querySelectorAll('footer, aside, nav').forEach((el) => el.remove())

  // Author: the card holds three leaf elements — "AUTOR:", the name, then the role.
  // Reading them structurally beats regexing the concatenated text, which produced
  // fragments like "& Jakub Grzęda" as a job title.
  const authorImg = main.querySelector('img[src*="_autors"], source[srcset*="_autors"]')
  let authorHash: string | null = null
  let authorPhotoHash: string | null = null
  let authorName: string | null = null
  let authorRole: string | null = null
  let authorCard: Element | null = null

  if (authorImg) {
    const src = authorImg.getAttribute('src') ?? authorImg.getAttribute('srcset') ?? ''
    const parts = src.split('/').filter(Boolean)
    const idx = parts.indexOf('_autors')
    // .../_autors/<authorFolder>/images/<imageHash>/<imageHash>-160w.webp
    authorHash = idx >= 0 ? (parts[idx + 1] ?? null) : null
    authorPhotoHash = idx >= 0 ? (parts[idx + 3] ?? null) : null

  }

  // The card is located by its "AUTOR:" label rather than by the photo: 14 of the posts
  // carry the label with no author image at all, and anchoring on the image left those
  // without a name.
  const label = Array.from(main.querySelectorAll('*')).find(
    (el) => el.children.length === 0 && /^AUTOR:?$/i.test((el.textContent ?? '').trim()),
  )
  if (label) {
    authorCard = label.parentElement
    for (let i = 0; i < 4 && authorCard; i++) {
      const leaves = Array.from(authorCard.querySelectorAll('*'))
        .filter((el) => el.children.length === 0)
        .map((el) => (el.textContent ?? '').replace(/\s+/g, ' ').trim())
        .filter(Boolean)
      const marker = leaves.findIndex((text) => /^AUTOR:?$/i.test(text))
      if (marker >= 0 && leaves[marker + 1]) {
        // Two posts don't split name from prose in the source: one has a whole sentence
        // where the name goes, another credits two people. Cutting at the first comma
        // handles both — "Krzysztof Stępień, nasz kolega i klient…" keeps just the name,
        // while "Karol Kikut & Jakub Grzęda" has no comma and stays intact as a joint
        // credit, which is the honest representation given one author per post.
        const raw = leaves[marker + 1]
        const comma = raw.indexOf(',')
        authorName = (comma > 0 ? raw.slice(0, comma) : raw).trim()
        const trailing = comma > 0 ? raw.slice(comma + 1).trim() : ''
        authorRole = [trailing, leaves[marker + 2] ?? ''].filter(Boolean).join(' ').trim() || null
        break
      }
      authorCard = authorCard.parentElement
    }
  }

  const wholeText = (main.textContent ?? '').replace(/\s+/g, ' ')

  const h1 = main.querySelector('h1')
  const title = (h1?.textContent ?? '').replace(/\s+/g, ' ').trim()
  if (!title) return null

  const date = parseDate(wholeText)
  const minutes = /(\d+)\s*min\b/.exec(wholeText)

  // Both are removed before the body is collected: the title is rendered separately, and
  // the author card's role line would otherwise read as a body paragraph.
  //
  // The length guard matters: on `north-pole-marathon` the "AUTOR:" label sits inside a
  // wrapper that also holds the whole article, and removing it wiped the post's body.
  // A real author card is a name plus a job title — a few dozen characters.
  const AUTHOR_CARD_MAX_CHARS = 400
  if (authorCard && (authorCard.textContent ?? '').trim().length <= AUTHOR_CARD_MAX_CHARS) {
    authorCard.remove()
  }
  if (h1) h1.remove()

  // The body is the linear run of content elements in document order. Taking them
  // directly, rather than guessing which wrapper div is "the article", sidesteps the
  // page-builder's nesting entirely.
  const nodes = Array.from(
    main.querySelectorAll('h2, h3, h4, p, ol, ul, blockquote, table, img'),
  ).filter((el) => {
    if (el.closest('footer, aside, nav')) return false
    // Skip images that are site chrome or an author photo.
    if (el.tagName === 'IMG') {
      const src = imageSourceOf(el)
      if (/_autors|logo|icon|menu-close|breadcrumb|favicon|apple-touch/i.test(src)) return false
      return Boolean(hashOf(src))
    }
    // Skip elements nested inside another element we already take (e.g. p inside li).
    if (el.parentElement?.closest('ol, ul, blockquote, table')) return false
    const text = (el.textContent ?? '').trim()
    return text.length > 0
  })

  const blocks: PostMeta['blocks'] = []
  let buffer: string[] = []
  const flush = () => {
    if (buffer.length) {
      blocks.push({ kind: 'html', html: buffer.join('\n') })
      buffer = []
    }
  }
  for (const el of nodes) {
    if (el.tagName === 'IMG') {
      const hash = hashOf(imageSourceOf(el))
      if (hash) {
        flush()
        blocks.push({ kind: 'image', hash })
      }
      continue
    }
    // Drop attributes: the page-builder's class soup is meaningless here and the
    // converter only cares about tags.
    const clone = el.cloneNode(true) as Element
    clone.querySelectorAll('*').forEach((child) => {
      for (const attr of Array.from(child.attributes)) {
        if (!['href', 'src'].includes(attr.name)) child.removeAttribute(attr.name)
      }
    })
    for (const attr of Array.from(clone.attributes)) {
      if (!['href', 'src'].includes(attr.name)) clone.removeAttribute(attr.name)
    }
    buffer.push(clone.outerHTML)
  }
  flush()

  const firstParagraph = nodes.find((el) => el.tagName === 'P')
  const excerpt = firstParagraph
    ? (firstParagraph.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 300)
    : null

  return {
    slug,
    title,
    date,
    readingMinutes: minutes ? Number(minutes[1]) : null,
    authorName,
    authorRole,
    authorHash,
    authorPhotoHash,
    excerpt,
    blocks,
  }
}

/** slug -> builder category ids, read off the listing's cards. */
function extractCategories(parse: ParseHTML, listingHtml: string): Map<string, string[]> {
  const { document } = parse(listingHtml).window
  const out = new Map<string, string[]>()
  for (const card of Array.from(document.querySelectorAll('[data-category]'))) {
    const ids = (card.getAttribute('data-category') ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    const link = card.querySelector('a[href]')
    const href = link?.getAttribute('href') ?? ''
    const slug = href.replace(/[?#].*$/, '').replace(/\/$/, '').split('/').filter(Boolean).pop()
    if (slug) out.set(slug, ids)
  }
  return out
}

async function main() {
  const jsdom = (await import('jsdom')) as unknown as {
    JSDOM: JSDOMCtor
    VirtualConsole: new () => unknown
  }
  const { JSDOM } = jsdom
  // The scraped pages carry CSS jsdom can't parse; its warnings are pure noise here.
  const quietConsole = new jsdom.VirtualConsole()
  const parse: ParseHTML = (html: string) => new JSDOM(html, { virtualConsole: quietConsole })
  const payload = await getPayload({ config })
  const editorConfig = await editorConfigFactory.default({ config: payload.config })

  // ---------------------------------------------------------------- categories
  const categoryIds = new Map<string, number>()
  for (const [builderId, title] of Object.entries(CATEGORY_NAMES)) {
    const found = await payload.find({ collection: 'categories', where: { title: { equals: title } }, limit: 1 })
    const doc = found.docs[0] ?? (await payload.create({ collection: 'categories', data: { title } as never }))
    categoryIds.set(builderId, doc.id)
  }
  payload.logger.info(`categories ready: ${categoryIds.size}`)

  const listing = await readFile(path.join(BLOG, 'index.html'), 'utf8')
  const categoriesBySlug = extractCategories(parse, listing)
  payload.logger.info(`listing supplied categories for ${categoriesBySlug.size} slugs`)

  // ---------------------------------------------------------------- media cache
  const mediaByHash = new Map<string, number>()
  async function uploadMedia(filePath: string, hash: string, alt: string): Promise<number> {
    const cached = mediaByHash.get(hash)
    if (cached) return cached
    const existing = await payload.find({
      collection: 'media',
      where: { filename: { like: hash } },
      limit: 1,
    })
    if (existing.docs[0]) {
      mediaByHash.set(hash, existing.docs[0].id)
      return existing.docs[0].id
    }
    const data = await readFile(filePath)
    const doc = await payload.create({
      collection: 'media',
      data: { alt } as never,
      file: {
        data,
        mimetype: filePath.endsWith('.png')
          ? 'image/png'
          : filePath.endsWith('.webp')
            ? 'image/webp'
            : 'image/jpeg',
        name: path.basename(filePath),
        size: data.length,
      },
    })
    mediaByHash.set(hash, doc.id)
    return doc.id
  }

  // ---------------------------------------------------------------- authors
  const authorIds = new Map<string, number>()
  async function ensureAuthor(meta: PostMeta) {
    if (!meta.authorName) return null
    const key = meta.authorHash ?? meta.authorName
    const cached = authorIds.get(key)
    if (cached) return cached

    const existing = await payload.find({
      collection: 'authors',
      where: { name: { equals: meta.authorName } },
      limit: 1,
    })

    let photo: number | null = null
    if (meta.authorHash && meta.authorPhotoHash) {
      const dir = path.join(AUTHORS_DIR, meta.authorHash, 'images', meta.authorPhotoHash)
      const file = await findMediaFile(dir, meta.authorPhotoHash)
      if (file) photo = await uploadMedia(file, meta.authorPhotoHash, meta.authorName)
    }

    // Backfill rather than skip: a re-run must be able to add a photo or role that an
    // earlier, buggier pass failed to resolve.
    if (existing.docs[0]) {
      const current = existing.docs[0]
      const patch: Record<string, unknown> = {}
      if (photo && !current.photo) patch.photo = photo
      // Overwrite rather than backfill: an earlier pass of this script stored
      // regex-derived fragments as roles, and the scrape is what's authoritative.
      if (meta.authorRole && current.role !== meta.authorRole) patch.role = meta.authorRole
      if (Object.keys(patch).length) {
        await payload.update({ collection: 'authors', id: current.id, data: patch as never })
        payload.logger.info(`author updated: ${meta.authorName} (${Object.keys(patch).join(', ')})`)
      }
      authorIds.set(key, current.id)
      return current.id
    }

    const doc = await payload.create({
      collection: 'authors',
      data: {
        name: meta.authorName,
        role: meta.authorRole ?? undefined,
        ...(photo ? { photo } : {}),
      } as never,
    })
    authorIds.set(key, doc.id)
    payload.logger.info(`author created: ${meta.authorName}${photo ? ' (with photo)' : ''}`)
    return doc.id
  }

  // ---------------------------------------------------------------- posts
  const slugs = (await readdir(BLOG, { withFileTypes: true }))
    .filter((e) => e.isDirectory() && e.name !== 'media')
    .map((e) => e.name)
    .sort()

  let created = 0
  let updated = 0
  let skipped = 0
  const problems: string[] = []

  for (const slug of slugs.slice(0, LIMIT)) {
    const file = path.join(BLOG, slug, 'index.html')
    if (!existsSync(file)) {
      problems.push(`${slug}: no index.html`)
      continue
    }

    const existing = await payload.find({ collection: 'posts', where: { slug: { equals: slug } }, limit: 1 })
    if (existing.docs[0] && !FORCE) {
      skipped++
      continue
    }

    const meta = extractPost(parse, slug, await readFile(file, 'utf8'))
    if (!meta) {
      problems.push(`${slug}: could not parse`)
      continue
    }

    const authorId = await ensureAuthor(meta)

    // Images first, so the Lexical tree can reference real Media ids.
    const mediaDir = path.join(BLOG, slug, 'media')
    const uploaded = new Map<string, number>()
    for (const block of meta.blocks) {
      if (block.kind !== 'image' || uploaded.has(block.hash)) continue
      const filePath = await findMediaFile(mediaDir, block.hash)
      if (!filePath) {
        problems.push(`${slug}: image ${block.hash} not found on disk`)
        continue
      }
      uploaded.set(block.hash, await uploadMedia(filePath, block.hash, meta.title))
    }

    // Build the body: convert each HTML run, splice upload nodes between them.
    const children: unknown[] = []
    for (const block of meta.blocks) {
      if (block.kind === 'image') {
        const value = uploaded.get(block.hash)
        if (!value) continue
        children.push({
          type: 'upload',
          relationTo: 'media',
          value,
          fields: {},
          id: randomUUID(),
          format: '',
          version: 3,
        })
        continue
      }
      const converted = convertHTMLToLexical({ editorConfig, html: block.html, JSDOM })
      children.push(...(converted.root.children ?? []))
    }

    const content = {
      root: {
        type: 'root',
        format: '',
        indent: 0,
        version: 1,
        direction: 'ltr',
        children,
      },
    }

    const categories = (categoriesBySlug.get(slug) ?? [])
      .map((builderId) => categoryIds.get(builderId))
      .filter((v): v is number => Boolean(v))

    const featured = meta.blocks.find((b) => b.kind === 'image') as { hash: string } | undefined
    const featuredImage = featured ? uploaded.get(featured.hash) : undefined

    const data = {
      title: meta.title,
      slug,
      excerpt: meta.excerpt ?? undefined,
      content: content as never,
      ...(featuredImage ? { featuredImage } : {}),
      ...(meta.date ? { publishedAt: meta.date } : {}),
      ...(authorId ? { author: authorId } : {}),
      ...(categories.length ? { categories } : {}),
      ...(meta.readingMinutes ? { readingMinutes: meta.readingMinutes } : {}),
      _status: 'published' as const,
    }

    if (existing.docs[0]) {
      await payload.update({ collection: 'posts', id: existing.docs[0].id, data: data as never })
      updated++
    } else {
      await payload.create({ collection: 'posts', data: data as never })
      created++
    }
    payload.logger.info(
      `${existing.docs[0] ? 'updated' : 'created'} ${slug} — ${meta.blocks.length} blocks, ` +
        `${uploaded.size} images, author=${meta.authorName ?? '—'}, cats=${categories.length}`,
    )
  }

  payload.logger.info(
    `\ndone. created ${created}, updated ${updated}, skipped ${skipped}, ` +
      `media ${mediaByHash.size}, authors ${authorIds.size}`,
  )
  if (problems.length) {
    payload.logger.warn(`${problems.length} problem(s):`)
    for (const p of problems) payload.logger.warn('  ' + p)
  }
  process.exit(0)
}

await main()
