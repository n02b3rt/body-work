> Read when: looking for the command that already does something, or adding a script of your own.

# Scripts

| Command | Does |
|---|---|
| `pnpm test` | unit tests in `tests/`, run by Node's own runner, no dependency |
| `pnpm migrate` | apply `src/migrations/` to the database in `DATABASE_URL` |
| `pnpm migrate:create` | generate a migration for a schema change, see [`../../runbooks/create-migrations.md`](../../runbooks/create-migrations.md) |
| `pnpm migrate:status` | which migrations have run |
| `pnpm build` | production build; still the broadest check we have |
| `pnpm generate:types` | regenerate `src/payload-types.ts` |
| `pnpm generate:importmap` | regenerate the admin import map |
| `pnpm check:messages` | verify browser-shipped translation namespaces |
| `pnpm smoke:builder` | page-builder data model, end to end (`scripts/smoke-builder.ts`) |
| `pnpm generate:tw-safelist` | regenerate the page builder's Tailwind safelist, see [`../page-builder.md`](../page-builder.md) |
| `pnpm check:docs` | enforce the documentation rules: budgets, `> Read when:` headers, links, map coverage, em-dash ratchet, skill mirrors (`scripts/check-docs.mjs`) |
| `pnpm check:perf` | per-page gzipped JS, CSS and HTML from the build against the ratchet in `scripts/perf-budget.json` (`scripts/perf-budget.mjs`) |
| `pnpm build:deploy` | build carrying `.next/cache` in and out via `NEXT_CACHE_DIR` (`scripts/build-with-cache.mjs`) |
| `pnpm backup:content` | database plus `/media` plus a manifest, into `../backups` (`scripts/backup-content.mjs`) |
| `pnpm restore:content <dir>` | put one back and verify the row counts (`scripts/restore-content.mjs`) |
| `pnpm warm:images <url>` | pre-encode every image variant a device can pick (`scripts/warm-image-cache.mjs`) |
| `pnpm sync:skills` | regenerate `.grok/skills/` from `.claude/skills/` (`scripts/sync-agent-skills.mjs`) |

Other smoke scripts, run with `pnpm payload run`: `scripts/smoke-blog-write.ts`, `smoke-gemini.ts`,
`smoke-image-display.ts`, `smoke-newsletter.ts`.
One-off maintenance: `scripts/backfill-image-sizes.ts`, `scripts/convert-richtext-to-builder.ts`.

⚠ **No `pnpm <script>` runs on Node 20**, which is what this machine has: see the pnpm gotcha in
[`index.md`](./index.md) and spell the command as `node scripts/...`.

## Related

[`index.md`](./index.md) · [`deployment.md`](./deployment.md) · skill `payload-script`
