> Read when: **always, before you search this repo for anything.** This is step zero of every task.

# Map: where things live

Find the domain, go straight to the file. Don't grep blind.
Something missing here that exists in the code? **Add its row in the same change**, otherwise the map starts lying.

[Public site](#public-site) · [Blog](#blog) · [Page builder](#page-builder) · [CMS / Payload](#cms--payload) ·
[Media](#media) · [Admin panel](#admin-panel) · [Accounts and roles](#accounts-and-roles) · [Appearance](#appearance) ·
[i18n](#i18n-plen) · [SEO](#seo) · [Newsletter and email](#newsletter-and-email) · [Admin AI](#admin-ai) ·
[Package updates](#package-updates) · [Scraper](#scraper--centrum-reference) · [Infra and dev](#infra-and-dev) ·
[Parallel work](#parallel-work) · [**Not built yet**](#not-built-yet-dont-go-looking)

---

## Public site
Every Centrum page (28 routes) plus the shared section blocks. App Router, Polish by default.
- Routes (`src/app/[locale]/`): `fizjoterapia/`, `dietetyka/`, `trening-personalny/`, `trening-grupowy/`, `masaz/`, `bodylab/`, `cennik/`, `kontakt/`, `instrukcja/`, `regulamin/`, `polityka-prywatnosci/`
- Sections (`src/components/centrum/`, 37 files): `Header`, `MegaMenu`, `MobileNav`, `Footer`, `PromoBar`, `Hero`, `PageHero`, `TextMedia`, `ServiceGrid`, `StatementSection`, `Accordion`, `*Carousel`, `FullBleed*`, `LegalDocument`
- Primitives (`src/components/ui/`): `Container` (the width-cap fix), `Button`, `SectionHeading`
- Sub-tree navs: `src/components/centrum/nav-items.ts` plus `*Nav.tsx` (Bodylab, Dietetics, Physiotherapy, GroupTraining, PersonalTraining, Section)
- Errors: `[locale]/not-found.tsx`, `error.tsx`, `[locale]/[...rest]/`, `src/app/global-error.tsx`, shared shell `NoticeLayout.tsx`
- Outbound links: `src/lib/external-links.ts`
- ⚠ The catch-all `[...rest]` and the client-component 404 are **both** load-bearing: read the note in `migration-tracker.md` first.
- ⚠ There is deliberately no `src/app/layout.tsx`, so `[locale]` and `(payload)` can each own their `<html>`.
- Skill: `centrum-fidelity`. Deeper: `sites.md`, `scraped-site-map.md`

## Blog
Listing, post, category archives, English versions. Payload Local API; filtering happens client-side.
- Routes (`src/app/[locale]/blog/`): listing, `[slug]`, `kategoria/[slug]`, `strona/[page]`
- Collections: `src/collections/Posts.ts`, `Categories.ts`, `Authors.ts`, `PostTranslations.ts`
- Components: `BlogList.tsx`, `PostCard.tsx`, `PostBody.tsx`, `BlogTeasers.tsx`, `NewsCarousel.tsx`, `BlogIcons.tsx`
- Helpers: `src/lib/blog-listing.ts`, `blog-page-size.ts`, `post-translation.ts`
- Scripts: `scripts/content-health.ts` (editorial worklist), `fix-blog-from-reference.ts` (`DRY=1`, **not** `--dry`), `fix-image-alt-text.ts`, `import-blog.ts`
- ⚠ No translation means the post **404s in EN**. The listing prints no dates, deliberately. `BlogList` keeps its own copy of the card (it carries the grid divider borders).
- Deeper: `i18n.md`

## Page builder
`pages.layout` = ordered sections, each holding a tree of elements. The same component renders the canvas and the site.
- Schema: `src/fields/page-layout.ts`, `src/fields/elements/` (`basic`, `layout`, `media`, `sections`, `shared`, `style`)
- Editor UI (`src/components/admin/builder/`): `PageBuilder`, `ElementLibrary`, `CanvasList`, `InspectorPanel`, `ComponentBuilder`, `model.ts`
- Renderers (shared!): `src/components/elements/` plus `src/components/page-blocks/PageSections.tsx`
- Parameter readers: `src/lib/component-values.ts`, `component-styles.ts`, `element-styles.ts`, `page-sections.ts`, `element-catalog.ts`, `cms-page.ts`
- CSS: `src/styles/elements.css` (imported by `globals.css` **and** `(payload)/custom.css`); builder chrome in `src/app/(payload)/builder.css`
- Public route: `src/app/[locale]/[...rest]/page.tsx` · Seed: `src/seed/appearance-samples.ts` · Smoke: `scripts/smoke-page-builder.ts` (`pnpm smoke:builder`)
- ⚠ Reads need `depth: 3`. CMS pages are PL-only and 404 in EN. Responsiveness is **container queries**, not media queries.
- Skill: `page-builder`. Deeper: `page-builder.md`

## CMS / Payload
Config, collections, globals, the panel itself.
- Entry: `src/payload.config.ts` · Panel and API: `src/app/(payload)/`
- Collections (`src/collections/`): `Users`, `Media`, `Pages` (nested tree), `Posts`, `Categories`, `Authors`, `PostTranslations`, `Subscribers`, `SiteComponents`
- Globals: `src/globals/SiteSettings.ts`, `ThemeColors.ts` · Shared fields: `src/fields/meta.ts`
- Host proxy: `src/proxy.ts`, admin **only** on `dash.`, public hosts 404 on `/admin`
- ⚠ `src/payload-types.ts` (754 KB) and `importMap.js` are **generated**: never by hand, never read in full.
- Skill: `payload-schema`

## Media
Upload, compression, the admin library.
- Collection: `src/collections/Media.ts`, downscales to a 2560px long edge, WebP, four sizes (thumbnail/card/content/hero)
- Panel (`src/components/admin/media/`): `MediaLibrary`, `MediaBrowser`, `MediaAutofill`, `MediaTagsField`, `MediaSaveButton`
- Helpers: `src/lib/compress-media.ts`, `media-filename.ts`, `media.ts`, `image-display.ts`
- Placeholders (LQIP): `blurDataURL` on Media plus `scripts/import-blur-placeholders.ts`; static pages use `scripts/generate-blur-placeholders.mjs` → `src/lib/static-blur.ts` (**server components only**)
- Video: `scripts/optimize-hero-video.mjs` → `public/videos/` (VP9/h264 at 720 and 1280, no audio)
- Deeper: `media.md`

## Admin panel
Navigation, dashboard, custom views.
- Menu structure: `src/admin/nav-tree.ts` · Render: `src/components/admin/AdminNav.tsx`, `nav-icons.tsx`
- Views: `WelcomeDashboard.tsx`, `PagesTree.tsx`, `ComingSoonView.tsx`, `SeoPreview.tsx`, `SeoHints.tsx`
- ⚠ Nav presentation lives in `(payload)/custom.css` (`.bw-nav*`), **not** in the component. Stub leaves route to `/admin/coming-soon`.
- Skill: `admin-copy` (every `label` and `admin.description`)

## Accounts and roles
Roles: `administrator` · `edytor` · `klient`. Login by `username` **or** email.
- Access: `src/access/roles.ts` · Collection: `src/collections/Users.ts`
- Helpers (`src/lib/users/`): `username.ts`, `password.ts`, `availability.ts`, `display-name.ts`, `slugify-pl.ts`
- UI (`src/components/admin/users/`): `CreateFirstUserForm/View`, `UserFormEnhancements`
- API: `src/app/api/admin/users/availability/`
- ⚠ No public self-registration. The password generator is hand-rolled crypto, **no new dependency**.

## Appearance
Global palette drives the `--bw-*` CSS vars on the site; presets and live preview in the panel.
- Global: `src/globals/ThemeColors.ts` · Tokens: `src/lib/theme-tokens.ts`, `theme-css.ts`, `theme-presets.ts`, `get-theme-colors.ts`
- UI (`src/components/admin/appearance/`): `ColorField`, `ThemePresets`, `ThemePreview`
- Saved compositions: `src/collections/SiteComponents.ts` plus `builder/ComponentBuilder.tsx`; seed: `src/seed/appearance-samples.ts` (`pnpm seed:appearance`)
- Deeper: `appearance.md`

## i18n (PL/EN)
next-intl for UI strings, a separate collection for posts. Default locale `pl`.
- Config (`src/i18n/`): `routing.ts`, `request.ts`, `navigation.ts`, `client-namespaces.ts`
- Strings: `messages/pl.json`, `messages/en.json` · Dates: `src/lib/format-date.ts` · Slugs: `format-slug.ts`
- ⚠ **Only 11 of 46 namespaces reach the browser.** A `"use client"` component reading a namespace that isn't listed renders the key path instead. Add it to `client-namespaces.ts`, verify with `pnpm check:messages`.
- Skill: `i18n-messages`. Deeper: `i18n.md`

## SEO
- Metadata: `src/lib/metadata.ts` plus each route's `generateMetadata` · Fields: `src/fields/meta.ts`
- Structured data: `src/lib/structured-data.ts` (`HealthAndBeautyBusiness`, `BlogPosting`, `BreadcrumbList`)
- Sitemap and robots: `src/app/sitemap.ts` (walks `src/app/[locale]`, so it can't drift), `src/app/robots.ts`
- RSS: `src/app/feed.xml/route.ts`, deliberately **outside** `[locale]` and Polish only

## Newsletter and email
The list lives in our Postgres; Resend only delivers.
- API (`src/app/api/newsletter/`): `subscribe`, `confirm/`, `unsubscribe/` · Collection: `src/collections/Subscribers.ts`
- Pages: `src/app/[locale]/newsletter/` · Form: `centrum/NewsletterSignup.tsx`
- Sending: `src/lib/email.ts` (one `fetch`, no SDK), `payload-email.ts` (the hand-rolled adapter; without it password resets never arrive)
- ⚠ With no `RESEND_API_KEY`, mail is **logged, not sent**. Unsubscribe is GET-asks / POST-does, on purpose.

## Admin AI
Assistive AI (Gemini), dashboard host only: ALT text, SEO, EN draft, post draft, help chat.
- Logic (`src/lib/ai/`): `client.ts`, `gemini.ts`, `prompts.ts`, `tasks.ts`, `auth.ts`
- API: `src/app/api/admin/ai/` · UI: `src/components/admin/ai/`, `EnglishVersionPanel.tsx`
- ⚠ Needs `GEMINI_API_KEY`. Deeper: `admin-ai.md`

## Package updates
Kokpit → Aktualizacje shows outdated packages only. Zarządzanie → Biblioteki is inventory.
- Logic: `src/lib/package-updates.ts`, `package-updates-shared.ts` (client-safe) · API: `src/app/api/admin/package-updates/`
- UI: `UpdatesView/Panel.tsx`, `LibrariesView/Panel.tsx`, `package-report-ui.tsx`
- ⚠ One shared report and cache (24 h); the views differ **only** in table mode. GitHub tag URLs assume a `v` prefix.

## Scraper / Centrum reference
A mirror of `bodywork.testowe.eu`: the content and design source, not production code.
- Toolkit: `scripts/scrape/` · Output (gitignored): `scripts/scrape/scraped/`
- Regenerate: `scripts/scrape/run_scrape.bat` · Preview: `serve_mirror.bat` → `localhost:8765`
- Deeper: `scraped-site-map.md` (which URL maps to which folder)

## Infra and dev
- Dev database: `docker-compose.yml` → `localhost:5432`, DB `bodywork` · Env: `.env.example`
- Next: `next.config.ts` · Scripts: `package.json` (`dev`, `build`, `lint`, `generate:types`, `generate:importmap`, `check:messages`, `smoke:builder`, `seed:appearance`)
- Static assets: `public/` · Smoke tests: `scripts/smoke-*.ts`
- ⚠ There is no test runner. All you have: `pnpm build`, `pnpm smoke:builder`, `pnpm check:messages`, `scripts/smoke-*.ts`.
- ⚠ `pnpm lint` is broken on `main` too (eslint-plugin-react 7.37 vs ESLint 10); see `log.md`.

## Parallel work
Several agents at once = own worktree, own database, own port.
- Rules: `parallel-agents.md` · Procedures: `runbooks/start-parallel-work.md`, `runbooks/post-merge-sync.md`
- Skills: `start-parallel-work`, `post-merge-sync` · For other tools: `../prompts/parallel-agent-bootstrap.md`
- ⚠ **Never `docker compose down -v`**: one volume holds every agent's database.

---

## Not built yet, don't go looking

None of this is in the repo. Don't grep for it, don't assume you missed it.

- **Payments, cart, orders, Przelewy24:** no code at all. Data model: `prd/06-dane-api.md`,
  env and security: `prd/07-bezpieczenstwo.md`. Account helpers ready to reuse for checkout: `src/lib/users/`.
- **The `body-work.pl` hub:** nothing. Will land under `src/app/[locale]/(hub)/`, see `sites.md`.
- **Akademia (B2B, courses):** nothing. Will land under `src/app/[locale]/(akademia)/`.
- **`/cookies`:** deferred by the client. `/test` and `/podziekowanie` await a client decision.
- **`/galeria`:** the reference links to a page that **doesn't exist**; the workaround is in `src/lib/external-links.ts`.
- **Unit tests, e2e, any test runner:** none. Smoke scripts and `pnpm build` are the whole story.
- **Redis, S3, monitoring, analytics:** in the PRD, not in the code. Dev keeps files on disk and the database in Docker.

Built one of these? **Move it out of this section into its domain**, that's part of "done".
