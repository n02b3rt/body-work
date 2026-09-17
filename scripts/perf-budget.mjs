/**
 * Weighs what a visitor actually downloads, per page, straight out of the build.
 *
 * Run: pnpm check:perf   (needs a finished `pnpm build`)
 *
 * Lighthouse measures one URL at a time, from a browser, over whatever the network
 * happened to be doing. This reads the prerendered HTML instead, so the numbers are
 * exact, cover every page at once, and move only when the code moves.
 *
 * Per page it reports:
 *   - JS and CSS bytes, gzipped, counting each chunk once
 *   - HTML bytes, gzipped: the document itself, including the inlined RSC payload
 *   - eager images: `<img>` without `loading="lazy"`, the ones that compete with LCP
 *   - preloads: `<link rel="preload">`, which on HTTP/1.1 is a queue, not a hint
 *
 * `--check` compares against `perf-budget.json` and exits 1 on any regression. That
 * file is a ratchet, like the GRANDFATHERED list in tests/coverage.test.ts: budgets may
 * come down, never up. `--update` rewrites it after a deliberate change.
 *
 * No dependencies, matching scripts/check-docs.mjs.
 */

import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
// Same variable the build honours (see next.config.ts), so measuring a build that had to
// dodge a running dev server needs no extra argument.
const DIST = path.join(ROOT, process.env.NEXT_DIST_DIR || '.next')
const APP_DIR = path.join(DIST, 'server', 'app')
const STATIC_DIR = path.join(DIST, 'static')
const BUDGET_FILE = path.join(ROOT, 'scripts', 'perf-budget.json')

const mode = process.argv.includes('--check')
  ? 'check'
  : process.argv.includes('--update')
    ? 'update'
    : 'report'

/**
 * Gzip, not raw bytes: raw is what the bundler made, gzip is what crosses the wire.
 * Level 6 is what every server ships by default, so it matches production closely
 * enough to compare against a Lighthouse run.
 */
const gzipSize = (buffer) => zlib.gzipSync(buffer, { level: 6 }).length

/** Only the pages a visitor can land on. Payload's admin is not our problem here. */
function findPages(dir, found = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === '(payload)' || entry.name === 'api') continue
      findPages(full, found)
    } else if (entry.name.endsWith('.html')) {
      found.push(full)
    }
  }
  return found
}

/**
 * `/_next/static/chunks/x.js` maps to `.next/static/chunks/x.js`. A missing file is
 * not fatal: a stale build leaves references behind, and reporting 0 for it is more
 * useful than crashing halfway through the table.
 */
function assetBytes(url) {
  const file = path.join(STATIC_DIR, url.replace('/_next/static/', '').split('?')[0])
  try {
    return gzipSize(fs.readFileSync(file))
  } catch {
    return 0
  }
}

function measure(htmlFile) {
  const html = fs.readFileSync(htmlFile, 'utf8')
  const scripts = new Set([...html.matchAll(/src="(\/_next\/static\/[^"]+\.js)"/g)].map((m) => m[1]))
  const styles = new Set([...html.matchAll(/href="(\/_next\/static\/[^"]+\.css)"/g)].map((m) => m[1]))

  // A tag counts as eager unless it opts out. That is the browser's own default, and
  // it is the eager ones that share the connection pool with the LCP image.
  const imgs = html.match(/<img\b[^>]*>/g) ?? []
  const eager = imgs.filter((tag) => !/loading="lazy"/.test(tag)).length

  return {
    page: path
      .relative(APP_DIR, htmlFile)
      .split(path.sep)
      .join('/')
      .replace(/\.html$/, ''),
    js: [...scripts].reduce((sum, url) => sum + assetBytes(url), 0),
    css: [...styles].reduce((sum, url) => sum + assetBytes(url), 0),
    html: gzipSize(Buffer.from(html)),
    files: scripts.size + styles.size,
    eager,
    preloads: (html.match(/<link rel="preload"/g) ?? []).length,
  }
}

if (!fs.existsSync(APP_DIR)) {
  console.error('No build found. Run `pnpm build` first.')
  process.exit(1)
}

const rows = findPages(APP_DIR).map(measure).sort((a, b) => b.js + b.html - (a.js + a.html))
const kb = (n) => (n / 1024).toFixed(1)

console.log('Gzipped bytes a visitor downloads, per page.\n')
console.log('   JS     CSS    HTML  files  eager  preld  page')
for (const r of rows) {
  console.log(
    `${kb(r.js).padStart(6)} ${kb(r.css).padStart(6)} ${kb(r.html).padStart(6)}` +
      `${String(r.files).padStart(6)} ${String(r.eager).padStart(6)} ${String(r.preloads).padStart(6)}  ${r.page}`,
  )
}

// The worst page on each axis is the budget: a regression anywhere shows up, and no
// single page can quietly get heavy while the average stays flat.
const worst = {
  js: Math.max(...rows.map((r) => r.js)),
  css: Math.max(...rows.map((r) => r.css)),
  html: Math.max(...rows.map((r) => r.html)),
  files: Math.max(...rows.map((r) => r.files)),
  eager: Math.max(...rows.map((r) => r.eager)),
  preloads: Math.max(...rows.map((r) => r.preloads)),
}

console.log(
  `\n${rows.length} pages. Worst page: ${kb(worst.js)}K JS, ${kb(worst.css)}K CSS, ` +
    `${kb(worst.html)}K HTML, ${worst.files} files, ${worst.eager} eager images, ${worst.preloads} preloads.`,
)

if (mode === 'update') {
  fs.writeFileSync(BUDGET_FILE, `${JSON.stringify(worst, null, 2)}\n`)
  console.log(`\nWrote ${path.relative(ROOT, BUDGET_FILE)}.`)
  process.exit(0)
}

if (mode === 'check') {
  if (!fs.existsSync(BUDGET_FILE)) {
    console.error('\nNo perf-budget.json. Run with --update to record one.')
    process.exit(1)
  }

  const budget = JSON.parse(fs.readFileSync(BUDGET_FILE, 'utf8'))
  const over = Object.entries(worst).filter(([key, value]) => value > budget[key])

  if (over.length > 0) {
    console.error('\nOver budget:')
    for (const [key, value] of over) console.error(`  ${key}: ${value} > ${budget[key]}`)
    console.error('\nIf the increase is deliberate, say why in the commit and re-run with --update.')
    process.exit(1)
  }

  const under = Object.entries(worst).filter(([key, value]) => value < budget[key])
  if (under.length > 0) {
    console.log('\nUnder budget, tighten it with --update:')
    for (const [key, value] of under) console.log(`  ${key}: ${value} < ${budget[key]}`)
  }
}
