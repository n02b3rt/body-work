/**
 * Builds with the image cache carried in from the previous release and handed back out.
 *
 * Run: `NEXT_CACHE_DIR=/var/cache/bodywork-next node scripts/build-with-cache.mjs`
 *
 * **What this stops happening.** `/_next/image` encodes on demand and caches under
 * `.next/cache/images`. A cold entry costs up to 1.5 s of server time for one image at one width,
 * and the visitor spends it looking at a blur placeholder. Next keeps that cache across builds in
 * the same directory, so building in place is fine; the moment a deploy builds into a fresh
 * release directory, a container layer or a CI workspace, it starts empty and every visitor pays
 * again. That is invisible in a build log and obvious to anyone opening the site in incognito.
 *
 * So the cache lives somewhere the deploy does not touch, named by `NEXT_CACHE_DIR`, and this
 * script moves it in and back out around the build. Nothing else about the deploy has to change.
 *
 * `scripts/warm-image-cache.mjs` fills it the first time. After that this keeps it.
 */

import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const CACHE_DIR = process.env.NEXT_CACHE_DIR
const DIST = path.join(ROOT, process.env.NEXT_DIST_DIR || '.next')
const BUILD_CACHE = path.join(DIST, 'cache')

if (!CACHE_DIR) {
  console.error(
    'NEXT_CACHE_DIR is required: an absolute path outside the release directory, somewhere the\n' +
      'deploy will not delete. Example:\n' +
      '  NEXT_CACHE_DIR=/var/cache/bodywork-next node scripts/build-with-cache.mjs',
  )
  process.exit(1)
}

const kb = (dir) => {
  if (!fs.existsSync(dir)) return 0
  let total = 0
  for (const entry of fs.readdirSync(dir, { withFileTypes: true, recursive: true })) {
    if (entry.isFile()) {
      try {
        total += fs.statSync(path.join(entry.parentPath ?? entry.path, entry.name)).size
      } catch {
        // A file vanishing mid-walk is not worth failing a deploy over.
      }
    }
  }
  return Math.round(total / 1024)
}

const images = path.join(CACHE_DIR, 'images')
console.log(`cache at ${CACHE_DIR}: ${kb(CACHE_DIR)}KB, images ${kb(images)}KB`)

if (fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(DIST, { recursive: true })
  fs.cpSync(CACHE_DIR, BUILD_CACHE, { recursive: true })
  console.log('restored into the build directory')
} else {
  console.log('no cache yet, this build starts cold: run `pnpm warm:images <url>` afterwards')
}

execFileSync(process.execPath, [path.join(ROOT, 'node_modules', 'next', 'dist', 'bin', 'next'), 'build'], {
  cwd: ROOT,
  stdio: 'inherit',
  env: { ...process.env, NODE_OPTIONS: `${process.env.NODE_OPTIONS ?? ''} --no-deprecation`.trim() },
})

// After the build, not instead of it: Next writes to the same directory while building, and what
// matters is the state it leaves behind.
if (fs.existsSync(BUILD_CACHE)) {
  fs.mkdirSync(path.dirname(CACHE_DIR), { recursive: true })
  fs.cpSync(BUILD_CACHE, CACHE_DIR, { recursive: true })
  console.log(`persisted back: ${kb(CACHE_DIR)}KB, images ${kb(images)}KB`)
} else {
  console.warn('WARNING: the build produced no cache directory, nothing persisted')
}
