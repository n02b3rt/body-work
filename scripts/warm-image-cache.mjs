/**
 * Requests every image variant the site can ask for, so no visitor pays for the first encode.
 *
 * Run: `node scripts/warm-image-cache.mjs https://demo.n02b3rt.pl` (add `USER=x PASS=y` if the
 * host is behind basic auth). Needs a build in `.next-build` or `.next` to know what to ask for.
 *
 * **Why this exists.** `/_next/image` encodes on demand and caches the result per image, per
 * width, per format. Measured against the live host, cold:
 *
 *   width   AVIF            WebP
 *   960     0.48s  13.3KB   0.19s  18.7KB
 *   1440    0.76s  22.4KB   0.27s  33.4KB
 *   2048    1.47s  34.6KB   0.46s  52.7KB
 *
 * AVIF is 30% smaller and about three times slower to produce. Warm, that is a clear win. Cold,
 * the visitor stares at a blur placeholder for up to a second and a half per image while the
 * server encodes, which is exactly what "open it in incognito and it hangs" turned out to be.
 *
 * The cache lives in `.next/cache/images` and a deploy that rebuilds from scratch throws it away,
 * so this belongs **after every deploy**. A deploy that carries `.next/cache` across releases only
 * needs it once.
 *
 * Both formats are warmed: which one a visitor gets depends on their `Accept` header, and they are
 * separate cache entries.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const BASE = process.argv[2]
const DIST = path.join(ROOT, process.env.NEXT_DIST_DIR || (fs.existsSync(path.join(ROOT, '.next-build')) ? '.next-build' : '.next'))
const CONCURRENCY = Number(process.env.CONCURRENCY || 4)

if (!BASE) {
  console.error('Usage: node scripts/warm-image-cache.mjs <base-url>')
  process.exit(1)
}

const appDir = path.join(DIST, 'server', 'app')
if (!fs.existsSync(appDir)) {
  console.error(`No build at ${path.relative(ROOT, appDir)}. Run a build first.`)
  process.exit(1)
}

/** Every prerendered page, so the set of variants matches what the site will actually request. */
function pages(dir, found = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === '(payload)' || entry.name === 'api') continue
      pages(full, found)
    } else if (entry.name.endsWith('.html')) {
      found.push(full)
    }
  }
  return found
}

// `srcset` carries every width the browser may pick, and it is the widths that make the cache
// entries, so both attributes have to be read. The HTML is entity-escaped; the query separator
// comes back as `&amp;`.
const urls = new Set()
for (const file of pages(appDir)) {
  const html = fs.readFileSync(file, 'utf8')
  for (const match of html.matchAll(/\/_next\/image\?[^"'\s]+/g)) {
    urls.add(match[0].replace(/&amp;/g, '&').replace(/&quot;.*$/, ''))
  }
}

/**
 * Only the widths a real device lands on.
 *
 * A `srcset` offers around eleven, and every one is its own cache entry, but a browser picks
 * exactly one per image: 6566 variants across the site against roughly 2000 that anything will
 * ever ask for. These are the rungs that cover a phone at 1x to 3x, a tablet, and a desktop at
 * 1x and 2x. `WIDTHS=all` warms everything, which is mostly a way to spend an hour.
 */
const DEVICE_WIDTHS = new Set([640, 750, 828, 1080, 1200, 1920, 2048])
const allWidths = process.env.WIDTHS === 'all'

const targets = [...urls].filter((url) => {
  if (allWidths) return true
  const width = Number(new URLSearchParams(url.split('?')[1]).get('w'))
  return DEVICE_WIDTHS.has(width)
})

console.log(
  `${targets.length} variants to warm (of ${urls.size} the srcsets offer), ` +
    `from ${pages(appDir).length} pages, both formats`,
)

const auth =
  process.env.USER_NAME && process.env.PASS
    ? { Authorization: `Basic ${Buffer.from(`${process.env.USER_NAME}:${process.env.PASS}`).toString('base64')}` }
    : {}

const FORMATS = [
  ['avif', 'image/avif,image/webp,*/*'],
  ['webp', 'image/webp,*/*'],
]

let done = 0
let missed = 0
let slowest = 0

async function warm(url) {
  for (const [label, accept] of FORMATS) {
    const started = Date.now()
    try {
      const response = await fetch(BASE.replace(/\/$/, '') + url, {
        headers: { Accept: accept, ...auth },
      })
      // The body has to be drained or the connection is not returned to the pool.
      await response.arrayBuffer()
      const ms = Date.now() - started
      slowest = Math.max(slowest, ms)
      if (response.headers.get('x-nextjs-cache') === 'MISS') missed++
      if (!response.ok) console.error(`  ${response.status} ${label} ${url.slice(0, 80)}`)
    } catch (error) {
      console.error(`  failed ${label} ${url.slice(0, 60)}: ${error.message}`)
    }
  }
  done++
  if (done % 25 === 0) process.stdout.write(`  ${done}/${targets.length}\r`)
}

// A handful at a time: the point is to make the server encode, and burying it kills the site for
// whoever is browsing it right now.
const queue = [...targets]
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    while (queue.length > 0) await warm(queue.pop())
  }),
)

console.log(`\nwarmed ${done} variants in both formats, ${missed} were cold, slowest ${slowest}ms`)
console.log('Run it again: every response should now be a HIT and the slowest should be tens of ms.')
