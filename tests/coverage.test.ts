import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * A ratchet, not a coverage percentage.
 *
 * If a module under `src/lib/` or `src/access/` can be imported by this runner and
 * nothing in `tests/` imports it, this fails and names the file. Write the test, or
 * add the file to GRANDFATHERED with a reason.
 *
 * **GRANDFATHERED may shrink. It may never grow.** Anything new arrives tested.
 */

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SOURCE_DIRS = ['src/lib', 'src/access']

/** Modules that predate the suite. Delete a line when you cover one. */
const GRANDFATHERED = new Set([
  'src/lib/ai/client.ts',
  'src/lib/ai/gemini.ts',
  'src/lib/ai/prompts.ts',
  'src/lib/ai/tasks.ts',
  'src/lib/blog-page-size.ts',
  'src/lib/cn.ts',
  'src/lib/component-styles.ts',
  'src/lib/element-catalog.ts',
  'src/lib/element-icons.ts',
  'src/lib/email.ts',
  'src/lib/external-links.ts',
  'src/lib/image-display.ts',
  'src/lib/package-updates-shared.ts',
  'src/lib/package-updates.ts',
  'src/lib/payload-email.ts',
  'src/lib/static-blur.ts',
  'src/lib/theme-css.ts',
  'src/lib/theme-tokens.ts',
  'src/lib/users/index.ts',
])

function walk(dir: string, out: string[] = []): string[] {
  const full = path.join(ROOT, dir)
  if (!fs.existsSync(full)) return out
  for (const entry of fs.readdirSync(full, { withFileTypes: true })) {
    const rel = `${dir}/${entry.name}`
    if (entry.isDirectory()) walk(rel, out)
    else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts')) out.push(rel)
  }
  return out
}

/**
 * Can `node --test` load this module at all? It cannot resolve the `@/…` aliases,
 * anything reaching Payload, or a relative import written without its extension.
 * Type-only imports vanish under type stripping, so they never block.
 */
function reachable(file: string): boolean {
  const source = fs.readFileSync(path.join(ROOT, file), 'utf8')
  const runtimeImports = source
    .split(/\r?\n/)
    .filter((line) => /^\s*(import|export)\s/.test(line) && !/^\s*(import|export)\s+type\s/.test(line))

  for (const line of runtimeImports) {
    const match = line.match(/from\s+['"]([^'"]+)['"]/)
    if (!match) continue
    const specifier = match[1]!
    if (specifier.startsWith('node:')) continue
    if (specifier.startsWith('.')) {
      if (!specifier.endsWith('.ts')) return false // node will not guess the extension
      continue
    }
    return false // an alias or a package: out of reach here
  }
  return true
}

const testSources = walk('tests').map((f) => fs.readFileSync(path.join(ROOT, f), 'utf8')).join('\n')

test('every importable module under src/lib and src/access has a test', () => {
  const missing: string[] = []

  for (const dir of SOURCE_DIRS) {
    for (const file of walk(dir)) {
      if (GRANDFATHERED.has(file)) continue
      if (!reachable(file)) continue
      const importPath = `../${file.replace(/^src\//, 'src/')}`
      if (!testSources.includes(importPath)) missing.push(file)
    }
  }

  assert.deepEqual(
    missing,
    [],
    `these modules can be tested and are not:\n  ${missing.join('\n  ')}\n` +
      'Add a test under tests/, or list the file in GRANDFATHERED with a reason.',
  )
})

test('the grandfathered list only shrinks', () => {
  // A file listed here that no longer exists, or has since been covered, is a line
  // to delete. Keeping it would let a real gap hide behind a stale entry.
  const stale = [...GRANDFATHERED].filter((file) => {
    if (!fs.existsSync(path.join(ROOT, file))) return true
    return testSources.includes(`../${file}`)
  })

  assert.deepEqual(stale, [], `remove these from GRANDFATHERED, they are covered or gone:\n  ${stale.join('\n  ')}`)
})
