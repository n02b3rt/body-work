---
name: payload-script
description: How to write a one-off or maintenance script that talks to Payload without it silently doing nothing or writing to production data by accident. Use whenever you add or run anything under scripts/ that uses payload run, a data backfill, an import, a smoke test, or a script that reports it finished but changed nothing.
---

Two traps here have each cost real time. Both look like a script that ran fine.

## 1. Use top-level `await`, never an `async main()`

Wrapped in a function, the module finishes evaluating while the promise is still pending, Node finds
no open handle, and the process **exits with code 0 having printed only the first line**. That reads
exactly like a script that ran and did nothing. It was misdiagnosed once as a schema-push prompt.

```ts
import { getPayload } from 'payload'
import config from '@payload-config'

const payload = await getPayload({ config })   // top level, no wrapper
// … work …
process.exit(0)
```

`src/seed/appearance-samples.ts` and `scripts/smoke-page-builder.ts` are the working shape.

## 2. `payload run` strips extra argv

Inside the script, `process.argv` holds only the node binary and Payload's `bin.js`, so a `--dry`
flag reads as **absent**. A "dry run" of `scripts/fix-blog-from-reference.ts` wrote all 62 posts
before this was understood.

**Pass switches as environment variables, and print the active mode at startup:**

```bash
DRY=1 pnpm payload run scripts/your-script.ts
```

## Writing safely

- **Default to reporting, not writing.** `scripts/content-health.ts` is the model: it produces a
  worklist and changes nothing.
- **Print a summary of what would change before changing it**, and count what you touched afterwards.
- **Reads that involve the page builder need `depth: 3`**, or saved compositions come back as bare ids.
- **Unpublishing is `data: { _status: 'draft' }` without `draft: true`.** With the flag, Payload
  writes a new draft *version* and the published row stays live: the smoke test caught that.
- **Drafts are separate documents.** Public queries filter `_status: { not_equals: 'draft' }`.
- Your worktree has its own database. A script you run hits **your** data, not another agent's, and
  never production. Confirm `DATABASE_URL` before a destructive run.

## Registering it

Add a `package.json` script only if it will be run repeatedly; one-offs stay `pnpm payload run …`.
Either way the file gets a line in `docs/map/infra.md` (or its own domain file), which
`pnpm check:docs` enforces.
