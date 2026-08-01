> Read when: setting up locally, changing build or lint config, adding a script, or trying to verify a change.

# Infra and dev

Everything self-hosted. Postgres in Docker locally and on the same Hetzner VPS in production; no
managed database, no SaaS where a mature open-source option exists.

## Local setup

```bash
docker compose up -d
```
```bash
pnpm install
```
```bash
pnpm dev
```

- Database: `docker-compose.yml` → `localhost:5432`, DB `bodywork`
- Environment: copy `.env.example`. Required: `DATABASE_URL`, `PAYLOAD_SECRET`,
  `NEXT_PUBLIC_SERVER_URL`, `NEXT_PUBLIC_DASHBOARD_URL`, `DASHBOARD_HOST`.
  Optional: `RESEND_API_KEY`, `GEMINI_API_KEY`
- Public site `http://localhost:3000`, admin `http://dash.localhost:3000`

## Config files

`next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs`, `pnpm-workspace.yaml`,
`package.json`. Static assets in `public/`.

## Scripts

| Command | Does |
|---|---|
| `pnpm test` | unit tests in `tests/`, run by Node's own runner, no dependency |
| `pnpm build` | production build; still the broadest check we have |
| `pnpm generate:types` | regenerate `src/payload-types.ts` |
| `pnpm generate:importmap` | regenerate the admin import map |
| `pnpm check:messages` | verify browser-shipped translation namespaces |
| `pnpm smoke:builder` | page-builder data model, end to end |
| `pnpm seed:appearance` | write the sample saved compositions |
| `pnpm check:docs` | enforce the documentation rules: budgets, `> Read when:` headers, links, map coverage, em-dash ratchet, skill mirrors (`scripts/check-docs.mjs`) |
| `pnpm sync:skills` | regenerate `.grok/skills/` from `.claude/skills/` (`scripts/sync-agent-skills.mjs`) |

Other smoke scripts, run with `pnpm payload run`: `scripts/smoke-blog-write.ts`, `smoke-gemini.ts`,
`smoke-image-display.ts`, `smoke-newsletter.ts`.
One-off maintenance: `scripts/backfill-image-sizes.ts`, `scripts/seed-translation-example.ts`.

## Gotchas

- **Tests live in `tests/`, run by Node's own runner**, which executes the TypeScript directly, so
  there is no test dependency. They cover **pure functions only**: `node` resolves neither the `@/…`
  path aliases nor anything reaching Payload, and that is the line where Vitest would start earning
  its keep. Adding it is a stack change: ask first. The PRD names Vitest and Playwright; neither is installed.
- ⚠ **`pnpm test` needs Node 22.18+**, where running TypeScript without a build landed. `engines`
  still says 20 because that is what the app needs; `.github/workflows/checks.yml` pins 22 for the tests.
- **New code arrives tested:** `tests/coverage.test.ts` goes red when an importable module under
  `src/lib/` or `src/access/` has no test. Its `GRANDFATHERED` list may only shrink.
- **CI:** `.github/workflows/checks.yml` runs docs and tests first (no install needed), then types
  and translations.
- ⚠ **CI does not run `pnpm build`, and cannot yet.** It compiles and type-checks, then fails while
  collecting page data, because static generation reaches Payload and needs `PAYLOAD_SECRET` plus a
  real database. A fresh Postgres would not fix it: **this project has no migrations**, the schema is
  pushed in dev mode, so a clean database has no tables to query. Giving Payload a migration story is
  the prerequisite. Until then, someone runs the build locally before merging.
- **Still missing:** end-to-end tests and browser automation.
- **`pnpm lint` is broken on `main` too** (eslint-plugin-react 7.37 vs ESLint 10, fails while linting
  `eslint.config.mjs`). A failure there is not necessarily yours.
- **`pnpm build` can fail spuriously if `pnpm start` is holding `.next`.** Kill the server first.
- **`payload run` strips extra argv.** Pass switches as env vars (`DRY=1`), and print the active mode
  at startup. Scripts need top-level `await`, not an `async main()`, or the process exits 0 after one line.
- **Keep the port in `.env` matching `pnpm dev --port`**, or admin saves fail CSRF.
- **`images.localPatterns` must list `/images/**` alongside Payload's path.** Setting the key at all
  turns `next/image` into an allowlist.

## Related

[`../stack.md`](../stack.md) · [`parallel-work.md`](./parallel-work.md) · [`../architecture.md`](../architecture.md)
