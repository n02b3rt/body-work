/**
 * Mirrors the skill triggers into the directories other agents read.
 *
 *   pnpm sync:skills           write the pointers
 *   pnpm sync:skills --check   fail if they are stale (what pnpm check:docs runs)
 *
 * Only the frontmatter is duplicated, because that is the part each tool needs in
 * order to decide *when* a skill applies. The body stays in `.claude/skills/`, and
 * every mirror points at it, so guidance cannot drift into two versions.
 *
 * Who reads what, as of 2026-08:
 *   Claude Code  .claude/skills/                     (canonical, written by hand)
 *   Cursor       .claude/skills/ natively, for compatibility, so it needs no mirror
 *   Grok Code    ./.grok/skills/ only, hence this script
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SOURCE = path.join(ROOT, '.claude', 'skills')
const MIRRORS = [{ dir: path.join(ROOT, '.grok', 'skills'), tool: 'Grok Code' }]

const check = process.argv.includes('--check')

/** Pull `name` and `description` out of a SKILL.md, leaving the body alone. */
function frontmatter(file) {
  const source = fs.readFileSync(file, 'utf8')
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!match) throw new Error(`${path.relative(ROOT, file)} has no frontmatter`)

  const fields = {}
  for (const line of match[1].split(/\r?\n/)) {
    const kv = line.match(/^(\w[\w-]*):\s*(.*)$/)
    if (kv) fields[kv[1]] = kv[2].trim()
  }
  if (!fields.name || !fields.description) {
    throw new Error(`${path.relative(ROOT, file)} needs both name and description`)
  }
  return fields
}

function pointer({ name, description }, tool) {
  return `---
name: ${name}
description: ${description}
---

**Read \`.claude/skills/${name}/SKILL.md\` and follow it.** That file holds the actual guidance and
is written tool-agnostically, so ignore its frontmatter and treat every rule in it as if it were
written here.

This file exists only so ${tool} can see the trigger above. It is generated: run \`pnpm sync:skills\`
after editing the source, and never edit this copy by hand.
`
}

const skills = fs
  .readdirSync(SOURCE, { withFileTypes: true })
  .filter((e) => e.isDirectory() && fs.existsSync(path.join(SOURCE, e.name, 'SKILL.md')))
  .map((e) => e.name)
  .sort()

const stale = []
let written = 0

for (const { dir, tool } of MIRRORS) {
  const wanted = new Map(skills.map((name) => [name, pointer(frontmatter(path.join(SOURCE, name, 'SKILL.md')), tool)]))

  for (const [name, body] of wanted) {
    const target = path.join(dir, name, 'SKILL.md')
    const current = fs.existsSync(target) ? fs.readFileSync(target, 'utf8') : null
    if (current === body) continue
    if (check) {
      stale.push(`${path.relative(ROOT, target).replace(/\\/g, '/')} is ${current === null ? 'missing' : 'out of date'}`)
      continue
    }
    fs.mkdirSync(path.dirname(target), { recursive: true })
    fs.writeFileSync(target, body, 'utf8')
    written++
  }

  // A skill that was deleted or renamed leaves a mirror behind, and a stale trigger
  // is worse than a missing one: the agent loads guidance for something that is gone.
  if (fs.existsSync(dir)) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isDirectory() || wanted.has(entry.name)) continue
      const orphan = path.join(dir, entry.name)
      if (check) stale.push(`${path.relative(ROOT, orphan).replace(/\\/g, '/')} has no matching skill`)
      else {
        fs.rmSync(orphan, { recursive: true, force: true })
        written++
      }
    }
  }
}

if (check) {
  if (stale.length === 0) {
    console.log(`skill mirrors current: ${skills.length} skills`)
    process.exit(0)
  }
  console.error(`\n${stale.length} stale skill mirror(s). Run: pnpm sync:skills\n`)
  for (const s of stale) console.error(`  ${s}`)
  console.error('')
  process.exit(1)
}

console.log(`skill mirrors synced: ${skills.length} skills, ${written} file(s) changed`)
