# BodyWork: ecosystem (hub + centrum + akademia + dashboard)

One Next.js 16 + Payload CMS app serving four domains (`body-work.pl` hub, `centrum.`/`akademia.` B2C/B2B sites, `dash.` admin) from one repo and one database, replacing an aging WordPress site. Stack: Next.js 16 (App Router) + TypeScript + Tailwind CSS 4 + Payload CMS 3, on Node 20: plus a Python scraper toolkit that mirrors the old Centrum design as a content/design reference. Full requirements: `PRD.md`. Full stack list: `docs/stack.md`.

> Read this file **and** `AI_NOTES.md` at the start of every session. This file is an index: details live in `docs/`. Keep it short: add pointers here, not paragraphs.

> **The admin panel is reachable only on the dashboard host** (`dash.localhost` in dev). Public hosts return a plain 404 for `/admin`, see `src/proxy.ts`.

> **Next.js 16 note:** newer than most training data. Check `node_modules/next/dist/docs/` or the installed version's own docs before assuming behavior.

---

## Think before you touch (`<plan>`)

Before any non-trivial code change or a complex problem, write your reasoning step by step inside `<plan> … </plan>` tags: edge cases, likely bugs, alternatives. Only **below** the plan produce the final solution. Skip only for truly trivial one-liners.

---

## Docs index: where to look

Don't grep for context that's already written down. Find the topic below, read that file.

| Need to know about... | Read |
|---|---|
| The full product spec, user stories, phases, API, data model | `PRD.md` |
| What was done recently: session-to-session memory | `AI_NOTES.md` |
| System overview, module map, dated decisions log | `docs/architecture.md` |
| The four domains, host-based routing, shared vs. site-specific components | `docs/sites.md` |
| Approved libraries/infra + **the "ask before installing" rule** | `docs/stack.md` |
| Bilingual (PL/EN) strategy: next-intl vs. Payload localization | `docs/i18n.md` |
| Naming, folders, git convention, code style, **admin UI copy tone**, healthy-growth rules | `docs/conventions.md` |
| What's in the scraped Centrum mirror and which URL maps to which folder | `docs/scraped-site-map.md` |
| Page-by-page migration status (built? bilingual? visually verified?) | `docs/migration-tracker.md` |
| The page builder: section model, builder UI, public renderer | `docs/page-builder.md` |
| **Several agents working at once**: worktrees, one DB/port each, who owns which files | `docs/parallel-agents.md`; the two procedures live in `docs/runbooks/` and every tool's skill/command file just points at them |

Domain-specific critical decisions and gotchas live inside the relevant `docs/<topic>.md` file (its own "Decisions"/"Gotchas" section), not dumped into this file or into one giant notes file. See `docs/conventions.md` for the pattern.

Working with a coding agent other than Claude Code? Read `AGENTS.md`: same rules, tool-agnostic.

---

## Non-negotiables

