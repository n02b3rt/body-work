/**
 * Enforces the documentation rules in CLAUDE.md so they fail instead of rotting.
 *
 * Run: pnpm check:docs
 *
 * Checks, in order:
 *   1. size budgets
 *   2. every docs/**.md opens with "> Read when:"
 *   3. relative markdown links resolve
 *   4. every path the map claims exists on disk
 *   5. map coverage: every src/ folder, script and top-level entry appears in the map
 *   6. docs/log.md stays at 20 entries or fewer
 *   7. em-dash ratchet: the known debt may shrink, never grow, and no new file may add one
 *
 * No dependencies, matching scripts/check-client-messages.mjs.
 */

import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const EM_DASH = '—'

const problems = []
const notes = []
const fail = (m) => problems.push(m)

const rel = (p) => path.relative(ROOT, p).split(path.sep).join('/')
const abs = (p) => path.join(ROOT, p)
const read = (p) => fs.readFileSync(p, 'utf8')
const exists = (p) => fs.existsSync(abs(p))
const kb = (p) => fs.statSync(p).size / 1024

function markdownFiles(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name)
    if (e.isDirectory()) {
      if (['node_modules', '.next', '.git', 'scraped'].includes(e.name)) continue
      markdownFiles(full, out)
    } else if (e.name.endsWith('.md')) out.push(full)
  }
  return out
}

const allMarkdown = markdownFiles(ROOT)
const docsMarkdown = allMarkdown.filter((f) => rel(f).startsWith('docs/'))
const mapFiles = allMarkdown.filter((f) => rel(f) === 'docs/map.md' || rel(f).startsWith('docs/map/'))

// ---------------------------------------------------------------- 1. budgets

// Lookup tables are exempt from the size cap. They stay exempt only while they
// stay tables: narrative in them is a bug, and that part is on the reviewer.
const SIZE_EXEMPT = new Set(['docs/migration-tracker.md', 'docs/scraped-site-map.md'])

const budget = (file, limit) => {
  if (!exists(file)) return fail(`missing: ${file}`)
  const size = kb(abs(file))
  if (size > limit) fail(`over budget: ${file} is ${size.toFixed(1)} KB, limit ${limit} KB`)
}

budget('CLAUDE.md', 3)
budget('docs/map.md', 5)

for (const f of mapFiles) {
  if (rel(f) === 'docs/map.md') continue
  if (kb(f) > 6) fail(`over budget: ${rel(f)} is ${kb(f).toFixed(1)} KB, limit 6 KB (see the split rule in docs/map.md)`)
}

for (const f of docsMarkdown) {
  const r = rel(f)
  if (r.startsWith('docs/archive/') || r.startsWith('docs/map/') || r === 'docs/map.md') continue
  if (SIZE_EXEMPT.has(r)) continue
  if (kb(f) > 10) fail(`over budget: ${r} is ${kb(f).toFixed(1)} KB, limit 10 KB`)
}

// ------------------------------------------------------- 2. "Read when" lines

for (const f of docsMarkdown) {
  const first = read(f).split(/\r?\n/)[0] ?? ''
  if (!first.startsWith('> Read when:')) fail(`no "> Read when:" opening line: ${rel(f)}`)
}

// ------------------------------------------------------------ 3. broken links

