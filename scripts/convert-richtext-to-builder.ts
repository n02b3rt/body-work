/**
 * Converts legacy `content` (Lexical richText) into `builder` (the page
 * builder's JSON tree), row by row, on `pages` and `posts`.
 *
 * Run with: `pnpm payload run scripts/convert-richtext-to-builder.ts`
 * Preview only: `DRY=1 pnpm payload run scripts/convert-richtext-to-builder.ts`
 *
 * **Nothing in this repo's own database needs this right now.** The schema
 * migration that added `builder` (`docs/page-builder.md` Phase 0) also
 * dropped `content` outright, because this project's own `pages`/`posts`
 * tables held zero rows at the time. This script exists for the deployment
 * that does carry real content: restore a pre-migration backup to a scratch
 * database, push this branch's additive schema onto it (`builder` alongside
 * the still-present `content`), then run this against that database before
 * cutting over. Until then it is written and unit-tested
 * (`tests/builder-lexical-convert.test.ts`) against synthetic Lexical
 * fixtures, not live data.
 *
 * Raw SQL, not Payload's typed API: `content` no longer exists in this
 * branch's collection config, so Payload's own `find`/`update` cannot see it.
 * Reads and writes go straight through the postgres adapter's pool instead.
 */
import { getPayload } from 'payload'
import config from '@payload-config'

import { convertLexicalToBuilderDoc } from '../src/lib/builder/convert/lexical-to-builder.ts'

const DRY = process.env.DRY === '1' || process.env.DRY === 'true'

const TABLES = ['pages', 'posts'] as const

const payload = await getPayload({ config })
const adapter = payload.db as unknown as {
  pool: { query: (sql: string, params?: unknown[]) => Promise<{ rows: Record<string, unknown>[] }> }
}

console.log(DRY ? '\nDRY RUN, nothing will be written.' : '\nWRITING to the database.')

async function columnExists(table: string, column: string): Promise<boolean> {
  const result = await adapter.pool.query(
    `SELECT 1 FROM information_schema.columns WHERE table_name = $1 AND column_name = $2`,
    [table, column],
  )
  return result.rows.length > 0
}

let totalConverted = 0
const totalSkippedNodeTypes = new Set<string>()
let totalNumberedLists = 0

for (const table of TABLES) {
  const hasContent = await columnExists(table, 'content')
  const hasBuilder = await columnExists(table, 'builder')

  if (!hasContent) {
    console.log(`\n${table}: no "content" column, nothing to convert (already migrated or empty schema).`)
    continue
  }
  if (!hasBuilder) {
    console.log(`\n${table}: no "builder" column yet. Push this branch's schema onto this database first.`)
    continue
  }

  const rows = await adapter.pool.query(
    `SELECT id, content FROM ${table} WHERE content IS NOT NULL`,
  )

  console.log(`\n${table}: ${rows.rows.length} row(s) with a body to convert.`)

  for (const row of rows.rows) {
    const { doc, report } = convertLexicalToBuilderDoc(
      row.content as Parameters<typeof convertLexicalToBuilderDoc>[0],
    )

    if (report.skipped.length > 0) {
      console.log(`  id ${row.id}: skipped node types: ${report.skipped.join(', ')}`)
      report.skipped.forEach((type) => totalSkippedNodeTypes.add(type))
    }
    if (report.numberedListsFlattened > 0) {
      console.log(`  id ${row.id}: ${report.numberedListsFlattened} numbered list(s) lost their numbering`)
      totalNumberedLists += report.numberedListsFlattened
    }

    if (!DRY) {
      await adapter.pool.query(`UPDATE ${table} SET builder = $1 WHERE id = $2`, [
        JSON.stringify(doc),
        row.id,
      ])
    }
    totalConverted += 1
  }
}

console.log(`\n${totalConverted} row(s) converted${DRY ? ' (dry run, not written)' : ''}.`)
if (totalSkippedNodeTypes.size > 0) {
  console.log(`Unhandled node types seen: ${[...totalSkippedNodeTypes].join(', ')} — review before trusting the result.`)
}
if (totalNumberedLists > 0) {
  console.log(`${totalNumberedLists} numbered list(s) converted to unordered: review those articles.`)
}

process.exit(0)
