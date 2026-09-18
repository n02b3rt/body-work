/**
 * Takes everything that is not in git: the database and the uploads.
 *
 * Run: `pnpm backup:content`
 *
 * **Why this exists.** The 62 blog posts, their categories and 230 media records live in Postgres,
 * and the files those records point at live in `/media`, which is gitignored. Neither travels with
 * a `git pull`, so a checkout plus a build produces an empty site. That is how the blog came to be
 * missing on the VPS: the content was never there, and a build that ran somewhere with a populated
 * database had been baking it into static HTML.
 *
 * Until this script existed there was exactly one copy of any of it, in a developer's Docker
 * volume, and no migrations to rebuild the schema from. See `docs/runbooks/deploy.md`.
 *
 * Output, into `BACKUP_DIR` (default `../backups` beside the repo, so a `rm -rf` of the checkout
 * does not take the backups with it):
 *
 *   <timestamp>/database.sql    pg_dump, --clean --if-exists, restores over an existing database
 *   <timestamp>/media.tar.gz    the uploads
 *   <timestamp>/manifest.json   row counts and sizes, which `restore-content.mjs` checks against
 *
 * `WITH_SCRAPE=1` also archives `scripts/scrape/scraped/` (307 MB), the WordPress scrape every post
 * was written from. Worth doing occasionally rather than nightly.
 *
 * Restore with `scripts/restore-content.mjs`. A backup nobody has restored is a guess, so that
 * script verifies counts rather than trusting the file.
 */

import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const BACKUP_ROOT = process.env.BACKUP_DIR || path.join(ROOT, '..', 'backups')
const CONTAINER = process.env.PG_CONTAINER || 'centrum-postgres-1'
const DB = process.env.PG_DATABASE || 'bodywork'
const PG_USER = process.env.PG_USER || 'payload'

/** Counted rather than assumed: a restore that lands 61 posts has to be a failure, not a shrug. */
const COUNTED = ['posts', 'categories', 'media', 'pages', 'users']

const now = new Date()
const pad = (n) => String(n).padStart(2, '0')
const stamp =
  `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}` +
  `-${pad(now.getHours())}${pad(now.getMinutes())}`
const OUT = path.join(BACKUP_ROOT, stamp)

/**
 * Postgres runs in Docker here, so commands go through the container. Set `PG_CONTAINER=none` on
 * a host where `psql` and `pg_dump` are on the PATH instead, and they are called directly.
 */
const inContainer = CONTAINER && CONTAINER !== 'none'
const pgBin = (tool) => (inContainer ? 'docker' : tool)
const pgArgs = (tool, args) => (inContainer ? ['exec', CONTAINER, tool, ...args] : args)

const psql = (sql) =>
  execFileSync(pgBin('psql'), pgArgs('psql', ['-U', PG_USER, '-d', DB, '-t', '-A', '-c', sql]), {
    encoding: 'utf8',
  }).trim()

function counts() {
  const result = {}
  for (const table of COUNTED) {
    try {
      result[table] = Number(psql(`select count(*) from ${table}`))
    } catch {
      // A table that does not exist is worth recording as absent rather than crashing: the schema
      // moves, and a backup of what is there beats no backup.
      result[table] = null
    }
  }
  return result
}

console.log(`database ${DB} in ${CONTAINER}`)
const before = counts()
for (const [table, n] of Object.entries(before)) console.log(`  ${table.padEnd(12)} ${n ?? 'absent'}`)

if (Object.values(before).every((n) => !n)) {
  console.error('\nEverything is empty. Refusing to write a backup of nothing over a good one.')
  process.exit(1)
}

fs.mkdirSync(OUT, { recursive: true })

const sqlPath = path.join(OUT, 'database.sql')
fs.writeFileSync(
  sqlPath,
  execFileSync(pgBin('pg_dump'), pgArgs('pg_dump', ['-U', PG_USER, '-d', DB, '--clean', '--if-exists']), {
    encoding: 'utf8',
    maxBuffer: 512 * 1024 * 1024,
  }),
)
console.log(`\ndatabase.sql  ${(fs.statSync(sqlPath).size / 1048576).toFixed(1)} MB`)

// `-C ROOT media` so the archive holds `media/...` and extracts to the right place from the repo
// root, whatever directory anyone happens to run the restore from.
const mediaPath = path.join(OUT, 'media.tar.gz')
// The archive name is relative and `cwd` supplies the directory: Windows tar reads an absolute
// `D:\...` as a `host:path` remote and fails with a bare exit 2.
execFileSync('tar', ['-czf', 'media.tar.gz', '-C', ROOT, 'media'], { cwd: OUT, stdio: 'inherit' })
console.log(`media.tar.gz  ${(fs.statSync(mediaPath).size / 1048576).toFixed(1)} MB`)

let scrape = null
if (process.env.WITH_SCRAPE) {
  scrape = path.join(OUT, 'scraped.tar.gz')
  execFileSync('tar', ['-czf', 'scraped.tar.gz', '-C', ROOT, 'scripts/scrape/scraped'], {
    cwd: OUT,
    stdio: 'inherit',
  })
  console.log(`scraped.tar.gz ${(fs.statSync(scrape).size / 1048576).toFixed(1)} MB`)
}

const mediaFiles = fs.readdirSync(path.join(ROOT, 'media')).length
fs.writeFileSync(
  path.join(OUT, 'manifest.json'),
  `${JSON.stringify({ takenAt: new Date().toISOString(), database: DB, counts: before, mediaFiles, scrape: Boolean(scrape) }, null, 2)}\n`,
)

console.log(`\n${OUT}`)
console.log('Copy it somewhere that is not this disk. A backup on the same drive as the original')
console.log('survives a mistake and nothing else.')
