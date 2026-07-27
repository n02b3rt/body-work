/**
 * Fails if `CLIENT_NAMESPACES` has drifted from what client components actually read.
 *
 * Run with: `pnpm check:messages`
 *
 * Only the namespaces listed there are sent to the browser, so a `useTranslations("X")` added
 * to a `"use client"` file without updating the list makes next-intl render the key path
 * instead of the text. That is easy to miss in a component nobody visits often, hence a check
 * rather than a comment and good intentions.
 *
 * Plain Node on purpose, and it reads the namespace list out of the source rather than
 * importing it: no transpiler, no Payload boot, so it can sit in front of a build.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'

const SRC = path.resolve(process.cwd(), 'src')
const LIST_FILE = path.join(SRC, 'i18n', 'client-namespaces.ts')

function walk(dir) {
  const out = []
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry)
    if (statSync(full).isDirectory()) out.push(...walk(full))
    else if (/\.tsx?$/.test(entry)) out.push(full)
  }
  return out
}

const listSource = readFileSync(LIST_FILE, 'utf8')
const block = listSource.match(/CLIENT_NAMESPACES\s*=\s*\[([\s\S]*?)\]/)
if (!block) {
  console.error(`Could not find CLIENT_NAMESPACES in ${LIST_FILE}`)
  process.exit(1)
}
const declared = new Set([...block[1].matchAll(/["']([A-Za-z]+)["']/g)].map((m) => m[1]))

const used = new Map()
const suspicious = []

/** Comments contain examples and disabled code; neither ships a translation. */
function stripComments(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1')
}

for (const file of walk(SRC)) {
  // The list file documents the pattern it checks for, so scanning it finds its own example.
  if (path.resolve(file) === LIST_FILE) continue

  const raw = readFileSync(file, 'utf8')
  if (!raw.includes('"use client"') && !raw.includes("'use client'")) continue
  const source = stripComments(raw)

  // A namespace given as anything other than a literal cannot be checked statically.
  if (/useTranslations\(\s*[^'")\s]/.test(source) || /useTranslations\(\s*\)/.test(source)) {
    suspicious.push(path.relative(process.cwd(), file))
  }

  for (const match of source.matchAll(/useTranslations\(\s*["']([A-Za-z]+)["']\s*\)/g)) {
    const namespace = match[1]
    used.set(namespace, [...(used.get(namespace) ?? []), path.basename(file)])
  }
}

const missing = [...used.keys()].filter((ns) => !declared.has(ns)).sort()
const unused = [...declared].filter((ns) => !used.has(ns)).sort()

console.log(`client components read ${used.size} namespace(s); ${declared.size} declared`)

if (suspicious.length > 0) {
  console.log('\nCould not check statically (dynamic or bare useTranslations):')
  for (const file of suspicious) console.log(`  ${file}`)
}

if (unused.length > 0) {
  console.log(`\nDeclared but no longer read, safe to remove: ${unused.join(', ')}`)
}

if (missing.length > 0) {
  console.error('\nMISSING from CLIENT_NAMESPACES, these will render as key paths:')
  for (const ns of missing) console.error(`  ${ns}  (used in ${used.get(ns).join(', ')})`)
  console.error('\nAdd them to src/i18n/client-namespaces.ts')
  process.exit(1)
}

console.log('\nok: every namespace a client component reads is declared')
