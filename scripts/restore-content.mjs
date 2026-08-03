/**
 * Puts a backup back: the database, the uploads, and a check that it actually landed.
 *
 * Run: `pnpm restore:content <backup-dir>`
 *
 * **This is destructive.** The dump carries `--clean --if-exists`, so it drops and recreates every
 * table it knows about. It refuses to run without `I_MEAN_IT=1` for that reason.
 *
 * This is also the fast path onto the VPS. There are no migrations, so a clean Postgres cannot be
 * built from the repo; a dump is currently the only way to produce the schema **and** the content
 * in one step:
 *
 *   pnpm backup:content                      # here
 *   scp -r ../backups/<stamp> vps:/tmp/      # across
 *   I_MEAN_IT=1 pnpm restore:content /tmp/<stamp>   # there
 *
 * Then rebuild, because the blog is statically generated and the pages were baked when the
 * database was empty. `docs/runbooks/deploy.md` has the whole sequence.
 *
 * Verifies row counts against the manifest and exits non-zero if they disagree, because a restore
 * that half worked is worse than one that failed.
 */

import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SOURCE = process.argv[2]
const CONTAINER = process.env.PG_CONTAINER || 'centrum-postgres-1'
const DB = process.env.PG_DATABASE || 'bodywork'
const PG_USER = process.env.PG_USER || 'payload'

/**
 * Postgres runs in Docker here, so the client tools are reached through the container. Set
 * `PG_CONTAINER=none` on a host that has `psql` and `pg_dump` on its PATH and they are called
 * directly instead.
 */
const inContainer = CONTAINER && CONTAINER !== 'none'
const pgBin = (tool) => (inContainer ? 'docker' : tool)
const pgArgs = (tool, args, { stdin = false } = {}) =>
  inContainer ? ['exec', ...(stdin ? ['-i'] : []), CONTAINER, tool, ...args] : args

if (!SOURCE) {
  console.error('Usage: I_MEAN_IT=1 pnpm restore:content <backup-dir>')
  process.exit(1)
}

const manifestPath = path.join(SOURCE, 'manifest.json')
const sqlPath = path.join(SOURCE, 'database.sql')
for (const file of [manifestPath, sqlPath]) {
  if (!fs.existsSync(file)) {
    console.error(`Not a backup directory: ${file} is missing.`)
    process.exit(1)
  }
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
console.log(`backup from ${manifest.takenAt}, database ${manifest.database}`)
for (const [table, n] of Object.entries(manifest.counts)) console.log(`  ${table.padEnd(12)} ${n ?? 'absent'}`)
console.log(`  media files  ${manifest.mediaFiles}`)

if (!process.env.I_MEAN_IT) {
  console.error(`\nThis drops and recreates every table in "${DB}" on ${CONTAINER}.`)
  console.error('Re-run with I_MEAN_IT=1 if that is what you want.')
  process.exit(1)
}

console.log(`\nrestoring into ${DB}...`)
execFileSync(pgBin('psql'), pgArgs('psql', ['-U', PG_USER, '-d', DB, '-v', 'ON_ERROR_STOP=0'], { stdin: true }), {
  input: fs.readFileSync(sqlPath),
  stdio: ['pipe', 'ignore', 'inherit'],
  maxBuffer: 512 * 1024 * 1024,
})

const mediaArchive = path.join(SOURCE, 'media.tar.gz')
if (fs.existsSync(mediaArchive)) {
  // Extracted over the top rather than after a wipe: a file that is still there and still correct
  // does not need replacing, and nothing else writes into this directory.
  // Relative name plus `cwd` for the same reason the backup writes it that way.
  execFileSync('tar', ['-xzf', 'media.tar.gz', '-C', ROOT], { cwd: SOURCE, stdio: 'inherit' })
  console.log(`media restored: ${fs.readdirSync(path.join(ROOT, 'media')).length} files`)
}

const psql = (sql) =>
  execFileSync(pgBin('psql'), pgArgs('psql', ['-U', PG_USER, '-d', DB, '-t', '-A', '-c', sql]), {
    encoding: 'utf8',
  }).trim()

console.log('\nverifying:')
let bad = 0
for (const [table, expected] of Object.entries(manifest.counts)) {
  if (expected === null) continue
  let actual = null
  try {
    actual = Number(psql(`select count(*) from ${table}`))
  } catch {
    actual = null
  }
  const ok = actual === expected
  if (!ok) bad++
  console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${table.padEnd(12)} ${actual ?? 'absent'} / ${expected}`)
}

if (bad > 0) {
  console.error(`\n${bad} table(s) do not match the manifest. Do not rebuild on top of this.`)
  process.exit(1)
}

console.log('\nEverything matches. Rebuild now: the blog is statically generated, so the pages still')
console.log('hold whatever the database looked like when they were last built.')
