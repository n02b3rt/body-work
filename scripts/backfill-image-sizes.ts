/**
 * Generates the `cardWide` crop for media that were uploaded before that size existed.
 *
 * Run with: `pnpm payload run scripts/backfill-image-sizes.ts`
 *
 *   DRY=1     report what would change and write nothing (do this first)
 *   ONLY=<id> a single media id, for proving the mechanism before touching 230 rows
 *   FORCE=1   redo media that already carry the size
 *
 * `DRY` is an env var and not `--dry`, because `payload run` strips extra argv and a flag that is
 * silently ignored once wrote all 62 posts on what was supposed to be a dry run. See
 * `docs/architecture.md`.
 *
 * **Why not just hand the file back to Payload's upload pipeline?** That was the first attempt and
 * it was measured, on one document, before going near the rest. Payload treated the incoming file
 * as a name collision and renamed **everything**: `88Sn9tiZS.webp` became `88Sn9tiZS-1.webp` along
 * with all four variants, and the stored original was deleted. Worse, the bytes did not survive
 * either, 68572 in and 66808 out, so it also added a lossy generation to every image in the
 * library. Doing that to 230 files to gain one crop is not a trade worth making.
 *
 * So the crop is produced here with sharp and registered with `payload.update`, which does accept
 * writes to the generated `sizes` group (probed before relying on it). Nothing else about the
 * document is touched, no file is renamed, and no original is re-encoded.
 *
 * Safe to re-run: media that already carry the size are skipped unless `FORCE=1`.
 */
import { getPayload } from 'payload'
import config from '@payload-config'
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

/** Must match the `cardWide` entry in `src/collections/Media.ts`, including the quality. */
const SIZE = 'cardWide'
const WIDTH = 960
const HEIGHT = 540
const QUALITY = 80

const DRY = process.env.DRY === '1'
const FORCE = process.env.FORCE === '1'
const ONLY = process.env.ONLY ? Number(process.env.ONLY) : null
const MEDIA_DIR = path.resolve('media')

console.log(
  `mode: ${DRY ? 'DRY RUN, nothing will be written' : 'WRITING'}` +
    (FORCE ? '  forcing existing' : '') +
    (ONLY ? `  only media id ${ONLY}` : ''),
)

type SizeEntry = {
  filename?: string | null
  width?: number | null
  height?: number | null
  mimeType?: string | null
  filesize?: number | null
  url?: string | null
}

const payload = await getPayload({ config })

const found = await payload.find({
  collection: 'media',
  limit: 1000,
  depth: 0,
  overrideAccess: true,
  ...(ONLY ? { where: { id: { equals: ONLY } } } : {}),
})

let written = 0
let skipped = 0
let tooSmall = 0
let missing = 0
let failed = 0
let savedBytes = 0

for (const doc of found.docs) {
  const filename = doc.filename
  const sizes = (doc.sizes ?? {}) as Record<string, SizeEntry | undefined>

  if (!filename || !doc.mimeType?.startsWith('image/')) {
    skipped++
    continue
  }

  if (sizes[SIZE]?.filename && !FORCE) {
    skipped++
    continue
  }

  const source = path.join(MEDIA_DIR, filename)
  if (!fs.existsSync(source)) {
    console.log(`  no file on disk for ${filename}`)
    missing++
    continue
  }

  try {
    const meta = await sharp(source).metadata()
    // `withoutEnlargement` caps the crop at whatever the source can actually fill, so a 800px
    // photograph still gets a proper 16:9 tile, just a smaller one. Only images too small to
    // matter in a tile at all are skipped: below this the browser is already downloading less
    // than the tile needs and cropping would only take pixels away.
    if (!meta.width || !meta.height || meta.width < 480) {
      tooSmall++
      continue
    }

    const base = filename.replace(/\.[^.]+$/, '')
    const outName = `${base}-card16x9.webp`
    const outPath = path.join(MEDIA_DIR, outName)

    // `fit: cover` centres the crop, matching what Payload does for a document with no focal
    // point set. None of the imported media have one.
    const buffer = await sharp(source)
      .resize(WIDTH, HEIGHT, { fit: 'cover', withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toBuffer()

    const out = await sharp(buffer).metadata()

    // What the grid would have paid for the uncropped file at the same width.
    const uncropped = sizes.card?.filesize ?? 0
    if (uncropped) savedBytes += Math.max(0, uncropped - buffer.length)

    if (DRY) {
      console.log(
        `  would write ${outName}  ${out.width}x${out.height}  ${(buffer.length / 1024).toFixed(1)}KB` +
          (uncropped ? `  (card variant is ${(uncropped / 1024).toFixed(1)}KB)` : ''),
      )
      written++
      continue
    }

    fs.writeFileSync(outPath, buffer)

    await payload.update({
      collection: 'media',
      id: doc.id,
      depth: 0,
      overrideAccess: true,
      data: {
        sizes: {
          ...sizes,
          [SIZE]: {
            filename: outName,
            width: out.width,
            height: out.height,
            mimeType: 'image/webp',
            filesize: buffer.length,
            url: `/api/media/file/${outName}`,
          },
        },
      } as never,
    })

    written++
    if (written % 25 === 0) console.log(`  ${written} written`)
  } catch (error) {
    failed++
    console.error(`  failed on ${filename}: ${(error as Error).message}`)
  }
}

console.log(
  `\n${DRY ? 'would write' : 'wrote'} ${written}, already had ${SIZE} or not an image: ${skipped}` +
    `, too small to bother: ${tooSmall}, file missing: ${missing}, failed: ${failed}`,
)
if (savedBytes) {
  console.log(`versus the uncropped card variant: ${(savedBytes / 1024).toFixed(1)}KB less to serve`)
}

process.exit(0)
