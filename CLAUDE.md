# BodyWork Centrum

Next.js rewrite of the BodyWork Centrum website (physiotherapy, dietetics, massage, personal & group training), built using a scraped mirror of the live site as a content/design reference.

**Stack:** Next.js 16 (App Router) + TypeScript + Tailwind CSS 4 + Payload CMS 3 (Postgres), on Node 20+ — plus a Python 3.13 scraper toolkit (`requests` + `BeautifulSoup`) used to mirror the current live site as a reference. Admin panel is reachable only on the dashboard host (`dash.localhost` in dev).

> This file is the project's constitution. Read it **at the start of every session** — together with `AI_NOTES.md` (the running journal). It defines how we work and where things live. Keep it short: it is an index; details go in `docs/`.

> **Next.js 16 note:** this is newer than most training data. APIs, conventions, and file structure may differ from what you expect — check `node_modules/next/dist/docs/` or the installed version's own docs before assuming Next.js behavior, and heed deprecation notices.

---

## Language convention (kills "Ponglish")

Three separate axes — do not mix them:

- **Repository language: English.** All code identifiers, comments, commit messages, documentation, and this file are written in **English** — **regardless of the language used in chat.** If someone chats in another language, the repository still stays in English. No mixing.
- **User-facing content: Polish.** Text visible to end users (UI copy, labels, seed/demo data shown in the product) is written in **Polish**.
- **Chat language:** whatever the person writes in. It has no effect on the two axes above.

When in doubt, the repository language wins for anything that lives in the repo.

---

## Think before you touch (`<plan>`)

Before any non-trivial code change or a complex problem, you must write your reasoning step by step inside `<plan> … </plan>` tags — analyze edge cases, likely bugs, and alternatives there. Only **below** the plan produce the final solution. This forces real thinking (extra tokens spent on reasoning), which sharply cuts hallucinations and careless mistakes. Skip only for truly trivial one-liners.

---

## How we work (loop)

For every change:
1. **Understand** — check the "Project map" below and the relevant module / `docs/`. Read the code before you change it; don't guess.
2. **Plan a small step** — one logical change at a time; for anything non-trivial, write the `<plan>` block first (see above).
3. **Build** — small files, single responsibility.
4. **Verify** — run / test that it works.
5. **Update the map/docs** — if a feature or module was added (see below).
6. **Commit** — short title, following the convention.

**Definition of done:** the code works **and** the map/docs are updated **and** it's committed. For larger tasks, also add an entry to `AI_NOTES.md` (see below). Without this, the task isn't finished.

---

## Git — non-negotiable, from minute one

- **Repo from the start.** `main` is always in a working state.
- **Branches:** work on `feat/<short>`, `fix/<short>`, `refactor/<short>`, `chore/<short>`. Don't commit non-trivial changes straight to `main`.
- **Commit = one logical change.** Commit often, in small steps.
- **Commit title:** `type: short, on-point summary` (≤ ~60 chars), written in English. Types: `feat`, `fix`, `refactor`, `docs`, `style`, `test`, `chore`, `perf`.
  - `feat: contact page layout`
  - `fix: mobile nav overlap`
  - `refactor: extract pricing card component`
- **No long body.** The title should be enough. Add a short body (2–4 bullets) **only** when the change is large / functionally important / non-obvious.
- **No AI/tool authorship, anywhere.** Never in commits, PRs, code, comments, or docs: no "Co-Authored-By", "Generated with", "AI", or tool names. This is also enforced by `.claude/settings.json` (`includeCoAuthoredBy: false`) — don't change it.

---

## Project map — WHERE THINGS LIVE 🔴 living index, update it with every feature

This is the antidote to the "colossus on clay feet". After adding **any** feature, add a row. Before building anything, check here whether it already exists.

