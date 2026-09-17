> Read when: setting up locally, changing build or lint config, or trying to verify a change.

# Infra and dev

Everything self-hosted. Postgres in Docker locally and on the same Hetzner VPS in production; no
managed database, no SaaS where a mature open-source option exists.

Commands: [`scripts.md`](./scripts.md). Shipping a build: [`deployment.md`](./deployment.md).

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

## Gotchas

- **Tests live in `tests/`, run by Node's own runner**, so there is no test dependency. They cover
  **pure functions only**: `node` resolves neither the `@/…` aliases nor anything reaching Payload,
  which is where Vitest would start earning its keep. Adding it is a stack change: ask first.
- ⚠ **`pnpm test` needs Node 22.18+**, where running TypeScript without a build landed. `engines`
  still says 20 because that is what the app needs; `.github/workflows/checks.yml` pins 22 for the tests.
- **New code arrives tested:** `tests/coverage.test.ts` goes red when an importable module under
  `src/lib/` or `src/access/` has no test. Its `GRANDFATHERED` list may only shrink.
- **CI:** `.github/workflows/checks.yml` runs docs and tests first (no install needed), then types
  and translations.
- ⚠ **`pnpm` needs Node 22.13+, so on this machine no `pnpm <script>` runs at all.**
  `packageManager` pins 11.17, which imports `styleText` from `node:util` at load. The runbooks
  therefore spell every command as `node scripts/...`; the `package.json` entries are the nicer
  form once Node moves. `engines` says 20.9 and that is true of the **app**: `node
  node_modules/next/dist/bin/next build` works there. **Do not maintain the lockfile with an older
  pnpm:** pnpm 10 rewrites 429 lines and drops fields pnpm 11 writes.
- ⚠ **The two `embla-carousel-*` packages are declared and unused.** The carousels run on
  `ui/use-scroll-carousel.ts`. Dropping them from `package.json` without running `pnpm install`
  breaks `--frozen-lockfile`, so finish it with `pnpm remove` on Node 22.13+.
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
- **The server is half of any performance number.** `demo.n02b3rt.pl` still speaks HTTP/1.1
  (1390 ms per Lighthouse); brotli is done. [`../../performance.md`](../../performance.md).

## Related

[`scripts.md`](./scripts.md) · [`deployment.md`](./deployment.md) · [`../../stack.md`](../../stack.md) ·
[`../parallel-work.md`](../parallel-work.md) · [`../../architecture.md`](../../architecture.md)
