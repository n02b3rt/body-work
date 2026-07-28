/**
 * Re-encodes the homepage hero video and extracts its poster frame.
 *
 * Run with: `node scripts/optimize-hero-video.mjs <source.mp4>`
 *
 * The original was 8388KB of 1280x720 h264 at 3459 kb/s **with an audio track**, which the player
 * never uses because it is `muted` and decorative. Stripping the audio and encoding at a sane CRF:
 *
 *   source            8388KB
 *   h264 crf26, -an   2800KB   (-67%)  every browser
 *   vp9  crf36, -an   1736KB   (-79%)  Chrome, Firefox, Edge
 *   poster (webp)       17KB           what a visitor actually pays for on first paint
 *
 * `-movflags +faststart` puts the index at the front so playback can start before the whole file
 * has arrived. The poster is taken two seconds in, because frame zero is a fade from black.
 *
 * Uses the `@ffmpeg-installer/ffmpeg` binary that `src/lib/compress-media.ts` already depends on,
 * so this adds nothing to the stack.
 */
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import ffmpeg from '@ffmpeg-installer/ffmpeg'

const SOURCE = process.argv[2] ?? 'public/videos/hero-source.mp4'
const OUT_DIR = 'public/videos'
const POSTER = 'public/images/home/hero-poster.webp'

if (!fs.existsSync(SOURCE)) {
  console.error(`No source at ${SOURCE}. Pass the path to the original as the first argument.`)
  process.exit(1)
}

const run = (args) =>
  execFileSync(ffmpeg.path, ['-hide_banner', '-loglevel', 'error', '-y', ...args], {
    stdio: 'inherit',
  })

const kb = (file) => `${(fs.statSync(file).size / 1024).toFixed(0)}KB`

console.log(`source ${SOURCE}: ${kb(SOURCE)}`)

// Poster. Lives under `public/images` rather than `public/videos` so `next/image` can optimise it
// like any other picture.
fs.mkdirSync(path.dirname(POSTER), { recursive: true })
run(['-ss', '2', '-i', SOURCE, '-frames:v', '1', '-vf', 'scale=1280:-2', POSTER])
console.log(`poster ${POSTER}: ${kb(POSTER)}`)

run([
  '-i', SOURCE,
  '-an',
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '26',
  '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
  '-vf', 'scale=1280:-2',
  path.join(OUT_DIR, 'hero.mp4'),
])
console.log(`h264 ${path.join(OUT_DIR, 'hero.mp4')}: ${kb(path.join(OUT_DIR, 'hero.mp4'))}`)

run([
  '-i', SOURCE,
  '-an',
  '-c:v', 'libvpx-vp9', '-crf', '36', '-b:v', '0',
  '-row-mt', '1', '-deadline', 'good', '-cpu-used', '3',
  '-vf', 'scale=1280:-2',
  path.join(OUT_DIR, 'hero.webm'),
])
console.log(`vp9  ${path.join(OUT_DIR, 'hero.webm')}: ${kb(path.join(OUT_DIR, 'hero.webm'))}`)

// A 720px pair for phones, picked by `media` on the `<source>`. A 390px-wide section has no use
// for a 1280px encode: 733KB against 1736KB.
run([
  '-i', SOURCE,
  '-an',
  '-c:v', 'libvpx-vp9', '-crf', '40', '-b:v', '0',
  '-row-mt', '1', '-deadline', 'good', '-cpu-used', '3',
  '-vf', 'scale=720:-2',
  path.join(OUT_DIR, 'hero-sm.webm'),
])
run([
  '-i', SOURCE,
  '-an',
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '29',
  '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
  '-vf', 'scale=720:-2',
  path.join(OUT_DIR, 'hero-sm.mp4'),
])
console.log(`vp9  720px: ${kb(path.join(OUT_DIR, 'hero-sm.webm'))}`)
console.log(`h264 720px: ${kb(path.join(OUT_DIR, 'hero-sm.mp4'))}`)
