# BodyWork — ecosystem (hub + centrum + akademia + dashboard)

One Next.js 16 + Payload CMS app serving four domains (`body-work.pl` hub, `centrum.`/`akademia.` B2C/B2B sites, `dash.` admin) from one repo and one database, replacing an aging WordPress site. Stack: Next.js 16 (App Router) + TypeScript + Tailwind CSS 4 + Payload CMS 3, on Node 20 — plus a Python scraper toolkit that mirrors the old Centrum design as a content/design reference. Full requirements: `PRD.md`. Full stack list: `docs/stack.md`.

> Read this file **and** `AI_NOTES.md` at the start of every session. This file is an index — details live in `docs/`. Keep it short: add pointers here, not paragraphs.

> **Next.js 16 note:** newer than most training data. Check `node_modules/next/dist/docs/` or the installed version's own docs before assuming behavior.

---

## Think before you touch (`<plan>`)

Before any non-trivial code change or a complex problem, write your reasoning step by step inside `<plan> … </plan>` tags — edge cases, likely bugs, alternatives. Only **below** the plan produce the final solution. Skip only for truly trivial one-liners.

---

## Docs index — where to look

Don't grep for context that's already written down. Find the topic below, read that file.

| Need to know about... | Read |
|---|---|
| The full product spec, user stories, phases, API, data model | `PRD.md` |
| What was done recently — session-to-session memory | `AI_NOTES.md` |
| System overview, module map, dated decisions log | `docs/architecture.md` |
| The four domains, host-based routing, shared vs. site-specific components | `docs/sites.md` |
| Approved libraries/infra + **the "ask before installing" rule** | `docs/stack.md` |
| Bilingual (PL/EN) strategy — next-intl vs. Payload localization | `docs/i18n.md` |
| Naming, folders, git convention, code style, healthy-growth rules | `docs/conventions.md` |
| What's in the scraped Centrum mirror and which URL maps to which folder | `docs/scraped-site-map.md` |
| Page-by-page migration status (built? bilingual? visually verified?) | `docs/migration-tracker.md` |

Domain-specific critical decisions and gotchas live inside the relevant `docs/<topic>.md` file (its own "Decisions"/"Gotchas" section) — not dumped into this file or into one giant notes file. See `docs/conventions.md` for the pattern.

Working with a coding agent other than Claude Code? Read `AGENTS.md` — same rules, tool-agnostic.

---

## Non-negotiables

- **Centrum: reproduce the scraped reference 1:1 visually.** Colors, imagery, typography treatment, and section content must match `scripts/scrape/scraped/` — use the real assets from each page's `media/` folder (copied into `public/`; photos go through `next/image`, video is served as a plain optimized static file — Next.js has no built-in video pipeline), not gradient/text placeholders. Layout mechanics (max-width/container behavior, grid implementation, breakpoints) are fair game to adapt — see the width-cap fix in `docs/architecture.md` — but the look should not be a reinterpretation. See `docs/scraped-site-map.md`.
- **Ask before touching the stack.** Installing, removing, upgrading, or swapping any library/service requires telling the user first — see `docs/stack.md` for what's already approved and why.
- **No AI/tool authorship anywhere** — not in commits, PRs, code, comments, or docs.
- **Git:** feature branches (`feat/`, `fix/`, `refactor/`, `chore/`), never non-trivial commits straight to `main`. Full convention: `docs/conventions.md`.
- **Keep the docs current.** Definition of done = code works + the relevant `docs/*.md` updated + (larger tasks) an `AI_NOTES.md` entry + commit. A feature isn't finished until the map reflects it.

---

## Project map — WHERE THINGS LIVE 🔴 living index, update it with every feature

Check here before building anything — don't duplicate what exists.

| Feature / domain | Where (path) | Note |
|---|---|---|
| Next.js app (pages, layouts, components) | `src/app/[locale]/` | App Router + next-intl; Centrum homepage is built, see `docs/migration-tracker.md` |
| Bilingual routing (next-intl) | `src/i18n/`, `src/proxy.ts` | `src/proxy.ts` is Next.js 16's renamed `middleware.ts` — see gotcha in `docs/architecture.md` |
| UI translation strings | `messages/pl.json`, `messages/en.json` | See `docs/i18n.md` for the next-intl-vs-Payload-localization split |
| Shared UI primitives | `src/components/ui/` | `Container` (max-width fix), `Button`, `SectionHeading` |
| Centrum components | `src/components/centrum/` | Header, Footer, Hero, and the other homepage section blocks — reuse before adding new ones, see `docs/conventions.md` |
| Static assets served by Next.js | `public/` | favicons, robots.txt, etc. |
| Site scraper / mirror toolkit | `scripts/scrape/` | Mirrors `bodywork.testowe.eu` (Centrum design reference); see `docs/scraped-site-map.md` |
| Reference mirror output (gitignored) | `scripts/scrape/scraped/` | Regenerate with `scripts/scrape/run_scrape.bat`; preview with `scripts/scrape/serve_mirror.bat` (http://localhost:8765) |
| Sitemap used by the scraper | `scripts/scrape/sitemap.xml` | Source list of URLs to mirror |
| Hub / Centrum / Akademia / Dashboard route groups | not yet created | Will land under `src/app/[locale]/(hub)/`, `(centrum)/`, `(akademia)/`, `(payload)/` per `docs/sites.md` — add a row here for each as it's built |
| Payload CMS + collections | not yet installed | See `docs/stack.md` before installing anything |

**Rule:** a new domain = a new module/folder + a row in this table. When a row gets too broad, split it into its own `docs/<topic>.md` and link it from the docs index above.
