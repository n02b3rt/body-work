/**
 * Builds the per-page Open Graph cards from the pages' own hero photographs.
 *
 * Run with: `node scripts/generate-og-images.mjs`
 *
 * Every route used to fall back to `public/images/og-default.jpg`, so a link to any of them shared
 * on Facebook or LinkedIn showed the same reception photo. These are the same recipe as that
 * default (see `docs/migration-tracker.md`): **1200x630 JPEG**, the size all three platforms
 * document, and JPEG rather than the WebP original because some scrapers still refuse WebP outright
 * and an unrendered card costs more than 90KB does.
 *
 * Add a row here when a route starts declaring its own `image` in `pageMetadata`.
 */
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const WIDTH = 1200
const HEIGHT = 630
const OUT_DIR = 'public/images/og'

/** source hero → card filename. */
const CARDS = [
  ['public/images/fizjoterapia/manualna-hero.webp', 'fizjoterapia-terapia-manualna.jpg'],
  ['public/images/fizjoterapia/rehab-hero.webp', 'fizjoterapia-rehabilitacja-ruchowa.jpg'],
  ['public/images/fizjoterapia/brzuch-hero.webp', 'fizjoterapia-zdrowy-brzuch.jpg'],
  ['public/images/fizjoterapia/specjalisci-hero.webp', 'fizjoterapia-specjalisci.jpg'],
  ['public/images/hub/hero.webp', 'hub.jpg'],
]

fs.mkdirSync(OUT_DIR, { recursive: true })

for (const [source, name] of CARDS) {
  if (!fs.existsSync(source)) {
    console.warn(`skipping ${name}, ${source} not found`)
    continue
  }
  const out = path.join(OUT_DIR, name)
  await sharp(source)
    .resize(WIDTH, HEIGHT, { fit: 'cover' })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(out)
  console.log(`${name.padEnd(40)} ${(fs.statSync(out).size / 1024).toFixed(0)}KB`)
}
