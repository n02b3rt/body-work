# BODYWORK

One Next.js 16 app with an embedded Payload CMS 3, serving four domains from one repo and one
database, split by request host. It replaces an aging WordPress + WooCommerce site.

| Host | Site | State |
|---|---|---|
| `centrum.body-work.pl` | Centrum, the B2C club | built, 28 of 32 pages |
| `dash.body-work.pl` | shared Payload admin | built |
| `body-work.pl` | hub | not started |
| `akademia.body-work.pl` | B2B academy + shop | not started |

Stack: Next.js 16 (App Router), TypeScript, Tailwind CSS 4, Payload CMS 3, PostgreSQL, Node 20, pnpm.

## Running it locally

```bash
docker compose up -d
```
```bash
pnpm install
```
```bash
pnpm dev
```

Copy `.env.example` to `.env` first. The variables that must be set:
`DATABASE_URL`, `PAYLOAD_SECRET`, `NEXT_PUBLIC_SERVER_URL`, `NEXT_PUBLIC_DASHBOARD_URL`, `DASHBOARD_HOST`.
Optional: `RESEND_API_KEY` (without it mail is logged, not sent) and `GEMINI_API_KEY` (admin AI helpers).

- Public site: `http://localhost:3000`
- Admin: `http://dash.localhost:3000`. **Public hosts return a plain 404 for `/admin`**, by design.

Keep the port in `.env` matching the one you pass to `pnpm dev`, or admin saves fail CSRF.

## Scripts

| Command | Does |
|---|---|
| `pnpm build` | production build; the closest thing to a test suite here |
| `pnpm generate:types` | regenerate `src/payload-types.ts` after a schema change |
| `pnpm generate:importmap` | regenerate the admin import map after adding an admin component |
| `pnpm check:messages` | verify the translation namespaces shipped to the browser |
| `pnpm check:docs` | enforce the documentation rules: budgets, links, map coverage |
| `pnpm smoke:builder` | end-to-end check of the page builder data model |
| `pnpm seed:appearance` | write the sample saved compositions |

There is no unit or e2e test runner yet.

## Where to look

- **[`docs/map.md`](docs/map.md)** first, always. Where everything lives, and what is not built yet.
- [`CLAUDE.md`](CLAUDE.md) / [`AGENTS.md`](AGENTS.md): the working rules for coding agents.
- [`docs/prd/00-index.md`](docs/prd/00-index.md): requirements, by section.
- [`docs/log.md`](docs/log.md): recent decisions and gotchas.
- [`docs/migration-tracker.md`](docs/migration-tracker.md): page-by-page migration status.

Several agents working at once? Read [`docs/parallel-agents.md`](docs/parallel-agents.md) before you
start: own worktree, own database, own port, and never `docker compose down -v`.
