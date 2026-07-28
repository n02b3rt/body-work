/**
 * Builds the low-quality placeholder map for the static images in `public/images`.
 *
 * Run with: `node scripts/generate-blur-placeholders.mjs`
 *
 * The blog gets its `blurDataURL` from Payload, harvested from the reference's own markup by
 * `scripts/import-blur-placeholders.ts`. The marketing pages have no CMS behind them, so their
 * placeholders are generated here instead and committed as JSON.
 *
 * Deliberately tiny: a 16px-wide WebP at quality 30, which lands around 150 to 400 bytes each.
 * The map is imported by server components only (see `src/lib/static-blur.ts`), so it never
 * reaches the browser as a bundle; the few hundred bytes that do ship are the individual
 * `blurDataURL` strings inlined into the HTML for the images actually on the page.
 *
 * Re-run it after adding or replacing anything under the directories listed in `DIRS`.
 */
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

/**
 * One directory per page section that has been through the optimisation pass. Adding a directory
 * here is what opts its images in; keeping the list explicit keeps the map small and the diff
 * readable, and stops 196 files' worth of base64 landing in the repo for no reason.
 *
 * **This does not recurse**, so a subdirectory needs its own entry: `fizjoterapia/sprzet` holds
 * the equipment accordion's photos and would otherwise be skipped.
 */
const DIRS = [
  'public/images/home',
  'public/images/trening-personalny',
  'public/images/fizjoterapia',
  'public/images/fizjoterapia/sprzet',
]
const OUT = 'src/lib/static-blur.json'
const WIDTH = 16
const QUALITY = 30

const map = {}
let count = 0
let bytes = 0

for (const dir of DIRS) {
  if (!fs.existsSync(dir)) {
    console.warn(`skipping ${dir}, not found`)
    continue
  }

  for (const file of fs.readdirSync(dir).sort()) {
    if (!/\.(webp|png|jpe?g|avif)$/i.test(file)) continue

    const abs = path.join(dir, file)
    const buffer = await sharp(abs)
      .resize(WIDTH, null, { fit: 'inside' })
      .webp({ quality: QUALITY })
      .toBuffer()

    // Keyed by the public URL, which is what a component passes to `next/image`.
    const key = '/' + path.relative('public', abs).split(path.sep).join('/')
    map[key] = `data:image/webp;base64,${buffer.toString('base64')}`
    count++
    bytes += map[key].length
  }
}

const sorted = Object.fromEntries(Object.entries(map).sort(([a], [b]) => a.localeCompare(b)))
fs.writeFileSync(OUT, `${JSON.stringify(sorted, null, 2)}\n`, 'utf8')

console.log(`${count} placeholder(s) written to ${OUT}`)
console.log(`average ${Math.round(bytes / Math.max(count, 1))} bytes each, ${(bytes / 1024).toFixed(1)}KB total`)
