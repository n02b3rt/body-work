import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { builderAllClasses, builderBaseClasses } from '../src/lib/builder/tw-safelist.ts'
import { ELEMENT_DEFINITIONS } from '../src/lib/builder/elements/registry.ts'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

test('every base class produces its bare, md: and lg: forms', () => {
  const base = builderBaseClasses()
  const all = new Set(builderAllClasses())
  for (const cls of base) {
    assert.ok(all.has(cls), `missing bare form: ${cls}`)
    assert.ok(all.has(`md:${cls}`), `missing md: form: ${cls}`)
    assert.ok(all.has(`lg:${cls}`), `missing lg: form: ${cls}`)
  }
})

test('there are no duplicate or empty entries', () => {
  const all = builderAllClasses()
  assert.equal(new Set(all).size, all.length)
  assert.ok(all.every((cls) => cls.length > 0))
})

test('every literal class in every element definition\'s defaultTw is covered', () => {
  const all = new Set(builderAllClasses())
  const missing: string[] = []

  for (const definition of ELEMENT_DEFINITIONS) {
    for (const [breakpoint, classes] of Object.entries(definition.defaultTw)) {
      for (const cls of classes ?? []) {
        const prefixed = breakpoint === 'base' ? cls : `${breakpoint}:${cls}`
        if (!all.has(prefixed)) missing.push(`${definition.type}: ${prefixed}`)
      }
    }
  }

  assert.deepEqual(missing, [], `these element defaults are not in the safelist:\n  ${missing.join('\n  ')}`)
})

test('the checked-in stylesheet matches what the generator would write right now', () => {
  const cssPath = path.join(ROOT, 'src/styles/builder-safelist.css')
  const current = readFileSync(cssPath, 'utf8')
  const expectedClasses = builderAllClasses().join(' ')

  assert.ok(
    current.includes(expectedClasses),
    'src/styles/builder-safelist.css is stale: run `pnpm generate:tw-safelist`',
  )
})
