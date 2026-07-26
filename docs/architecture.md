# Architecture — BODYWORK ecosystem

> Overview for humans and coding agents. Written in English. This is a map, not the spec — full detail lives in `PRD.md`; keep this in sync when the real system diverges from it.

## What this is

One Next.js 16 app + embedded Payload CMS 3, serving four domains from one repo and one database, split by request host:

<<<<<<< HEAD
| Domain | Site | Role |
|---|---|---|
| `body-work.pl` | Hub | Landing, routes to Centrum / Akademia / Alfabet Ruchu (external) |
| `centrum.body-work.pl` | Centrum | B2C fitness club |
| `akademia.body-work.pl` | Akademia | B2B training academy + e-commerce shop |
| `dash.body-work.pl` | Dashboard | Shared Payload admin |

Full domain/routing model: [`sites.md`](./sites.md). Full rationale for "one app, four domains": PRD §7.2.

How it works in one paragraph: the Python toolkit in `scripts/scrape/` mirrors the live site's pages, assets, and media into `scripts/scrape/scraped/` (gitignored, regenerable) so the real content and layout are visible locally without depending on the old site staying up. The Next.js app is the product: public pages live under `src/app/[locale]/`, while Payload CMS runs in-process under `src/app/(payload)/` (admin at `/admin`, reachable only on the dashboard host; API at `/api`) against self-hosted PostgreSQL. Content is edited in Payload and read in Server Components via `getPayload()` — no separate CMS server.

Status: all 22 Centrum pages are built and bilingual against the scraper mirror reference (see [`scraped-site-map.md`](./scraped-site-map.md)) on a shared component library, and the Payload backend is installed with `Users`/`Media`/`Pages`/`Posts` plus a `SiteSettings` global. The page copy still lives in `messages/*.json` and has not been migrated into Payload yet. Hub and Akademia are not started.

## Main modules

| Module | Responsibility | Path |
|---|---|---|
| Public frontend | Locale-aware pages/layouts, marketing UI | `src/app/[locale]/` |
| i18n config | next-intl routing, request config, locale-aware navigation | `src/i18n/` |
| UI translations | PL/EN message catalogs | `messages/` |
| Host + locale routing | One proxy: dashboard-host gating, then next-intl (Next.js 16 renamed `middleware.ts` → `proxy.ts` — see Gotchas) | `src/proxy.ts` |
| UI primitives | Container (the max-width fix), Button, SectionHeading | `src/components/ui/` |
| Centrum components | Header, Footer, Hero, PromoBar, and the other section blocks | `src/components/centrum/` |
| Payload CMS | Admin UI, REST/GraphQL, auth, uploads | `src/app/(payload)/`, `src/payload.config.ts`, `src/collections/`, `src/globals/` |
| Admin shell / nav | Custom nested sidebar + coming-soon stubs | `src/admin/nav-tree.ts`, `src/components/admin/AdminNav.tsx`, `ComingSoonView.tsx` |
| Access / roles | RBAC helpers | `src/access/` |
| PostgreSQL | CMS data store (local Docker; same on Hetzner VPS) | `docker-compose.yml` (dev) |
| Scraper toolkit | Mirrors the Centrum design reference | `scripts/scrape/` |

## Data flow

- **Centrum reference:** `scripts/scrape/scraped/` → read manually for content/structure → reimplemented as native React/Tailwind in `src/app/[locale]/`. Never imported or served at runtime.
- **Editable content:** Postgres ← Payload admin / API ←→ frontend via `getPayload()` in Server Components (in-process Local API, no HTTP round-trip — PRD §7.4). The existing page copy is still in `messages/*.json`; migrating it into collections is deliberate future work, not automatic.
- **Akademia:** no reference yet (design pending) — build the data model and backend first, against a neutral layout (PRD §15 risk mitigation).

## Key decisions (lightweight ADR)

Record deliberate choices so nobody re-litigates them a month later without cause. For domain-specific gotchas (not cross-cutting decisions), use the "Gotchas" section of the relevant `docs/<topic>.md` file instead of adding a row here.

