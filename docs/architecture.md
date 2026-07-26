# Architecture — BODYWORK ecosystem

> Overview for humans and coding agents. Written in English. This is a map, not the spec — full detail lives in `PRD.md`; keep this in sync when the real system diverges from it.

## What this is

One Next.js 16 app + embedded Payload CMS 3, serving four domains from one repo and one database, split by request host:

| Domain | Site | Role |
|---|---|---|
| `body-work.pl` | Hub | Landing, routes to Centrum / Akademia / Alfabet Ruchu (external) |
| `centrum.body-work.pl` | Centrum | B2C fitness club |
| `akademia.body-work.pl` | Akademia | B2B training academy + e-commerce shop |
| `dash.body-work.pl` | Dashboard | Shared Payload admin |

Full domain/routing model: [`sites.md`](./sites.md). Full rationale for "one app, four domains": PRD §7.2.

This repo currently has a bilingual Centrum homepage built against the scraper mirror reference (`scripts/scrape/scraped/`, see [`scraped-site-map.md`](./scraped-site-map.md)) and a shared component library. Hub, Akademia, and the Payload backend are not started.

## Main modules

| Module | Responsibility | Path |
|---|---|---|
| Next.js app | Locale-aware pages/layouts | `src/app/[locale]/` |
| i18n config | next-intl routing, request config, locale-aware navigation | `src/i18n/` |
| UI translations | PL/EN message catalogs | `messages/` |
| Host/locale routing | `src/proxy.ts` (Next.js 16 renamed `middleware.ts` → `proxy.ts` — see Gotchas) | `src/proxy.ts` |
| UI primitives | Container (the max-width fix), Button, SectionHeading | `src/components/ui/` |
| Centrum components | Header, Footer, Hero, and the other homepage section blocks | `src/components/centrum/` |
| Scraper toolkit | Mirrors the Centrum design reference | `scripts/scrape/` |
| Payload CMS (not yet installed) | Content, e-commerce, admin, auth | see [`stack.md`](./stack.md) |
| _(fill in as the project grows — one row per new domain/module, per CLAUDE.md's project map rule)_ | | |

## Data flow

- **Centrum reference:** `scripts/scrape/scraped/` → read manually for content/structure → reimplemented as native React/Tailwind in `src/app/`. Never imported or served at runtime.
- **Akademia:** no reference yet (design pending) — build the data model and backend first, against a neutral layout (PRD §15 risk mitigation).
- **Once Payload is installed:** Server Components read content via Payload's Local API (in-process, no HTTP round-trip) rather than a REST/GraphQL endpoint — PRD §7.4.

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

## Gotchas

- **Next.js 16 renamed `middleware.ts` to `proxy.ts`** ("Middleware is now called Proxy... functionality remains the same" — `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`). Same location (`src/` root), same `config.matcher` shape, export `proxy` (named) or default instead of `middleware`. A file named `middleware.ts` still half-works but prints a deprecation warning at build time — if you see that warning, this is why.

## Integrations / external dependencies

- **Centrum design reference:** `https://bodywork.testowe.eu` — mirrored by `scripts/scrape/scrape_site.py`; itself a page-builder export, not final design (PRD §6.2) — treat as structural/visual reference only.
- **Akademia design:** not yet delivered — see [`sites.md`](./sites.md) and PRD §6.3/§15 (top schedule risk).
- Payments, email, calendar, e-commerce, and infra integrations: see [`stack.md`](./stack.md) and PRD §7/§9/§11 — none wired up yet.
