/**
 * Copies the reference site's low-quality image placeholders onto our Media documents.
 *
 * Run with: `pnpm payload run scripts/import-blur-placeholders.ts`
 * Preview only: `DRY=1 pnpm payload run scripts/import-blur-placeholders.ts`
 * (An env var, not a flag: `payload run` strips extra argv. See docs/architecture.md.)
 *
 * The reference generates a tiny base64 WebP for every image and paints it as the
 * `background-image` of the enclosing `<picture>`, so the blurred version is visible while
 * the real file downloads. Every mirrored page carries them, which means we can have the
 * same effect for free rather than generating our own with sharp.
 *
 * Matching is by filename stem: the mirror names both the placeholder's `<picture>` and the
 * real file after the same content hash, and our uploads kept those stems.
 */
import path from 'path'
import { readFileSync } from 'fs'
import { readdir } from 'fs/promises'
import { getPayload } from 'payload'
import config from '@payload-config'

const DRY = process.env.DRY === '1' || process.env.DRY === 'true'
const SCRAPE = path.resolve(process.cwd(), 'scripts/scrape/scraped')

/**
 * A `<picture>` carries the placeholder in its `style`, and the `<img>` inside it carries the
 * real path. Matching the placeholder first and then looking forward for the nearest `<img>`
 * keeps the two associated, which a pair of independent scans would not.
 *
 * The opening quote has to be an optional *group*. Written as `&quot;?` it makes only the
 * semicolon optional and demands a literal `&quot`, which matched nothing at all. The mirror
 * quotes these three different ways depending on the surrounding attribute.
 */
const PICTURE =
  /<picture\b[^>]*background-image:\s*url\((?:&quot;|["'])?(data:image\/[a-z]+;base64,[^"')\s]+)/g
const IMG_SRC = /<img\b[^>]*\bsrc="([^"]+)"/

/** `fs/promises.glob` needs Node 22 and this project is pinned to 20.9, so walk it by hand. */
async function htmlFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => [])
  const files: string[] = []

  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) files.push(...(await htmlFiles(full)))
    else if (entry.isFile() && entry.name.endsWith('.html')) files.push(full)
  }

  return files
}

async function collect(): Promise<Map<string, string>> {
  const found = new Map<string, string>()

  for (const file of await htmlFiles(SCRAPE)) {
    const html = readFileSync(file, 'utf8')

    for (const match of html.matchAll(PICTURE)) {
      const dataUri = match[1]
      if (!dataUri) continue

      // The `<img>` belonging to this `<picture>`, bounded by the element's own close so a
      // placeholder can never be paired with the next picture's file.
      const from = (match.index ?? 0) + match[0].length
      const until = html.indexOf('</picture>', from)
      const inner = html.slice(from, until === -1 ? from + 4000 : until)
      const src = inner.match(IMG_SRC)?.[1]
      if (!src) continue

      const stem = path.parse(src.split('?')[0]).name
      // Strip the mirror's responsive suffix so `84u6Kjdnq-320w` matches `84u6Kjdnq`.
      const base = stem.replace(/-\d+w$/, '')
      if (base && !found.has(base)) found.set(base, dataUri)
    }
  }

  return found
}

const payload = await getPayload({ config })

console.log(DRY ? '\nDRY RUN, nothing will be written.' : '\nWRITING to the database.')

const placeholders = await collect()
console.log(`placeholders found in the mirror: ${placeholders.size}`)

const media = await payload.find({
  collection: 'media',
  limit: 2000,
  depth: 0,
  overrideAccess: true,
})
console.log(`media documents: ${media.docs.length}`)

let set = 0
let already = 0
let noMatch = 0

for (const doc of media.docs) {
  if (!doc.filename) {
    noMatch += 1
    continue
  }

  const stem = path.parse(doc.filename).name.replace(/-\d+x\d+$/, '')
  const dataUri = placeholders.get(stem)

  if (!dataUri) {
    noMatch += 1
    continue
  }

  if (doc.blurDataURL === dataUri) {
    already += 1
    continue
  }

  if (!DRY) {
    await payload.update({
      collection: 'media',
      id: doc.id,
      data: { blurDataURL: dataUri },
      overrideAccess: true,
    })
  }
  set += 1
}

console.log(`\n${DRY ? '[dry run] ' : ''}results`)
console.log(`  placeholders written : ${set}`)
console.log(`  already correct      : ${already}`)
console.log(`  no placeholder found : ${noMatch}`)

const withBlur = await payload.find({
  collection: 'media',
  limit: 2000,
  depth: 0,
  overrideAccess: true,
})
const covered = withBlur.docs.filter((d) => d.blurDataURL).length
console.log(`  media with a placeholder: ${covered}/${withBlur.docs.length}`)

process.exit(0)