- **Centrum: reproduce the scraped reference 1:1 visually, but the reference is not authoritative where it is broken.** Colors, imagery, typography treatment, and section **content** must match `scripts/scrape/scraped/`: use the real assets from each page's `media/` folder (copied into `public/`; photos go through `next/image`, video is served as a plain optimized static file: Next.js has no built-in video pipeline), not gradient/text placeholders. Layout mechanics (max-width/container behavior, grid implementation, breakpoints) are fair game to adapt, see the width-cap fix in `docs/architecture.md`. See `docs/scraped-site-map.md`.

  **Where the reference is plainly defective, fix it instead of reproducing it** (user's call, 2026-07-27: *"na oryginale też mogą rzeczy się rozjeżdżać bądź być do dupy, więc ogarnij to tak żeby było zajebiście"*). That covers broken links, unreadable type sizes, layouts that leave content colliding or stranded: the things a visitor would read as a bug. It is **not** a licence to redesign: the copy stays verbatim, the palette and imagery stay as they are, and every deviation gets one line in `docs/migration-tracker.md` saying what was changed and why. Two worked examples live in `LegalDocument` (body size, column layout, heading scale) and `external-links.ts` (the dead `/galeria` target). If a change is a matter of taste rather than a defect, keep the reference and ask.
- **Ask before touching the stack.** Installing, removing, upgrading, or swapping any library/service requires telling the user first, see `docs/stack.md` for what's already approved and why.
- **No AI/tool authorship anywhere**, not in commits, PRs, code, comments, or docs.
- **Admin UI copy is short and dry.** Section leads, field `description`s, card hints: one line that names the thing, not a tutorial. Full rule + good/bad examples: `docs/conventions.md` → *Admin UI copy*.
- **Git:** feature branches (`feat/`, `fix/`, `refactor/`, `chore/`), never non-trivial commits straight to `main`. Full convention: `docs/conventions.md`.
- **If another agent may be working at the same time, read `docs/parallel-agents.md` first.** Own worktree, own database, own port; never `docker compose down -v` (it drops every agent's data); never hand-edit the generated `src/payload-types.ts` / `importMap.js`; rebase onto `main` the moment someone else's PR lands.
- **Keep the docs current.** Definition of done = code works + the relevant `docs/*.md` updated + (larger tasks) an `AI_NOTES.md` entry + commit. A feature isn't finished until the map reflects it.

---

## Project map: WHERE THINGS LIVE 🔴 living index, update it with every feature

Check here before building anything: don't duplicate what exists.

| Feature / domain | Where (path) | Note |
|---|---|---|
| Public site (pages, layouts) | `src/app/[locale]/` | App Router + next-intl; all Centrum pages are built, see `docs/migration-tracker.md`. Its own root layout, there is deliberately no `src/app/layout.tsx`, so this and `(payload)` can each own their `<html>` |
| Bilingual routing (next-intl) | `src/i18n/`, `src/proxy.ts` | `src/proxy.ts` is Next.js 16's renamed `middleware.ts`, see gotcha in `docs/architecture.md` |
| Which messages reach the browser | `src/i18n/client-namespaces.ts`, `pnpm check:messages` | **Only 11 of 46 namespaces ship.** `getMessages()` is 188KB; client components need 7.1KB. Add a namespace here when a `"use client"` file starts reading one, or it renders as a key path |
| UI translation strings | `messages/pl.json`, `messages/en.json` | See `docs/i18n.md` for the next-intl-vs-Payload-localization split |
| Shared UI primitives | `src/components/ui/` | `Container` (max-width fix), `Button`, `SectionHeading` |
| English versions of posts | `src/collections/PostTranslations.ts`, `src/lib/post-translation.ts` | A collection rather than `localized: true`, because that migration hangs on an existing table. **No translation means the post 404s in EN**, per `docs/i18n.md` |
| Blog (listing + post) | `src/app/[locale]/blog/` | Reads Payload's Local API; `BlogList` does the category/search filtering client-side, renders the newest post as the reference's featured card, and prints **no dates** |
| Editorial worklist | `scripts/content-health.ts` | Read-only. Lists posts without subheadings, images still needing real alt text, and missing categories. Run it to watch the list shrink |
| Image alt text | `scripts/fix-image-alt-text.ts` | Sets in-article alts to "post title: nearest heading". The reference has **no** alt attributes at all, so there was nothing to import |
| Repairing imported blog data | `scripts/fix-blog-from-reference.ts` | The import took thumbnail/excerpt/date from the article body, all three were wrong. This reads the listing's own metadata instead. `DRY=1` to preview (**not** `--dry`, see `docs/architecture.md`) |
| Media sizing / compression | `src/collections/Media.ts`, `src/lib/compress-media.ts` | Uploads are downscaled to a 2560px long edge and converted to WebP; four `imageSizes` (thumbnail/card/content/hero) are generated |
| Category archives | `src/app/[locale]/blog/kategoria/[slug]/` | Static, one per category, in the sitemap. An addition: the reference filters client-side only |
| Shared post card | `src/components/centrum/PostCard.tsx` | Used by the archives and the "read next" block. The listing keeps its own copy, which carries the grid divider borders |
| Blog teasers on service pages | `src/components/centrum/BlogTeasers.tsx` | Three posts from a matching category at the foot of five service pages |
| Image placeholders (LQIP) | `scripts/import-blur-placeholders.ts`, `blurDataURL` on Media | Harvested from the mirror's own `<picture>` backgrounds. 189/230 covered |
| Image placeholders for static pages | `scripts/generate-blur-placeholders.mjs`, `src/lib/static-blur.ts` | The blog's come from Payload; the marketing pages have no CMS, so theirs are generated into `static-blur.json` (18 entries, 3.4KB). **Server components only:** a client component takes the string as a prop, see `FullBleedVideo` |
| Hero video encodes | `scripts/optimize-hero-video.mjs`, `public/videos/` | 720px and 1280px VP9/h264 pairs plus a poster, no audio. **8388KB down to 734KB on a phone.** `hero-source.mp4` is the gitignored input |
| Structured data (JSON-LD) | `src/lib/structured-data.ts` | `HealthAndBeautyBusiness` sitewide, `BlogPosting` + `BreadcrumbList` per post. Rendered via `dangerouslySetInnerHTML`, which is the documented App Router way |
| RSS feed | `src/app/feed.xml/route.ts` | Polish only, deliberately. Lives outside `[locale]` so no locale prefix is negotiated onto it |
| Page metadata / SEO | `src/lib/metadata.ts`, each route's `generateMetadata` | One helper builds the title, canonical, `hreflang` pair, Open Graph and Twitter tags. Every route has its own title, they were all identical before |
| Sitemap + robots | `src/app/sitemap.ts`, `src/app/robots.ts` | The sitemap discovers static routes by walking `src/app/[locale]` and pulls posts from Payload, so it can't drift when a page is added |
| Newsletter (double opt-in) | `src/app/api/newsletter/` (subscribe / confirm / unsubscribe), `src/collections/Subscribers.ts`, `src/app/[locale]/newsletter/` | **The list lives in our Postgres, Resend only delivers.** Unsubscribe is GET-asks / POST-does on purpose, read the note in `docs/migration-tracker.md` |
| Outgoing email (Resend) | `src/lib/email.ts`, `src/lib/payload-email.ts` | One `fetch`, no SDK, no new dependency. **No `RESEND_API_KEY` → mail is logged, not sent.** The hand-rolled Payload adapter is what makes password resets arrive at all |
| Shared notice shell | `src/components/centrum/NoticeLayout.tsx` | Big statement + body + actions. Backs the 404, the error boundary and the newsletter confirmation (was `ErrorLayout`) |
| Error pages | `src/app/[locale]/not-found.tsx`, `error.tsx`, `src/app/global-error.tsx`, `[locale]/[...rest]/` | The catch-all and the client-component 404 are both load-bearing, read the note in `docs/migration-tracker.md` before touching them |
| Off-site link targets | `src/lib/external-links.ts` | eFitness schedule, socials, and the gallery target: **read the `GALLERY_URL` note**: the reference links four buttons at a `/galeria` page that doesn't exist |
| Centrum components | `src/components/centrum/` | Header, Footer, Hero, PromoBar and the other section blocks: reuse before adding new ones, see `docs/conventions.md` |
| Payload CMS admin + API | `src/app/(payload)/` | Admin UI only on dashboard host; REST/GraphQL under `/api` |
| Host proxy (dash vs public) | `src/proxy.ts` | `dash.localhost` → admin; public hosts return **404** for `/admin` (no redirect leak); rewrites `/admin/c/*`→`/collections/*`, `/admin/g/*`→`/globals/*` |
| Access control / roles | `src/access/roles.ts` | Roles: administrator, moderator, redaktor, klient |
| Payload config | `src/payload.config.ts` | CMS entry: DB adapter, editor, collections, i18n PL |
| Payload collections | `src/collections/` | `Users`, `Authors`, `Categories`, `Media`, `Pages` (nested tree), `Posts` (blog) |
| Payload collections | `src/collections/` | `Users`, `Media`, `Pages` (nested tree), `Posts` (blog) |
| Media library (admin) | `src/collections/Media.ts`, `src/components/admin/media/`, `docs/media.md` | Explorer (grid/list/folders), a11y/SEO fields, conversion options |
| Site settings (global) | `src/globals/SiteSettings.ts` | Brand identity, contact, default SEO |
| Appearance: colour scheme (admin + site) | `src/globals/ThemeColors.ts`, `src/lib/theme-tokens.ts`, `src/lib/theme-css.ts`, `docs/appearance.md` | Global palette → `--bw-*` CSS vars on the public site; presets + live preview in admin |
| Appearance: saved compositions (admin) | `src/collections/SiteComponents.ts`, `src/components/admin/builder/ComponentBuilder.tsx`, `docs/appearance.md` | Editor's own arrangements of elements („zdjęcie + tekst”), placed on pages via the `savedComponent` element |
| Element library (page builder widgets) | `src/fields/elements/`, `src/lib/element-catalog.ts`, `docs/page-builder.md` | 16 blocks (heading, text, image, buttons, icon list, columns, divider, spacer, gallery, carousel, video, hero, CTA, cards, accordion, saved). Each carries the shared `style` group: padding/margin, border, radius, shadow, width, alignment, per-breakpoint visibility |
| Page builder (Strony → Nowa strona) | `src/fields/page-layout.ts`, `src/components/admin/builder/`, `docs/page-builder.md` | `pages.layout` = ordered **sections** (width/spacing/background/anchor), each holding a tree of elements. Custom Field component: library + canvas + inspector; the inspector is Payload's own `RenderFields`, so rich text/uploads/conditions come free |
| Page builder: public renderer | `src/components/page-blocks/PageSections.tsx`, `src/components/elements/`, `src/lib/cms-page.ts` | **The same element components render the builder canvas and the site.** The catch-all serves a published page, else 404s as before. **Reads need `depth: 3`**; CMS pages are PL-only and 404 in EN per `docs/i18n.md` |
| Element parameter readers (shared) | `src/lib/component-values.ts`, `src/lib/component-styles.ts`, `src/lib/element-styles.ts`, `src/lib/page-sections.ts` | One source for the canvas **and** the site. Element layout CSS lives in `src/styles/elements.css`, imported by `globals.css` *and* `(payload)/custom.css`; responsiveness is **container queries**, so the canvas's phone preview is honest |
| Shared CMS fields | `src/fields/` | SEO meta, slug helpers |
| Admin UI extras | `src/components/admin/` | WelcomeDashboard, PagesTree, AdminNav, ComingSoonView, UpdatesView, media/* |
| Admin AI (Gemini) | `src/lib/ai/`, `src/app/api/admin/ai/`, `src/components/admin/ai/`, `docs/admin-ai.md` | Assistive AI on dash only: ALT, SEO, EN draft, post draft, help chat. `GEMINI_API_KEY` |
| Admin: package updates | `src/components/admin/UpdatesView.tsx`, `UpdatesPanel.tsx`, `LibrariesView.tsx`, `LibrariesPanel.tsx`, `package-report-ui.tsx`, `src/lib/package-updates.ts`, `src/app/api/admin/package-updates/` | Kokpit → Aktualizacje = outdated only (declared/installed/latest + release notes link); Zarządzanie → Biblioteki = inventory (installed + npm/site/GitHub icons, no update highlight); 24h cache |
| Admin nav tree | `src/admin/nav-tree.ts` | Nested sidebar structure (custom Nav; stubs → `/admin/coming-soon`) |
| Frontend i18n | `messages/`, `src/i18n/` | next-intl (default `pl`) |
| Date/time display (PL) | `src/lib/format-date.ts` | `formatDatePl`, `formatDateTimePl`; Payload `admin.dateFormat`; next-intl `formats` |
| Media compression | `src/lib/compress-media.ts`, `src/lib/media-filename.ts` | Format/size/quality options; ALT/slug from filename |
| Generated Payload types | `src/payload-types.ts` | Regenerate with `pnpm generate:types` |
| Local Postgres (dev) | `docker-compose.yml` | `docker compose up -d` → `localhost:5432` / DB `bodywork` |
| Static assets served by Next.js | `public/` | favicons, robots.txt, etc. |
| Site scraper / mirror toolkit | `scripts/scrape/` | Mirrors `bodywork.testowe.eu` (Centrum design reference); see `docs/scraped-site-map.md` |
| Reference mirror output (gitignored) | `scripts/scrape/scraped/` | Regenerate with `scripts/scrape/run_scrape.bat`; preview with `scripts/scrape/serve_mirror.bat` (http://localhost:8765) |
| Sitemap used by the scraper | `scripts/scrape/sitemap.xml` | Source list of URLs to mirror |
| Hub / Akademia route groups | not yet created | Will land under `src/app/[locale]/(hub)/` and `(akademia)/` per `docs/sites.md`, add a row here for each as it's built |

**Rule:** a new domain = a new module/folder + a row in this table. When a row gets too broad, split it into its own `docs/<topic>.md` and link it from the docs index above.
