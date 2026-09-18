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
// The source is 24.93 fps. Every encode was defaulting to 30, inventing frames that cost bytes
// and show nothing, so every rung is pinned to the source's own rate.
const FPS = '24'

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
  '-r', FPS,
  '-vf', 'scale=1280:-2',
  path.join(OUT_DIR, 'hero.mp4'),
])
console.log(`h264 ${path.join(OUT_DIR, 'hero.mp4')}: ${kb(path.join(OUT_DIR, 'hero.mp4'))}`)

run([
  '-i', SOURCE,
  '-an',
  '-c:v', 'libvpx-vp9', '-crf', '36', '-b:v', '0',
  '-row-mt', '1', '-deadline', 'good', '-cpu-used', '3',
  '-r', FPS,
  '-vf', 'scale=1280:-2',
  path.join(OUT_DIR, 'hero.webm'),
])
console.log(`vp9  ${path.join(OUT_DIR, 'hero.webm')}: ${kb(path.join(OUT_DIR, 'hero.webm'))}`)

/**
 * Two narrower pairs, picked by `media` on the `<source>`. Three rungs rather than two, because
 * with only 640px and 1280px a tablet at 800px was being handed the desktop encode.
 *
 * The phone rung is the one that matters: it is the LCP element on the homepage, so its first
 * frame is the metric. It was 736KB at 720px, CRF 40, **30 fps**, and the source is 24.93 fps,
 * so a third of those frames were interpolated from nothing. Measured, from the same source:
 *
 *   720px crf40 24fps   720KB   dropping the invented frames alone buys ~2%
 *   540px crf40 24fps   528KB   -28%
 *   540px crf46 24fps   372KB   -49%   <- shipped
 *
 * 540px covers a 412px viewport at better than 1:1, and the footage is fast motion with heavy
 * natural blur, which is exactly what a high CRF hides in. Raise the CRF before the resolution
 * if this ever needs to get smaller again.
 */
const TIERS = [
  { name: 'sm', width: 540, vp9: '46', h264: '32' },
  { name: 'md', width: 720, vp9: '42', h264: '30' },
]

for (const tier of TIERS) {
  const webm = path.join(OUT_DIR, `hero-${tier.name}.webm`)
  const mp4 = path.join(OUT_DIR, `hero-${tier.name}.mp4`)

  run([
    '-i', SOURCE,
    '-an',
    '-c:v', 'libvpx-vp9', '-crf', tier.vp9, '-b:v', '0',
    '-row-mt', '1', '-deadline', 'good', '-cpu-used', '3',
    '-r', FPS,
    '-vf', `scale=${tier.width}:-2`,
    webm,
  ])
  run([
    '-i', SOURCE,
    '-an',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', tier.h264,
    '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
    '-r', FPS,
    '-vf', `scale=${tier.width}:-2`,
    mp4,
  ])
  console.log(`vp9  ${tier.width}px: ${kb(webm)}`)
  console.log(`h264 ${tier.width}px: ${kb(mp4)}`)
}
