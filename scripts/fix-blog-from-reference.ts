/**
 * Repairs the three fields `import-blog.ts` got from the wrong place: `featuredImage`,
 * `excerpt` and `publishedAt`.
 *
 * Run with: `pnpm payload run scripts/fix-blog-from-reference.ts`
 * Report without writing: `DRY=1 pnpm payload run scripts/fix-blog-from-reference.ts`
 *
 * **The dry switch is an env var, not a flag, and that matters.** Payload's CLI strips extra
 * argv, so `--dry` silently arrived as "not dry" and the first "dry run" of this script
 * wrote all 62 posts. An env var is the only thing that survives `payload run`.
 *
 * **Why this exists.** `import-blog.ts` read all three out of the article body, which is the
 * wrong source. On the reference, a post's thumbnail and its listing blurb are separate
 * fields that need not appear in the article at all. The damage, measured:
 *
 * - **0 of 62** thumbnails matched: every post was illustrated by whatever picture happened
 *   to come first in its text.
 * - **51 of 62** excerpts differed, and **48 ended mid-sentence**, because the body's first
 *   paragraph was cut to a character budget rather than the real blurb being used.
 * - one post the reference leaves undated got the date the import ran on, which then sorted
 *   it above everything else on the listing.
 *
 * The listing page is the authoritative source: each card carries an escaped-JSON
 * `data-content` attribute whose `images1[0]` *is* the thumbnail, next to
 * `short_description`, `date_published` and `time`.
 *
 * The images the import wrongly promoted are genuine in-content images, so they stay in
 * Media and keep rendering inside the articles. Only the pointer changes.
 */
import path from 'path'
import { readFileSync, existsSync } from 'fs'
import { getPayload } from 'payload'
import config from '@payload-config'

const DRY = process.env.DRY === '1' || process.env.DRY === 'true'
const SCRAPE = path.resolve(process.cwd(), 'scripts/scrape/scraped')
const LISTING = path.join(SCRAPE, 'blog/index.html')

type Reference = {
  slug: string
  title: string
  thumb: string | null
  excerpt: string | null
  datePublished: string | null
  minutes: number | null
  /** Category names, resolved from the reference's own filter ids. */
  categories: string[]
}

/**
 * The reference's category ids, read off the filter `<select>` on its listing. Hard-coded
 * because they are opaque hashes in a mirrored page, not something to derive at runtime.
 */
const REFERENCE_CATEGORIES: Record<string, string> = {
  '84pnUXVxG': 'Fizjoterapia',
  '84o42ua9K': 'Masaż',
  '84obvLpkY': 'Trening',
  '84ua64YcM': 'Dietetyka',
}

/** The reference mixes precomposed and combining diacritics; NFC makes comparisons honest. */
function normalise(value: string) {
  return value.normalize('NFC').replace(/\s+/g, ' ').trim()
}

function unescapeHtml(value: string) {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
}

/** Each card's metadata lives in one escaped-JSON attribute; take the first balanced object. */
function parseListing(): Reference[] {
  const html = readFileSync(LISTING, 'latin1')
  const raw = readFileSync(LISTING, 'utf8')
  void html

  const found: Reference[] = []
  const seen = new Set<string>()
  const marker = '="{&quot;images1&quot;'

  let at = raw.indexOf(marker)
  while (at !== -1) {
    const start = at + 2
    const end = raw.indexOf('"', start)
    let text = unescapeHtml(raw.slice(start, end))

    let depth = 0
    for (let i = 0; i < text.length; i += 1) {
      if (text[i] === '{') depth += 1
      else if (text[i] === '}') {
        depth -= 1
        if (depth === 0) {
          text = text.slice(0, i + 1)
          break
        }
      }
    }

    try {
      const data = JSON.parse(text)
      const slug = String(data.url ?? '')
      // The reference genuinely ships one slug twice, with two different dates. Keep the
      // first (newest) occurrence, since that is the one its own ordering shows first.
      if (slug && !seen.has(slug)) {
        seen.add(slug)
        const images = Array.isArray(data.images1) ? data.images1 : []
        found.push({
          slug,
          title: normalise(String(data.name ?? '')),
          thumb: images[0]?.src ? String(images[0].src) : null,
          excerpt: data.short_description ? normalise(String(data.short_description)) : null,
          datePublished: data.date_published ? String(data.date_published) : null,
          minutes: data.time ? Number(data.time) : null,
          categories: String(data.filter ?? '')
            .split(',')
            .map((id) => REFERENCE_CATEGORIES[id.trim()])
            .filter((name): name is string => Boolean(name)),
        })
      }
    } catch {
      // A malformed card is worth knowing about but not worth stopping for.
      console.warn('  could not parse one card attribute')
    }

    at = raw.indexOf(marker, end)
  }

  return found
}

const payload = await getPayload({ config })

console.log(DRY ? '\nDRY RUN: nothing will be written.' : '\nWRITING to the database.')

const reference = parseListing()
console.log(`reference cards parsed: ${reference.length}`)

const posts = await payload.find({
  collection: 'posts',
  limit: 500,
  depth: 0,
  overrideAccess: true,
})
console.log(`posts in the database : ${posts.docs.length}`)

const byslug = new Map(reference.map((r) => [r.slug, r]))

const categoryDocs = await payload.find({
  collection: 'categories',
  limit: 50,
  depth: 0,
  overrideAccess: true,
})
const categoryIdByName = new Map(categoryDocs.docs.map((doc) => [doc.title, doc.id]))

let imageFixed = 0
let imageAlready = 0
let imageMissingFile = 0
let noReference = 0
let dateFixed = 0
let dateCleared = 0
let excerptFixed = 0
let excerptAlready = 0
let excerptNoSource = 0
let categoriesFixed = 0
let categoriesAlready = 0
const mediaCache = new Map<string, number>()

