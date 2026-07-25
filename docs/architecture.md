# Architecture — BodyWork Centrum

> Overview for humans and for the coding agent. Written in English. Keep it short and concrete; update it when the structure changes.

## Overview

Next.js rewrite of the BodyWork Centrum website (physiotherapy, dietetics, massage, personal & group training), built using a scraped mirror of the live site (`bodywork.testowe.eu`) as a content/design reference.

How it works in one paragraph: the Python toolkit in `scripts/scrape/` mirrors the live site's pages, assets, and media into `scripts/scrape/scraped/` (gitignored, regenerable) so the real content and layout are visible locally without depending on the old site staying up. The Next.js app is the product: public pages live under `src/app/(frontend)/`, while Payload CMS runs in-process under `src/app/(payload)/` (admin at `/admin`, API at `/api`) against self-hosted PostgreSQL. Content will be edited in Payload and read in Server Components via `getPayload()` — no separate CMS server.

## Main modules

| Module | Responsibility | Path |
|---|---|---|
| Public frontend | Site pages, layouts, marketing UI | `src/app/(frontend)/` |
| Payload CMS | Admin UI, REST/GraphQL, auth, uploads | `src/app/(payload)/`, `src/payload.config.ts`, `src/collections/` |
| PostgreSQL | CMS data store (local Docker; same on Hetzner VPS) | `docker-compose.yml` (dev) |
| Scraper toolkit | Mirrors the live site for reference | `scripts/scrape/` |

## Data flow

Reference mirror (`scripts/scrape/scraped/`) → manually read for content/copy/structure → reimplemented as Next.js pages in `src/app/(frontend)/`. Editable content will flow: Postgres ← Payload admin / API ←→ frontend via `getPayload()` in RSC. The scrape mirror is not imported at runtime.

## Key decisions (lightweight ADR)

Record deliberate choices so nobody asks "why is it like this?" a month later.

| Date | Decision | Why |
|---|---|---|
| 2026-07-24 | Stack choice: Next.js 16 (App Router) + TypeScript + Tailwind CSS 4 | Modern React framework, good fit for a marketing/content site with room for future dynamic features (booking, CMS) |
| 2026-07-24 | Kept the existing Python scraper toolkit as `scripts/scrape/`, output gitignored | Preserves the working mirror tool as a content reference without bloating the repo (mirror is ~300MB) |
| 2026-07-25 | Payload CMS 3 embedded in Next.js (not a separate backend) | Native App Router integration; one deploy unit for the Hetzner VPS |
| 2026-07-25 | Self-hosted PostgreSQL (not Neon/Supabase) | Whole stack on one VPS; localhost latency; `pg_dump` backups; same adapter if `DATABASE_URL` ever changes |
| 2026-07-25 | Separate root layouts via `(frontend)` / `(payload)` route groups | Payload `RootLayout` owns `<html>`/`<body>` for `/admin`; public site keeps its own layout |
| 2026-07-26 | Admin only on `DASHBOARD_HOST` (`dash.localhost`); public `/admin` → 404 | Obscure entry point; no redirect (would leak dash hostname) |
| 2026-07-26 | Four roles: administrator, moderator, redaktor, klient | WP-like staff vs client; `klient` blocked from admin panel |

## Integrations / external dependencies

- **Live site reference:** `https://bodywork.testowe.eu` — source mirrored by `scripts/scrape/scrape_site.py`, listed via `scripts/scrape/sitemap.xml`.
- **Payload CMS:** in-process; admin **only** at `NEXT_PUBLIC_DASHBOARD_URL` (dev: `http://dash.localhost:3000`); env: `DATABASE_URL`, `PAYLOAD_SECRET`, `NEXT_PUBLIC_SERVER_URL`, `NEXT_PUBLIC_DASHBOARD_URL`, `DASHBOARD_HOST`.
- **PostgreSQL 16:** local via Docker Compose; production intended on the same Hetzner VPS as the Node app.
- **Host proxy:** [`src/proxy.ts`](../src/proxy.ts) — dashboard host rewrites `/` → `/admin`; non-dashboard hosts return 404 for `/admin`.
