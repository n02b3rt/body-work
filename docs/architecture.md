> Read when: you need the system in one picture: which module owns what, how data flows, what talks to the outside.


> Overview for humans and coding agents. Written in English. This is a map, not the spec: full detail lives in `prd/` (start at [`prd/00-index.md`](./prd/00-index.md)); keep this in sync when the real system diverges from it.

## What this is

One Next.js 16 app + embedded Payload CMS 3, serving four domains from one repo and one database, split by request host:

| Domain | Site | Role |
|---|---|---|
| `body-work.pl` | Hub | Landing, routes to Centrum / Akademia / Alfabet Ruchu (external) |
| `centrum.body-work.pl` | Centrum | B2C fitness club |
| `akademia.body-work.pl` | Akademia | B2B training academy + e-commerce shop |
| `dash.body-work.pl` | Dashboard | Shared Payload admin |

Full domain/routing model: [`sites.md`](./sites.md). Full rationale for "one app, four domains": PRD §7.2.

How it works:

- **The product** is the Next.js app. Public pages under `src/app/[locale]/`, Payload in-process
  under `src/app/(payload)/` against self-hosted PostgreSQL. No separate CMS server.
- **Content** is edited in Payload and read in Server Components via `getPayload()`, so reads never
  make an HTTP round trip.
- **The reference** is a Python mirror of the live site in `scripts/scrape/scraped/` (gitignored,
  regenerable), so the real content and layout stay available locally.

Status (2026-08-01):

- **Centrum:** 28 of 32 content pages built on a shared component library, most bilingual.
  Per-page detail in [`migration-tracker.md`](./migration-tracker.md).
- **Payload:** nine collections (`Users`, `Media`, `Pages`, `Posts`, `Categories`, `Authors`,
  `PostTranslations`, `Subscribers`, `SiteComponents`), two globals (`SiteSettings`, `ThemeColors`),
  and a page builder whose elements render both the admin canvas and the site.
- **Not done:** marketing copy still lives in `messages/*.json`, not in Payload. Hub and Akademia are
  not started. The rest of what does not exist is listed in [`map.md`](./map.md).

## Main modules

| Module | Responsibility | Path |
|---|---|---|
| Public frontend | Locale-aware pages/layouts, marketing UI | `src/app/[locale]/` |
| i18n config | next-intl routing, request config, locale-aware navigation | `src/i18n/` |
| UI translations | PL/EN message catalogs | `messages/` |
| Host + locale routing | One proxy: dashboard-host gating, then next-intl (Next.js 16 renamed `middleware.ts` → `proxy.ts`, see Gotchas) | `src/proxy.ts` |
| UI primitives | Container (the max-width fix), Button, SectionHeading | `src/components/ui/` |
| Centrum components | Header, Footer, Hero, PromoBar, and the other section blocks | `src/components/centrum/` |
| Payload CMS | Admin UI, REST/GraphQL, auth, uploads | `src/app/(payload)/`, `src/payload.config.ts`, `src/collections/`, `src/globals/` |
| Admin shell / nav | Custom nested sidebar + package updates/libraries views | `src/admin/nav-tree.ts`, `src/components/admin/AdminNav.tsx`, `ComingSoonView.tsx`, `UpdatesView.tsx`, `LibrariesView.tsx`, `src/lib/package-updates.ts`, `src/app/api/admin/package-updates/` ; Aktualizacje = outdated + versions + release notes; Biblioteki = inventory + icons |
| Media library | Upload a11y/SEO fields, conversion, explorer UI | `src/collections/Media.ts`, `src/components/admin/media/`, `docs/media.md` |
| Access / roles | RBAC helpers | `src/access/` |
| PostgreSQL | CMS data store (local Docker; same on Hetzner VPS) | `docker-compose.yml` (dev) |
| Scraper toolkit | Mirrors the Centrum design reference | `scripts/scrape/` |

## Data flow

- **Centrum reference:** `scripts/scrape/scraped/` → read manually for content/structure → reimplemented as native React/Tailwind in `src/app/[locale]/`. Never imported or served at runtime.
- **Editable content:** Postgres ← Payload admin / API ←→ frontend via `getPayload()` in Server Components (in-process Local API, no HTTP round-trip: PRD §7.4). The existing page copy is still in `messages/*.json`; migrating it into collections is deliberate future work, not automatic.
- **Akademia:** no reference yet (design pending): build the data model and backend first, against a neutral layout (PRD §15 risk mitigation).

