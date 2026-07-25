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

## 2026-07-25 — Centrum homepage: component library + width fix + bilingual

- **Done:** read the real homepage HTML/CSS in `scripts/scrape/scraped/` directly (nav, footer, hero, News carousel, philosophy statements, service tiles, team teaser, testimonials, newsletter, partners) since the Chrome extension wasn't connected this session — extracted real PL copy and translated it to EN. Built a reusable component set: `src/components/ui/` (`Container`, `Button`, `SectionHeading`) and `src/components/centrum/` (`Header`, `MobileNav`, `Footer`, `Hero`, `NewsCarousel`, `TextMedia`, `StatementSection`, `ServiceGrid`, `TestimonialCarousel`, `NewsletterSignup`, `PartnerLogos`). Installed and wired up `next-intl` (locale routing, `src/i18n/`, `messages/{pl,en}.json`) and `embla-carousel-react`/`-autoplay` for the two carousels — both already approved in `docs/stack.md`. Assembled the full homepage at `src/app/[locale]/page.tsx`, bilingual (`/` = PL, `/en` = EN). `npm run build` and `npm run dev` both verified clean; confirmed via `curl` that PL/EN content, nav labels, footer address, and the `max-w-[1440px]` container class all render correctly, and that not-yet-built nav routes 404 cleanly instead of crashing.
- **Decisions:** confirmed root cause of the "stretched on large monitors" complaint — the scraped reference's widest CSS breakpoint is literally `max-width:99999999px` (unbounded); fixed by capping all `Container`-wrapped content at 1440px, full-bleed backgrounds still allowed. Discovered Next.js 16 renamed `middleware.ts` → `proxy.ts` (functionality unchanged) — see gotcha in `docs/architecture.md`. Dropped the scaffold's auto dark-mode since the brand has no dark-mode spec and it fought the navy palette. All content/media that isn't real yet (hero video, team photo, gallery, partner logos) uses styled placeholder blocks, not scraped image files — the scraped mirror stays reference-only per `docs/scraped-site-map.md`.
- **Watch out:** **visual QA was only structural** (build success, curl'd HTML content, class-name checks) — nobody has looked at this in an actual browser yet, and the whole point of this task was a visual stretching bug, so a real browser check (ideally at a large/ultrawide viewport) is the immediate next step before trusting the fix. Several header nav links point at routes that don't exist yet (`/trening-personalny`, `/fizjoterapia`, etc.) — expected 404s, tracked in `docs/migration-tracker.md`, not bugs. Partner logos are 6 unlabeled placeholder boxes — real ones needed. This work landed on branch `chore/docs-restructure` (same branch as the earlier docs session, still uncommitted) since it was already the active branch — consider splitting into separate commits (docs restructure vs. this component/homepage work) whenever this gets committed.

## 2026-07-25 — agent docs overhaul (PRD, stack, bilingual, scraped-site map)

- **Done:** read the new `PRD.md` (full ecosystem spec: hub + centrum + akademia + dashboard, Payload CMS, self-hosted Postgres). Restructured `CLAUDE.md` into a lean index/router; added `AGENTS.md` (tool-agnostic mirror of the same rules); rewrote `docs/architecture.md` to reflect the real 4-domain system; expanded `docs/conventions.md` (git convention, healthy-growth rules, context-handoff prompt, and a scraped-content component-reuse rule all moved in from CLAUDE.md). Added `docs/stack.md` (approved library list + "ask before installing" rule), `docs/sites.md` (domain/routing model), `docs/i18n.md` (next-intl vs. Payload localization split), `docs/scraped-site-map.md` (verified folder ↔ URL map of `scripts/scrape/scraped/`, built from actually inspecting the filesystem, not assumed), and `docs/migration-tracker.md` (page-by-page build/bilingual/visual-QA checklist, seeded from the scraped mirror's ~22 unique templates).
- **Decisions:** confirmed with the user — database is self-hosted PostgreSQL on the Hetzner VPS, **not NeonDB** (a stray stack note conflicted with PRD's "zero abonamentów SaaS" rule); **no Prisma** (Payload's Local API already owns the schema — a second ORM on the same Postgres instance was rejected as redundant/risky). Both logged in `docs/architecture.md`'s decisions table.
- **Watch out:** the scraped Centrum mirror (`scripts/scrape/scraped/`) is Polish-only — there's no English reference to copy from, EN copy has to be authored per page (see `docs/i18n.md`). Akademia has zero design/content yet (PRD's top schedule risk) — its rows in `docs/sites.md` and `docs/migration-tracker.md` stay empty until that's delivered. No app code changed this session — docs/workflow scaffolding only, done on branch `chore/docs-restructure`, not committed yet.

## 2026-07-24 — project scaffold

- **Done:** repository initialized; Next.js 16 (App Router, TypeScript, Tailwind CSS 4) scaffolded at repo root; existing Python scraper/mirror toolkit relocated to `scripts/scrape/` (paths and `.bat` scripts updated to still work from their new location); `CLAUDE.md`, `docs/`, and `AI_NOTES.md` in place.
- **Decisions:** stack — Next.js 16 + TypeScript + Tailwind CSS 4, with the Python scraper kept as a supporting reference tool, not the product itself; repo language — English; UI language — Polish. The scraped mirror (`scripts/scrape/scraped/`, ~300MB) is gitignored and regenerable via `scripts/scrape/run_scrape.bat` — it's a content/design reference, not something the Next.js app depends on at runtime.
- **Watch out:** Next.js 16 is newer than most model training data — API/conventions may differ from what's expected; check `node_modules/next/dist/docs/` before assuming behavior. No actual site pages/content have been built yet — homepage is still the default `create-next-app` starter.
