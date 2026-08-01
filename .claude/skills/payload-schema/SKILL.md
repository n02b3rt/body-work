---
name: payload-schema
description: What to regenerate and what can silently break after a Payload schema change. Use whenever you add or edit anything under src/collections/, src/globals/, src/fields/, or src/payload.config.ts, when a field type changes, or when the dev server prompts about pushing a schema change to the database.
---

After the change, both of these, in this order:

```bash
pnpm generate:types
```
```bash
pnpm generate:importmap
```

`src/payload-types.ts` (754 KB) and `src/app/(payload)/admin/importMap.js` are **generated**. Never
hand-edit them, never hand-merge them: take either side of a conflict and regenerate. Never read
`payload-types.ts` in full; grep it.

Four things that bite:

- **Payload pushes the dev schema on startup.** If it asks about a destructive change, stop and ask
  the user. Do not answer it by wiping the shared Docker volume: `docker compose down -v` destroys
  every parallel agent's database.
- **Changing a field's type** (select to text, say) can prompt a data-loss warning on the next
  `pnpm dev`. Read the prompt, don't reflex-accept.
- **A block's `dbName` must be a function**, not a string. A bare string replaces the whole table
  name and collapses every block of that type into one table. Postgres also caps identifiers at 63
  characters, which the deepest builder path hits.
- **`payload run` strips extra argv.** Flags like `--dry` silently read as absent; pass switches as
  env vars (`DRY=1 pnpm payload run …`). Scripts need top-level `await`, not an `async main()`, or
  the process exits 0 after printing one line.

Access rules and roles: `src/access/roles.ts`. Never invent a parallel permission check.