| Feature / domain | Where (path) | Note |
|---|---|---|
| Public site (frontend) | `src/app/(frontend)/` | App Router route group with its own root layout; homepage is `page.tsx` |
| Payload CMS admin + API | `src/app/(payload)/` | Admin UI only on dashboard host; REST/GraphQL under `/api` |
| Host proxy (dash vs public) | `src/proxy.ts` | `dash.localhost` → admin; public hosts return **404** for `/admin` (no redirect leak); rewrites `/admin/c/*`→`/collections/*`, `/admin/g/*`→`/globals/*` |
| Access control / roles | `src/access/roles.ts` | Roles: administrator, moderator, redaktor, klient |
| Payload config | `src/payload.config.ts` | CMS entry: DB adapter, editor, collections, i18n PL |
| Payload collections | `src/collections/` | `Users`, `Media`, `Pages` (nested tree), `Posts` (blog) |
| Media library (admin) | `src/collections/Media.ts`, `src/components/admin/media/`, `docs/media.md` | Explorer (grid/list/folders), a11y/SEO fields, conversion options |
| Site settings (global) | `src/globals/SiteSettings.ts` | Brand identity, contact, default SEO |
| Appearance — colour scheme (admin + site) | `src/globals/ThemeColors.ts`, `src/lib/theme-tokens.ts`, `src/lib/theme-css.ts`, `docs/appearance.md` | Global palette → `--bw-*` CSS vars on the public site; presets + live preview in admin |
| Appearance — components (admin) | `src/collections/SiteComponents.ts`, `src/fields/component-settings/`, `src/components/admin/appearance/`, `docs/appearance.md` | Elementor-style blocks (button, hero, carousel, gallery, CTA, feature cards) with live preview |
| Shared CMS fields | `src/fields/` | SEO meta, slug helpers |
| Admin UI extras | `src/components/admin/` | WelcomeDashboard, PagesTree, AdminNav, ComingSoonView, media/* |
| Admin nav tree | `src/admin/nav-tree.ts` | Nested sidebar structure (custom Nav; stubs → `/admin/coming-soon`) |
| Frontend i18n | `messages/`, `src/i18n/` | next-intl (default `pl`) |
| Date/time display (PL) | `src/lib/format-date.ts` | `formatDatePl`, `formatDateTimePl`; Payload `admin.dateFormat`; next-intl `formats` |
| Media compression | `src/lib/compress-media.ts`, `src/lib/media-filename.ts` | Format/size/quality options; ALT/slug from filename |
| Generated Payload types | `src/payload-types.ts` | Regenerate with `pnpm generate:types` |
| Local Postgres (dev) | `docker-compose.yml` | `docker compose up -d` → `localhost:5432` / DB `bodywork` |
| Static assets served by Next.js | `public/` | favicons, robots.txt, etc. |
| Site scraper / mirror toolkit | `scripts/scrape/` | `scrape_site.py` mirrors `bodywork.testowe.eu` into `scripts/scrape/scraped/` for content & design reference; `fix_local_paths.py` rewrites absolute URLs to relative |
| Reference mirror output (gitignored) | `scripts/scrape/scraped/` | Regenerate with `scripts/scrape/run_scrape.bat`; preview with `scripts/scrape/serve_mirror.bat` (http://localhost:8765) |
| Sitemap used by the scraper | `scripts/scrape/sitemap.xml` | Source list of URLs to mirror |

**Rule:** a new domain = a new module/folder + a row in this table. When a row gets too broad, split it.

---

## Architecture & documentation

Details live outside this file so it stays lightweight:

- **`docs/architecture.md`** — overview, main modules, data flow, key decisions. Read it before larger changes. Update it when the structure changes.
- **`docs/conventions.md`** — naming, folder structure, patterns, style, tests. Follow what's written there.
- Complex domain? Give it its own file in `docs/` (e.g. `docs/payments.md`) and link it from the map.

**Rule:** docs travel with the code. Change behavior → update the relevant `docs/`. Stale docs are worse than none.

---

## Project journal — `AI_NOTES.md`

`AI_NOTES.md` is the project's running memory, meant to survive between sessions and context resets.

- **Read it at the start of every session.**
- **At the end of every larger task**, add a short dated entry at the top: what was done, the architectural decisions made, and what to watch out for next time.
- Keep it short and honest — it's for the next person or the next session, including future-you.

---

## Context handoff (session reset)

An AI degrades when a chat gets too long (context pollution) or nears the token limit — it starts looping or making sloppy mistakes. When you notice that, don't push through it. Reset: get a clean technical dump, open a fresh chat, paste the dump, and continue on a fast, clean model.

Prompt to paste when you want a handoff:

> Produce a full technical dump of our current state (Context Handoff). List, in bullets: 1) exactly what we've done and that works, 2) where we're stuck / what we're working on now, 3) the next steps, 4) all key decisions and the names of changed files. Format it so I can paste it into a fresh chat and continue without losing context.

Before ending a heavy session, capture the same summary in `AI_NOTES.md` so nothing is lost.

---

## Healthy growth (so it doesn't become a colossus)

- **Small files, single responsibility.** A file that does two things or grows past ~300 lines → split it.
- **Module boundaries early.** One domain = one module. Don't mix layers (UI / logic / data) in one bag.
- **Don't duplicate** — check the map first to see whether the feature already exists.
- **Refactoring is normal work**, not "someday". Notice a mess in passing → clean it up and commit it separately.

---

## How to search the project (for the coding agent)

1. **Start with the map** — it tells you where things live. Faster than a blind grep.
2. Not in the map? → grep by domain/feature name, find it, **add it to the map**.
3. Read the module and its `docs/` before touching it.
4. Keep CLAUDE.md short — as it grows, move detail into `docs/` and leave only a pointer here.
