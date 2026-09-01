> Read when: you are about to change something cross-cutting and want to know whether it was already decided, and why.

# Decisions (lightweight ADR)

Deliberate choices, so nobody re-litigates them a month later without cause.
Domain-specific gotchas do **not** go here: they belong in the `Gotchas` section of the relevant `docs/<topic>.md`.

| Date | Decision | Why |
|---|---|---|
| 2026-09-01 | Payload migrations committed to `src/migrations/`, generated once and replayed onto an empty database | The project could not start anywhere dev mode had not already been. Not optional: the adapter gates its schema push on `NODE_ENV` before reading the `push` option, so no environment variable can stand in for a migration. Put `pnpm build` back in CI. See [`runbooks/create-migrations.md`](./runbooks/create-migrations.md) |
| 2026-09-01 | Demo deployed to a self-hosted TrueNAS box, not the Hetzner/Coolify target in [`stack.md`](./stack.md) | A client demo on hardware we already own, with no bearing on where production lands. Nothing about the image is TrueNAS specific: it is a plain container behind a reverse proxy |
| 2026-09-01 | The image builds its own throwaway Postgres inside the Dockerfile | `next build` queries Payload while collecting page data, so the build needs a schema. Doing it in the build stage keeps `docker build .` working on any machine, with no service container to wire up |
| 2026-09-01 | CMS pages carry a 60 second revalidate window again | On-demand revalidation (page builder Phase 1B) is unbuilt, and dropping the timer with it left saved pages cached for the life of the process. Bridge, to be deleted when Phase 1B lands |
| 2026-09-01 | Line endings pinned to LF by `.gitattributes` | A Windows checkout against an LF index showed all 376 files as modified, which hides real changes and makes any diff unreadable |
| 2026-07-24 | Stack choice: Next.js 16 (App Router) + TypeScript + Tailwind CSS 4 | Modern React framework, good fit for a marketing/content site with room for future dynamic features (booking, CMS) |
| 2026-07-24 | Kept the existing Python scraper toolkit as `scripts/scrape/`, output gitignored | Preserves the working mirror tool as a content reference without bloating the repo (mirror is ~300MB) |
| 2026-07-25 | One Next.js app serving 4 domains (hub/centrum/akademia/dash) via host-based middleware, not 4 separate projects | Payload's Local API needs to live in-process; ~70% component sharing between Centrum/Akademia; one deploy to maintain. Full detail: PRD §7.2, [`sites.md`](./sites.md) |
| 2026-07-25 | Database: self-hosted PostgreSQL on the Hetzner VPS (Docker), **not** NeonDB | A stray stack note floated NeonDB, which conflicts with PRD's "zero abonamentów SaaS" cardinal rule and cost model (§9). Confirmed with the user: self-hosted stands. |
| 2026-07-25 | No Prisma / no second ORM | Payload already owns the schema, migrations, and query layer; a second ORM on the same Postgres instance is redundant and a migration-conflict risk. Confirmed with the user. |
| 2026-07-25 | Bilingual (PL/EN) from day one via next-intl (UI strings) + Payload localization (content fields) | PRD §8.10 requires full PL/EN parity; the live Centrum reference is Polish-only, so EN copy has to be authored, not lifted. Full detail: [`i18n.md`](./i18n.md) |
| 2026-07-25 | Content page width capped at 1440px via a shared `Container` component, full-bleed sections keep their background but not their text measure | The scraped reference has no upper width bound at all (its widest CSS breakpoint is `max-width:99999999px`), so every page there stretches edge-to-edge on large monitors: this fixes that for every page that uses `Container` |
| 2026-07-25 | Dropped the scaffold's `prefers-color-scheme: dark` auto dark-mode | The brand is a defined navy-on-white system (PRD has no dark-mode requirement); auto-inverting to near-black backgrounds fought the brand palette instead of adapting it |
| 2026-07-25 | Payload CMS 3 embedded in Next.js (not a separate backend) | Native App Router integration; one deploy unit for the Hetzner VPS |
| 2026-07-25 | Separate root layouts per route tree, no root `src/app/layout.tsx` | Payload's `RootLayout` owns `<html>`/`<body>` for `/admin`; the public site keeps its own |
| 2026-07-26 | Admin only on `DASHBOARD_HOST` (`dash.localhost`); public `/admin` → 404 | Obscure entry point; a redirect would leak the dashboard hostname |
| 2026-07-26 | Four roles: administrator, moderator, redaktor, klient | Staff vs client; `klient` is blocked from the admin panel |
| 2026-07-29 | Three roles: administrator, edytor, klient | Dropped moderator; redaktor → edytor. Edytor: Treści + E-commerce + Zarządzanie (Tłumaczenia, Wygląd, Ustawienia→Treści). Users only by admin (or future checkout). Username + first/last name; display name = full name or username |
| 2026-07-26 | Pages with nested-docs + expandable tree; Posts blog; Site Settings global | Content model for the marketing site |
| 2026-07-26 | Upload compression: images→WebP, video→WebM | Smaller assets by default via sharp + ffmpeg |
| 2026-07-26 | Custom nested `AdminNav` (not Payload `admin.group`) | Multi-level WP-style tree; Nested Docs covers document hierarchy only |
| 2026-07-26 | Short admin paths `/admin/c/*` and `/admin/g/*` via proxy rewrite | Payload hardcodes `/collections` and `/globals`; vanity URLs without forking it |
| 2026-07-26 | **pnpm** as the package manager; `package-lock.json` removed | Was flagged as an open question in [`stack.md`](./stack.md); decided by the user when the CMS stack landed, since that branch was already pnpm-only |
| 2026-07-26 | `images.localPatterns` lists `/images/**` alongside `/api/media/file/**` | Setting the key at all turns `next/image` into an allowlist, with only Payload's path listed, every photo on the public site would fail |
| 2026-07-26 | One `proxy.ts` composing host gating **and** next-intl | Next allows a single proxy; the CMS branch's version replaced the i18n middleware instead of delegating to it, which would have killed locale routing |
| 2026-07-26 | Media library: ALT/slug derived from the filename (no vision API); optional WebP/AVIF/WebM with a max edge; custom explorer list | Decent a11y defaults without API keys, with editors reviewing the ALT; explorer UX beats the stock table |

