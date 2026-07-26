# AI Notes — BodyWork Centrum

> Running journal for whoever works on this project (human or agent).
> **Read this file at the start of every session** — it's the memory that survives between sessions and context resets.
> At the end of every larger task, add a dated entry at the top (newest first): what was done, key architectural decisions, and what to watch out for next time. Keep entries short.

<!-- Copy this block for each new entry, newest on top:

## {{DATE}} — <short task title>
- **Done:** what now works.
- **Decisions:** architectural choices made and why (one line each).
- **Watch out:** gotchas, debts, or things that will bite next time.

-->

## 2026-07-26 — media library explorer + a11y/SEO fields

- **Done:** Media collection expanded (ALT/title/slug/caption/description/tags/decorative, conversion options, `kind` folders); compression accepts format/max-edge/quality; custom list view `MediaLibrary` (grid/list, folders by type, sort/search, details preview). Docs in `docs/media.md`.
- **Decisions:** No image-recognition ALT (filename suggestion only — no API key/cost); replace Payload list via `views.list.Component`; default max edge 1920 + WebP/WebM; Payload `imageSizes` thumb/card/large.
- **Watch out:** Conversion options apply only on upload/replace. Schema change needs DB push/migrate. Regenerate importmap + types after component/field edits.

## 2026-07-26 — Polish date/time display
- **Done:** Shared `src/lib/format-date.ts` (`formatDatePl`, `formatDateTimePl`, Payload date-fns constants, next-intl `intlFormats`). Payload admin `dateFormat` + `Europe/Warsaw` timezone; Posts `publishedAt` picker uses 24h PL format. next-intl request config wires `formats`.
- **Decisions:** `Intl` + `pl-PL` for frontend helpers; date-fns pattern strings for Payload admin (`dd.MM.yyyy, HH:mm`); no new npm deps.
- **Watch out:** Payload `dateFormat` is global (not per admin locale) — fine while PL is primary. List columns (`updatedAt`, etc.) follow `admin.dateFormat`; some Payload internals may still use English defaults.

## 2026-07-26 — custom CMS admin nav layout

- **Done:** Nested admin sidebar (Kokpit / Treści / E-commerce / Zarządzanie) via custom `AdminNav` with SVG icons; real links for Pages/Posts/Media/Users/Site Settings; other leaves → `ComingSoonView` at `/admin/coming-soon`. Short vanity URLs `/admin/c/*` and `/admin/g/*` rewritten in `proxy.ts` to Payload’s `/collections/` and `/globals/`.
- **Decisions:** Replace Payload DefaultNav entirely (groups are only 1 level); Nested Docs stays for page document hierarchy only; stubs are custom views, not empty collections; cannot remove `/collections` inside Payload itself without a fork.
- **Watch out:** After nav/component changes run `pnpm generate:importmap`. Expand/collapse state is in `localStorage` (`bw-admin-nav-open`). Payload’s own in-app links may still show `/collections/` or `/globals/`. Wire role filtering later.

## 2026-07-26 — content model, next-intl, media compression

- **Done:** Site Settings global (identity/contact/SEO); Pages with nested-docs + expandable tree UI + SEO meta; Posts (blog) with drafts; next-intl wired (`messages/pl|en`, frontend layout); media uploads compressed to WebP / WebM; removed WordPress comparison copy from admin.
- **Decisions:** Payload drafts instead of custom status field; nested-docs for page hierarchy; sharp for images, ffmpeg (bundled installer) for video→WebM; next-intl for public UI strings (admin labels stay Polish in collection configs).
- **Watch out:** Video conversion is CPU-heavy and may fail on exotic codecs — original file is kept on error. Expand `[locale]` routing later if EN public site is needed beyond messages.

## 2026-07-26 — dashboard host, roles, Polish admin chrome

- **Done:** `src/proxy.ts` serves admin only on `dash.localhost` (rewrites `/` → `/admin`); public hosts get plain **404** for `/admin` (no redirect). User roles administrator/moderator/redaktor/klient with access helpers; Polish i18n + collection labels; `WelcomeDashboard` before dashboard.
- **Decisions:** obscure admin entry by host, never redirect (leaks hostname); `klient` blocked from admin; redaktor cannot delete media or manage users; Payload `serverURL` points at dashboard URL.
- **Watch out:** open panel at `http://dash.localhost:3000` (not `localhost/admin`). Existing DB users need a `role` column (dev push) — set first admin to `administrator` if create-first-user already ran.

## 2026-07-25 — Payload CMS + Postgres

- **Done:** Payload 3.86 embedded in the Next.js app; admin at `/admin` (create-first-user works); REST/GraphQL under `/api`; collections `Users` + `Media`; local Postgres via `docker-compose.yml`; frontend moved to `src/app/(frontend)/`.
- **Decisions:** self-hosted Postgres (not Neon/Supabase) for a single Hetzner VPS; `(frontend)` / `(payload)` split root layouts; pnpm with `allowBuilds` for sharp/esbuild/`@parcel/watcher`; package `"type": "module"` required for Payload CLI.
- **Watch out:** Payload blank template on GitHub `main` may be ahead of npm (e.g. `generatePayloadViewport` does not exist in 3.86 — match files to the installed version tag). No root `app/layout.tsx` wrapping both groups. Dev: `docker compose up -d` then `pnpm dev`. Email adapter not configured (logs to console). Domain collections (services, team, pages) not created yet.

## 2026-07-24 — project scaffold

- **Done:** repository initialized; Next.js 16 (App Router, TypeScript, Tailwind CSS 4) scaffolded at repo root; existing Python scraper/mirror toolkit relocated to `scripts/scrape/` (paths and `.bat` scripts updated to still work from their new location); `CLAUDE.md`, `docs/`, and `AI_NOTES.md` in place.
- **Decisions:** stack — Next.js 16 + TypeScript + Tailwind CSS 4, with the Python scraper kept as a supporting reference tool, not the product itself; repo language — English; UI language — Polish. The scraped mirror (`scripts/scrape/scraped/`, ~300MB) is gitignored and regenerable via `scripts/scrape/run_scrape.bat` — it's a content/design reference, not something the Next.js app depends on at runtime.
- **Watch out:** Next.js 16 is newer than most model training data — API/conventions may differ from what's expected; check `node_modules/next/dist/docs/` before assuming behavior. No actual site pages/content have been built yet — homepage is still the default `create-next-app` starter.
