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
| `pnpm check:perf` | per-page gzipped JS, CSS and HTML out of the build (`scripts/perf-budget.mjs`), against the ratchet in `scripts/perf-budget.json` ([`../performance.md`](../performance.md)) |
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
- **The server is half of any performance number.** `demo.n02b3rt.pl` speaks HTTP/1.1 and cannot do
  brotli until Next stops compressing for itself:
  [`../runbooks/apache-http2-brotli.md`](../runbooks/apache-http2-brotli.md),
  [`../performance.md`](../performance.md).
- ⚠ **`embla-carousel-react` and `embla-carousel-autoplay` are declared and unused.** Nothing
  imports them; the carousels run on `src/components/ui/use-scroll-carousel.ts`. They stayed in
  `package.json` because removing them without being able to run `pnpm install` breaks
  `--frozen-lockfile` in CI. Finish it with `pnpm remove embla-carousel-react
  embla-carousel-autoplay` on Node 22.13 or newer.
- ⚠ **`pnpm` itself needs Node 22.13+.** `packageManager` pins pnpm 11.17, which imports
  `styleText` from `node:util` at load, so on anything older every pnpm command dies before it
  reads a file. `engines` says 20.9 and that is still true of the **app**, not of the toolchain:
  Next builds and runs fine on 20.9 when invoked directly
  (`node node_modules/next/dist/bin/next build`), which is the workaround when Node is too old to
  reach pnpm at all. **Do not try to maintain the lockfile with an older pnpm.** pnpm 10 strips the
  66 `libc` fields pnpm 11 writes, which is the platform-variant metadata that already broke CI
  once on `@ffmpeg-installer`.
- **New code arrives tested:** `tests/coverage.test.ts` goes red when an importable module under
  `src/lib/` or `src/access/` has no test. Its `GRANDFATHERED` list may only shrink.
- **CI:** `.github/workflows/checks.yml` runs docs and tests first (no install needed), then types
  and translations.
- ⚠ **There are no migrations, so the project cannot start on a clean database.** Payload pushes the
  schema in dev and expects migrations in production. This blocks a first deploy and is why CI does
  not run `pnpm build`: it compiles and type-checks, then dies collecting page data. Scripts are
  ready (`pnpm migrate:create`, `migrate`, `migrate:status`); the procedure is
  [`../runbooks/create-migrations.md`](../runbooks/create-migrations.md). Until then someone runs the
  build locally before merging.
- **Still missing:** end-to-end tests and browser automation.
- **`pnpm lint` is broken on `main` too** (eslint-plugin-react 7.37 vs ESLint 10, fails while linting
  `eslint.config.mjs`). A failure there is not necessarily yours.
- **`.next` has one owner at a time.** `pnpm start` holding it makes a build fail; a running
  `pnpm dev` goes further and **wipes a finished production build out of it**, which looks like the
  build silently produced nothing. Either stop the other process or send the build elsewhere:
  `NEXT_DIST_DIR=.next-build pnpm build`, honoured by `next.config.ts` and by `pnpm check:perf`.
- **`payload run` strips extra argv.** Pass switches as env vars (`DRY=1`), and print the active mode
  at startup. Scripts need top-level `await`, not an `async main()`, or the process exits 0 after one line.
- **Keep the port in `.env` matching `pnpm dev --port`**, or admin saves fail CSRF.
- **`images.localPatterns` must list `/images/**` alongside Payload's path.** Setting the key at all
  turns `next/image` into an allowlist.

## Related

[`../stack.md`](../stack.md) · [`parallel-work.md`](./parallel-work.md) · [`../architecture.md`](../architecture.md)
