/**
 * Crops a static image down to the tallest aspect ratio the site ever displays it at.
 *
 * Run with: `node scripts/crop-to-display-aspect.mjs` (add `DRY=1` to preview)
 *
 * **Why this exists.** `next/image` picks a variant by *width* only. A 2560x3840 portrait dropped
 * into a box the page renders at 4:3 still ships every one of those rows: the browser downloads the
 * full height and `object-cover` throws two thirds of it away. Shrinking a source's *width* is
 * pointless here (the optimizer already resizes, see the note in `docs/migration-tracker.md`), but
 * removing rows nobody can see is a straight saving on every request, at every breakpoint.
 *
 * **It is visually lossless by construction.** `object-cover` centres what it keeps, and so does a
 * centred crop, so the pixels that survive are exactly the ones the page was already painting. This
 * is the same argument as the blog's pre-cropped `cardWide` variant (`AI_NOTES.md`, 2026-07-28).
 *
 * **The manifest is the contract.** Each entry names the tallest box its file appears in. If a
 * component's aspect ratio changes to something taller, the crop becomes wrong: re-copy the file
 * from `scripts/scrape/scraped/` and update the entry here. `aspect` is width / height.
 */
import fs from 'node:fs'
import sharp from 'sharp'

const DRY = process.env.DRY === '1'

/**
 * Chosen by measurement, not by taste: 80 reproduces the mirror's own encode density on these
 * files (0.95 to 1.14 times their bytes per pixel), so the stored file shrinks purely by the rows
 * removed rather than by throwing away quality. RMSE against the cropped original is 1.20 to 1.73
 * on 0-255, the same band as the blog's `cardWide` pre-crop, i.e. re-encode noise. 90 was tried
 * first and made one file 16% **larger** than the uncropped original.
 */
const QUALITY = 80

const TARGETS = [
  {
    // `PageHero`: aspect-[4/3] below sm, sm:aspect-[16/9], lg:aspect-[2.4/1]. 4:3 is the tallest.
    file: 'public/images/masaz/hero.webp',
    aspect: 4 / 3,
    why: 'PageHero, tallest box is aspect-[4/3] below sm',
  },
  {
    // `Accordion` with `squareMedia`: aspect-square at every width.
    file: 'public/images/masaz/filip-deskur.webp',
    aspect: 1,
    why: 'Accordion squareMedia, aspect-square at every width',
  },
  {
    file: 'public/images/masaz/przemyslaw-gorski.webp',
    aspect: 1,
    why: 'Accordion squareMedia, aspect-square at every width',
  },
  {
    file: 'public/images/masaz/wiktoria-wysocka.webp',
    aspect: 1,
    why: 'Accordion squareMedia, aspect-square at every width',
  },
]

/**
 * On Windows a virus scanner opens each file the moment it is written, so the *next* write in the
 * loop can fail with EPERM or a bare UNKNOWN even though nothing is really holding the file: it hit
 * one file of three here, reproducibly, and the file was openable a second later. Retrying is the
 * fix; failing after several attempts still surfaces a genuine permissions problem.
 */
async function writeWithRetry(file, buffer, attempts = 6) {
  for (let i = 0; i < attempts; i++) {
    try {
      fs.writeFileSync(file, buffer)
      return
    } catch (error) {
      if (i === attempts - 1) throw error
      await new Promise((resolve) => setTimeout(resolve, 400 * (i + 1)))
    }
  }
}

let savedBytes = 0

for (const target of TARGETS) {
  if (!fs.existsSync(target.file)) {
    console.warn(`skipping ${target.file}, not found`)
    continue
  }

  // Read once and hand sharp the **buffer**, never the path. Given a path, sharp keeps the file
  // open in its own cache, and the overwrite below then fails on Windows with EPERM or a bare
  // UNKNOWN. It hit exactly one of these three files, reproducibly, while a fresh process could
  // write that same file fine, which reads like a permissions problem and is nothing of the kind.
  const input = fs.readFileSync(target.file)
  const before = input.length
  const meta = await sharp(input).metadata()
  const current = meta.width / meta.height

  // Only ever removes rows. A file already at or wider than the target box is left alone: cropping
  // it would cut into pixels the page does display.
  if (current >= target.aspect - 0.01) {
    console.log(
      `${target.file}: ${meta.width}x${meta.height} (${current.toFixed(3)}) already >= ${target.aspect.toFixed(3)}, left alone`,
    )
    continue
  }

  const height = Math.round(meta.width / target.aspect)
  const top = Math.round((meta.height - height) / 2)

  if (DRY) {
    console.log(
      `${target.file}: would crop ${meta.width}x${meta.height} -> ${meta.width}x${height} (top ${top}), ${target.why}`,
    )
    continue
  }

  // Read into a buffer first and write the result straight back. Handing sharp a *path* leaves the
  // source open in its internal cache, and on Windows the overwrite then fails with EPERM: it hit
  // exactly one of these three files, which reads like a permissions problem and is not one.
  const cropped = await sharp(input)
    .extract({ left: 0, top, width: meta.width, height })
    .webp({ quality: QUALITY })
    .toBuffer()
  await writeWithRetry(target.file, cropped)

  const after = fs.statSync(target.file).size
  savedBytes += before - after
  console.log(
    `${target.file}: ${meta.width}x${meta.height} -> ${meta.width}x${height}, ` +
      `${(before / 1024).toFixed(1)}KB -> ${(after / 1024).toFixed(1)}KB ` +
      `(${(((before - after) / before) * 100).toFixed(0)}% off the stored file)`,
  )
}

if (!DRY) console.log(`\ntotal stored saving: ${(savedBytes / 1024).toFixed(1)}KB`)
