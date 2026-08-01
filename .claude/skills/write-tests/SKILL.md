---
name: write-tests
description: How to write and run tests here, and what is worth testing at all. Use whenever you add or change a function under src/lib or src/access, when pnpm test reports a module that has no test, when you are about to write a comment explaining why some code must not change, or when you need to confirm a fix actually fixed something.
---

```bash
pnpm test
```

Node's own runner, executing the TypeScript directly. **No test dependency**, and the whole suite
runs in well under a second, so run it often rather than once at the end.

## Writing one

Files live in `tests/`, mirroring `src/`, one per module. **Imports need the explicit `.ts`
extension**, because `node` will not guess it:

```ts
import test from 'node:test'
import assert from 'node:assert/strict'

import { mediaFrom } from '../src/lib/media.ts'

test('cardWide never substitutes for another size', () => {
  assert.notEqual(mediaFrom(doc({ cardWide: { url: '/crop.webp' } }), 'hero')?.url, '/crop.webp')
})
```

**Name the test after the guarantee, not the function.** `cardWide never substitutes for another
size` tells the next reader what broke; `mediaFrom works` tells them nothing.

## What is worth testing

- **Anything you were about to explain in a comment.** "This must stay out of the fallback chain",
  "a bare string collapses the table", "roles that no longer exist must grant nothing": those are
  tests waiting to be written, and a comment does not fail when someone ignores it.
- **Branching on nothing:** null, undefined, empty string, whitespace, a value from before a rename.
- **Anything a client asked for by name.** It will look like a bug to whoever comes next.
- Not thin wrappers, constants, or code whose only assertion restates the implementation.

**Assert by shape when the exact output is not ours.** Date formatting is checked with a regex, not a
literal string, so an ICU update in Node does not turn the suite red for no reason.

## The boundary, and it is a hard one

`node` resolves neither the `@/…` path aliases nor anything that reaches Payload, so those modules
**cannot be tested here at all**. If your change lives behind that line, say so rather than faking a
test: Vitest is where that starts being solvable, and adding it is a stack change that needs asking.

## The ratchet

`tests/coverage.test.ts` fails when a module under `src/lib/` or `src/access/` is importable and has
no test. Adding a new helper without one **turns the suite red immediately**, which is the point.

Modules that predate the suite are listed in `GRANDFATHERED`. **That list may shrink, never grow.**
Covering one means deleting its line, and a second test fails if you forget.

## Before you claim it passes

Break the thing on purpose and watch the test go red. A test that cannot fail is worse than no test,
because it buys confidence it has not earned.