for (const f of allMarkdown) {
  const dir = path.dirname(f)
  for (const m of read(f).matchAll(/\]\((\.{1,2}\/[^)#\s]+)/g)) {
    if (!fs.existsSync(path.join(dir, m[1]))) fail(`broken link in ${rel(f)}: ${m[1]}`)
  }
}

// ------------------------------------------- 4. paths the map claims to exist

// A map that points at files which are not there is worse than no map, because
// the next agent trusts it. Two claims are deliberately about absence.
const KNOWN_ABSENT = new Set([
  'src/app/layout.tsx', // deliberately does not exist, so each tree owns its <html>
  'scripts/scrape/scraped', // gitignored, regenerated on demand
])

for (const f of mapFiles) {
  for (const m of read(f).matchAll(/`((?:src|scripts|messages|public)\/[^`]+)`/g)) {
    const claimed = m[1].replace(/\/$/, '')
    if (/[*[\]]/.test(claimed) || KNOWN_ABSENT.has(claimed)) continue
    if (!exists(claimed)) fail(`${rel(f)} points at a path that does not exist: ${claimed}`)
  }
}

// -------------------------------------------------------------- 5. map covers

const mapText = mapFiles.map(read).join('\n')

const covered = (name) => mapText.includes(name)

for (const entry of fs.readdirSync(ROOT)) {
  if (['.git', 'node_modules', '.next', '.gitignore', 'pnpm-lock.yaml'].includes(entry)) continue
  if (!covered(entry)) fail(`top-level entry not in the map: ${entry}`)
}

for (const s of fs.readdirSync(abs('scripts'), { withFileTypes: true })) {
  if (s.isFile() && !covered(s.name)) fail(`script not in the map: scripts/${s.name}`)
}

// A folder counts as covered when the map names it or any ancestor of it. The
// repo root of src/ has no ancestor to fall back on, so there every file must
// be named outright.
const walkSrc = (dir) => {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const files = entries.filter((e) => e.isFile())
  const parts = rel(dir).split('/')

  if (files.length > 0) {
    let hit = false
    for (let i = parts.length; i >= 2 && !hit; i--) hit = mapText.includes(parts.slice(0, i).join('/'))
    if (!hit) {
      const orphans = files.filter((f) => !covered(f.name))
      if (parts.length > 1) fail(`source folder not in the map: ${rel(dir)}`)
      else if (orphans.length) fail(`not in the map: ${orphans.map((f) => `${rel(dir)}/${f.name}`).join(', ')}`)
    }
  }

  for (const e of entries) if (e.isDirectory()) walkSrc(path.join(dir, e.name))
}
walkSrc(abs('src'))

// ------------------------------------------------------------- 6. log entries

if (exists('docs/log.md')) {
  const entries = read(abs('docs/log.md'))
    .split(/\r?\n/)
    .filter((l) => /^- \*\*\d{4}-\d{2}-\d{2}/.test(l)).length
  if (entries > 20) fail(`docs/log.md holds ${entries} entries, limit 20: roll the oldest into docs/archive/`)
}

// -------------------------------------------------------- 7. em-dash ratchet

// The client asked for no em-dashes (docs/conventions.md). The debt is cleared:
// every markdown file in the repo is at zero. Keep this object empty. If a file
// ever has to carry one, add it here with its count and say why, because from
// then on that count may only be lowered.
const EM_DASH_DEBT = {}

let debtNow = 0
for (const f of allMarkdown) {
  const r = rel(f)
  const count = read(f).split(EM_DASH).length - 1
  const allowed = EM_DASH_DEBT[r] ?? 0
  if (count > allowed) {
    fail(
      allowed === 0
        ? `em-dash in ${r} (${count}): use a colon, comma or semicolon. See docs/conventions.md`
        : `em-dash count grew in ${r}: ${count}, allowed ${allowed}`,
    )
  }
  if (allowed > 0) debtNow += count
}
const debtBaseline = Object.values(EM_DASH_DEBT).reduce((a, b) => a + b, 0)
if (debtNow < debtBaseline) {
  notes.push(`em-dash debt is down to ${debtNow} from ${debtBaseline}: lower the numbers in EM_DASH_DEBT`)
}

// ------------------------------------------------ 8. skill mirrors for other agents

// Grok Code reads only its own directory, so the triggers are mirrored there. One
// implementation, invoked in check mode, so this cannot disagree with the fixer.
{
  const sync = spawnSync(process.execPath, [abs('scripts/sync-agent-skills.mjs'), '--check'], {
    cwd: ROOT,
    encoding: 'utf8',
  })
  if (sync.status !== 0) {
    for (const line of `${sync.stderr}`.split('\n').map((l) => l.trim()).filter(Boolean)) {
      if (!line.startsWith('Run:') && !line.includes('stale skill mirror')) fail(`skill mirror: ${line}`)
    }
    fail('skill mirrors are stale: run `pnpm sync:skills`')
  }
}

// ------------------------------------------------------------------- report

for (const n of notes) console.log(`note: ${n}`)

if (problems.length === 0) {
  console.log(`docs ok: ${allMarkdown.length} markdown files, ${mapFiles.length} map files, em-dash debt ${debtNow}`)
  process.exit(0)
}

console.error(`\n${problems.length} problem${problems.length === 1 ? '' : 's'}:\n`)
for (const p of problems) console.error(`  ${p}`)
console.error('')
process.exit(1)