## Gotchas

- **Next.js 16 renamed `middleware.ts` to `proxy.ts`** ("Middleware is now called Proxy... functionality remains the same": `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`). Same location (`src/` root), same `config.matcher` shape, export `proxy` (named) or default instead of `middleware`. A file named `middleware.ts` still half-works but prints a deprecation warning at build time, if you see that warning, this is why.

- **A custom breakpoint does not automatically beat a smaller built-in one.** `sm:grid-cols-2 wide:grid-cols-3` on the same element renders **two** columns above 1060px: the `sm` rule wins, so the `wide` override never lands. Found on the blog grid, measured with `getComputedStyle` (a probe carrying only `wide:grid-cols-3` gave three columns; adding `sm:grid-cols-2` dropped it back to two). The project's `--breakpoint-wide: 1060px` and `--breakpoint-nav: 1340px` are fine on their own; the trap is pairing one with a *built-in* breakpoint variant for the **same property**. Either stay within the built-ins (`sm:`/`lg:`) for that property, or express every step of it with custom breakpoints. Worth a look wherever `wide:` sits next to `sm:`/`md:`/`lg:`.

- **`payload run` strips extra argv.** `process.argv` inside a script contains only the node binary and Payload's `bin.js`, so a `--dry` style flag silently reads as absent, a "dry run" of `scripts/fix-blog-from-reference.ts` wrote all 62 posts before this was understood. Pass switches as environment variables (`DRY=1 pnpm payload run …`) and print the active mode at startup.

- **Admin POSTs need CSRF Origin to match the dashboard URL (and port).** Payload accepts the session cookie on GETs via `Sec-Fetch-Site`, but on POST it requires `Origin` ∈ `config.csrf`. A parallel-agent port drift (`pnpm dev` on :3000 while `.env` has `NEXT_PUBLIC_DASHBOARD_URL=…:3003`) leaves the panel looking logged in while save/form-state return Unauthorized / 403. Dev csrf/cors also allow ports 3000–3005 for `dash.localhost` / `localhost` / `127.0.0.1`; still prefer matching `.env` to `--port`. See [`parallel-agents.md`](./parallel-agents.md).

- **A programmatic scroll does not drive `IntersectionObserver` in the browser-automation context.** `window.scrollTo(...)` evaluated through the extension moves `scrollY` and reflows, but no observer callback is delivered, not even the initial one the spec guarantees on `observe()`. This cost real time on the blog listing's lazy rendering: a hand-attached probe observer logged **zero** events, which reads exactly like a broken effect. Verifying with a real scroll (the `computer` tool's scroll action) revealed the code had been correct all along. **When checking anything driven by an observer, use real input events.**

## Integrations / external dependencies

- **Centrum design reference:** `https://bodywork.testowe.eu`: mirrored by `scripts/scrape/scrape_site.py`; itself a page-builder export, not final design (PRD §6.2): treat as structural/visual reference only.
- **Akademia design:** not yet delivered, see [`sites.md`](./sites.md) and PRD §6.3/§15 (top schedule risk).
- **Payload CMS:** in-process; admin **only** at `NEXT_PUBLIC_DASHBOARD_URL` (dev: `http://dash.localhost:3000`); env: `DATABASE_URL`, `PAYLOAD_SECRET`, `NEXT_PUBLIC_SERVER_URL`, `NEXT_PUBLIC_DASHBOARD_URL`, `DASHBOARD_HOST`.
- **PostgreSQL 16:** local via Docker Compose; production intended on the same Hetzner VPS as the Node app.
- **Host proxy:** [`src/proxy.ts`](../src/proxy.ts): dashboard host rewrites `/` → `/admin`; non-dashboard hosts return 404 for `/admin`; everything else is handed to next-intl.
- **next-intl:** public site strings in `messages/*.json`; config in `src/i18n/`.
- Payments, email, calendar, e-commerce, and infra integrations, see [`stack.md`](./stack.md) and PRD §7/§9/§11: none wired up yet.