| Date | Decision | Why |
|---|---|---|
| 2026-07-24 | Stack choice: Next.js 16 (App Router) + TypeScript + Tailwind CSS 4 | Modern React framework, good fit for a marketing/content site with room for future dynamic features (booking, CMS) |
| 2026-07-24 | Kept the existing Python scraper toolkit as `scripts/scrape/`, output gitignored | Preserves the working mirror tool as a content reference without bloating the repo (mirror is ~300MB) |
| 2026-07-25 | One Next.js app serving 4 domains (hub/centrum/akademia/dash) via host-based middleware, not 4 separate projects | Payload's Local API needs to live in-process; ~70% component sharing between Centrum/Akademia; one deploy to maintain. Full detail: PRD §7.2, [`sites.md`](./sites.md) |
| 2026-07-25 | Database: self-hosted PostgreSQL on the Hetzner VPS (Docker), **not** NeonDB | A stray stack note floated NeonDB, which conflicts with PRD's "zero abonamentów SaaS" cardinal rule and cost model (§9). Confirmed with the user — self-hosted stands. |
| 2026-07-25 | No Prisma / no second ORM | Payload already owns the schema, migrations, and query layer; a second ORM on the same Postgres instance is redundant and a migration-conflict risk. Confirmed with the user. |
| 2026-07-25 | Bilingual (PL/EN) from day one via next-intl (UI strings) + Payload localization (content fields) | PRD §8.10 requires full PL/EN parity; the live Centrum reference is Polish-only, so EN copy has to be authored, not lifted. Full detail: [`i18n.md`](./i18n.md) |
| 2026-07-25 | Content page width capped at 1440px via a shared `Container` component, full-bleed sections keep their background but not their text measure | The scraped reference has no upper width bound at all (its widest CSS breakpoint is `max-width:99999999px`), so every page there stretches edge-to-edge on large monitors — this fixes that for every page that uses `Container` |
| 2026-07-25 | Dropped the scaffold's `prefers-color-scheme: dark` auto dark-mode | The brand is a defined navy-on-white system (PRD has no dark-mode requirement); auto-inverting to near-black backgrounds fought the brand palette instead of adapting it |
| 2026-07-25 | Payload CMS 3 embedded in Next.js (not a separate backend) | Native App Router integration; one deploy unit for the Hetzner VPS |
| 2026-07-25 | Separate root layouts per route tree, no root `src/app/layout.tsx` | Payload's `RootLayout` owns `<html>`/`<body>` for `/admin`; the public site keeps its own |
| 2026-07-26 | Admin only on `DASHBOARD_HOST` (`dash.localhost`); public `/admin` → 404 | Obscure entry point; a redirect would leak the dashboard hostname |
| 2026-07-26 | Four roles: administrator, moderator, redaktor, klient | Staff vs client; `klient` is blocked from the admin panel |
| 2026-07-26 | Pages with nested-docs + expandable tree; Posts blog; Site Settings global | Content model for the marketing site |
| 2026-07-26 | Upload compression: images→WebP, video→WebM | Smaller assets by default via sharp + ffmpeg |
| 2026-07-26 | Custom nested `AdminNav` (not Payload `admin.group`) | Multi-level WP-style tree; Nested Docs covers document hierarchy only |
| 2026-07-26 | Short admin paths `/admin/c/*` and `/admin/g/*` via proxy rewrite | Payload hardcodes `/collections` and `/globals`; vanity URLs without forking it |
| 2026-07-26 | **pnpm** as the package manager; `package-lock.json` removed | Was flagged as an open question in [`stack.md`](./stack.md); decided by the user when the CMS stack landed, since that branch was already pnpm-only |
| 2026-07-26 | `images.localPatterns` lists `/images/**` alongside `/api/media/file/**` | Setting the key at all turns `next/image` into an allowlist — with only Payload's path listed, every photo on the public site would fail |
| 2026-07-26 | One `proxy.ts` composing host gating **and** next-intl | Next allows a single proxy; the CMS branch's version replaced the i18n middleware instead of delegating to it, which would have killed locale routing |

## Gotchas

- **Next.js 16 renamed `middleware.ts` to `proxy.ts`** ("Middleware is now called Proxy... functionality remains the same" — `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`). Same location (`src/` root), same `config.matcher` shape, export `proxy` (named) or default instead of `middleware`. A file named `middleware.ts` still half-works but prints a deprecation warning at build time — if you see that warning, this is why.

## Integrations / external dependencies

- **Centrum design reference:** `https://bodywork.testowe.eu` — mirrored by `scripts/scrape/scrape_site.py`; itself a page-builder export, not final design (PRD §6.2) — treat as structural/visual reference only.
- **Akademia design:** not yet delivered — see [`sites.md`](./sites.md) and PRD §6.3/§15 (top schedule risk).
- **Payload CMS:** in-process; admin **only** at `NEXT_PUBLIC_DASHBOARD_URL` (dev: `http://dash.localhost:3000`); env: `DATABASE_URL`, `PAYLOAD_SECRET`, `NEXT_PUBLIC_SERVER_URL`, `NEXT_PUBLIC_DASHBOARD_URL`, `DASHBOARD_HOST`.
- **PostgreSQL 16:** local via Docker Compose; production intended on the same Hetzner VPS as the Node app.
- **Host proxy:** [`src/proxy.ts`](../src/proxy.ts) — dashboard host rewrites `/` → `/admin`; non-dashboard hosts return 404 for `/admin`; everything else is handed to next-intl.
- **next-intl:** public site strings in `messages/*.json`; config in `src/i18n/`.
- Payments, email, calendar, e-commerce, and infra integrations: see [`stack.md`](./stack.md) and PRD §7/§9/§11 — none wired up yet.
