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
`package.json`. Static assets in `public/`. `.gitattributes` pins every checkout to LF.

## Scripts

| Command | Does |
|---|---|
| `pnpm test` | unit tests in `tests/`, run by Node's own runner, no dependency |
| `pnpm migrate` | apply `src/migrations/` to the database in `DATABASE_URL` |
| `pnpm migrate:create` | generate a migration for a schema change, see [`../runbooks/create-migrations.md`](../runbooks/create-migrations.md) |
| `pnpm migrate:status` | which migrations have run |
| `pnpm build` | production build; still the broadest check we have |
| `pnpm generate:types` | regenerate `src/payload-types.ts` |
| `pnpm generate:importmap` | regenerate the admin import map |
| `pnpm check:messages` | verify browser-shipped translation namespaces |
| `pnpm smoke:builder` | page-builder data model, end to end (`scripts/smoke-builder.ts`) |
| `pnpm generate:tw-safelist` | regenerate the page builder's Tailwind safelist, see [`page-builder.md`](./page-builder.md) |
| `pnpm check:docs` | enforce the documentation rules: budgets, `> Read when:` headers, links, map coverage, em-dash ratchet, skill mirrors (`scripts/check-docs.mjs`) |
| `pnpm sync:skills` | regenerate `.grok/skills/` from `.claude/skills/` (`scripts/sync-agent-skills.mjs`) |

Other smoke scripts, run with `pnpm payload run`: `scripts/smoke-blog-write.ts`, `smoke-gemini.ts`,
`smoke-image-display.ts`, `smoke-newsletter.ts`.
One-off maintenance: `scripts/backfill-image-sizes.ts`, `scripts/convert-richtext-to-builder.ts`.

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
- ⚠ **A schema change without a migration breaks every environment but yours.** `src/migrations/`
  now shapes an empty database, which is what lets CI build and a container start. The dev-mode push
  cannot cover for a missing one: the adapter gates it on `NODE_ENV` before reading the `push`
  option, so there is no flag that makes production push. Procedure:
  [`../runbooks/create-migrations.md`](../runbooks/create-migrations.md).
- ⚠ **`next/font/google` fetches its font at build time.** An image build on a network that blocks
  `fonts.googleapis.com` fails there and nowhere else. The font is self-hosted afterwards.
- **Still missing:** end-to-end tests and browser automation.
- **`pnpm lint` is broken on `main` too** (eslint-plugin-react 7.37 vs ESLint 10, fails while linting
  `eslint.config.mjs`). A failure there is not necessarily yours.
- **`pnpm build` can fail spuriously if `pnpm start` is holding `.next`.** Kill the server first.
- **`payload run` strips extra argv.** Pass switches as env vars (`DRY=1`), and print the active mode
  at startup. Scripts need top-level `await`, not an `async main()`, or the process exits 0 after one line.
- **Keep the port in `.env` matching `pnpm dev --port`**, or admin saves fail CSRF.
- **`images.localPatterns` must list `/images/**` alongside Payload's path.** Setting the key at all
  turns `next/image` into an allowlist.

## Deployment

Not the Hetzner target in [`../stack.md`](../stack.md): a client demo, self-hosted on TrueNAS.

- `Dockerfile` builds it, standing up a throwaway Postgres of its own because `next build`
  reaches Payload for page data. `.dockerignore` trims the context, `docker-entrypoint.sh`
  migrates before starting the server.
- `.github/workflows/release.yml` publishes the image to GHCR, by hand or on a `v*` tag.
- `deploy/truenas/docker-compose.yml` is the app definition, with Nginx Proxy Manager in front.
- Procedure, content import and the update path: [`../runbooks/deploy-demo.md`](../runbooks/deploy-demo.md).

## Related

[`../stack.md`](../stack.md) · [`parallel-work.md`](./parallel-work.md) · [`../architecture.md`](../architecture.md)