/** Media filenames lose their extension to WebP on upload, so match on the stem. */
async function mediaIdFor(thumbSrc: string, alt: string): Promise<number | null> {
  const stem = path.parse(thumbSrc).name
  if (mediaCache.has(stem)) return mediaCache.get(stem)!

  const existing = await payload.find({
    collection: 'media',
    where: { filename: { like: stem } },
    limit: 1,
    overrideAccess: true,
  })

  if (existing.docs[0]) {
    mediaCache.set(stem, existing.docs[0].id as number)
    return existing.docs[0].id as number
  }

  // The metadata names a `.jpg` even where the scrape only captured the WebP the reference
  // actually serves through its `<source>` tags, so try the siblings before giving up.
  const declared = path.join(SCRAPE, thumbSrc.replace(/^\//, ''))
  const candidates = [declared, ...['.webp', '.png', '.jpg', '.jpeg'].map((ext) => {
    const parsed = path.parse(declared)
    return path.join(parsed.dir, `${parsed.name}${ext}`)
  })]

  const filePath = candidates.find((candidate) => existsSync(candidate))
  if (!filePath) {
    console.warn(`  MISSING FILE ${thumbSrc}`)
    imageMissingFile += 1
    return null
  }

  if (DRY) return null

  const created = await payload.create({
    collection: 'media',
    data: { alt },
    filePath,
    overrideAccess: true,
  })
  mediaCache.set(stem, created.id as number)
  return created.id as number
}

for (const post of posts.docs) {
  const ref = post.slug ? byslug.get(post.slug) : undefined
  if (!ref) {
    noReference += 1
    console.warn(`  no reference card for slug ${post.slug}`)
    continue
  }

  const update: Record<string, unknown> = {}

  if (ref.thumb) {
    const wantedStem = path.parse(ref.thumb).name
    const currentId = typeof post.featuredImage === 'number' ? post.featuredImage : null
    let currentStem: string | null = null
    if (currentId) {
      const current = await payload.findByID({
        collection: 'media',
        id: currentId,
        overrideAccess: true,
        depth: 0,
      })
      currentStem = current?.filename ? path.parse(current.filename).name : null
    }

    if (currentStem === wantedStem) {
      imageAlready += 1
    } else {
      const id = await mediaIdFor(ref.thumb, ref.title || String(post.title))
      if (id) {
        update.featuredImage = id
        imageFixed += 1
      }
    }
  }

  // The listing blurb is its own field on the reference, not the opening of the article.
  if (ref.excerpt) {
    if (normalise(String(post.excerpt ?? '')) === ref.excerpt) {
      excerptAlready += 1
    } else {
      update.excerpt = ref.excerpt
      excerptFixed += 1
    }
  } else {
    excerptNoSource += 1
  }

  // Categories come from the listing's `filter` field, the same place as everything else
  // here. The import took them from somewhere that worked for 60 posts and lost two, one of
  // them the newest post, which the listing features: with no category it appeared in no
  // archive and emitted no `article:section`.
  if (ref.categories.length > 0) {
    const wantedIds = ref.categories
      .map((name) => categoryIdByName.get(name))
      .filter((id): id is number => typeof id === 'number')
      .sort((a, b) => a - b)

    const currentIds = (post.categories ?? [])
      .map((item) => (typeof item === 'object' && item ? item.id : item))
      .filter((id): id is number => typeof id === 'number')
      .sort((a, b) => a - b)

    if (JSON.stringify(wantedIds) !== JSON.stringify(currentIds)) {
      update.categories = wantedIds
      categoriesFixed += 1
    } else {
      categoriesAlready += 1
    }
  }

  // The reference leaves one post undated; the import gave it the date it ran on, which
  // then sorted it above everything else. Null is the honest value.
  const wantedDate = ref.datePublished ? new Date(ref.datePublished).toISOString() : null
  const currentDate = post.publishedAt ? new Date(post.publishedAt).toISOString() : null
  if (wantedDate !== currentDate) {
    // Compare by day: the import stored midnight, the reference carries a time of day.
    const sameDay =
      wantedDate && currentDate && wantedDate.slice(0, 10) === currentDate.slice(0, 10)
    if (!sameDay) {
      update.publishedAt = wantedDate
      if (wantedDate) dateFixed += 1
      else dateCleared += 1
    }
  }

  if (Object.keys(update).length > 0 && !DRY) {
    await payload.update({
      collection: 'posts',
      id: post.id,
      data: update,
      overrideAccess: true,
    })
  }
}

console.log(`\n${DRY ? '[dry run] ' : ''}results`)
console.log(`  thumbnails repointed   : ${imageFixed}`)
console.log(`  thumbnails already ok  : ${imageAlready}`)
console.log(`  thumbnail file missing : ${imageMissingFile}`)
console.log(`  excerpts rewritten     : ${excerptFixed}`)
console.log(`  excerpts already ok    : ${excerptAlready}`)
console.log(`  excerpts with no source: ${excerptNoSource}`)
console.log(`  categories corrected   : ${categoriesFixed}`)
console.log(`  categories already ok  : ${categoriesAlready}`)
console.log(`  dates corrected        : ${dateFixed}`)
console.log(`  dates cleared to null  : ${dateCleared}`)
console.log(`  posts with no ref card : ${noReference}`)

const after = await payload.find({
  collection: 'posts',
  limit: 500,
  depth: 0,
  overrideAccess: true,
})
console.log(`  posts without an image : ${after.docs.filter((p) => !p.featuredImage).length}`)

process.exit(0)
