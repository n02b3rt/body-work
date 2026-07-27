# Migration tracker: Centrum, scraped mirror → Next.js

> Living checklist, update as you go. Written in English. One row per unique template/page (PRD §6.2 counts ~22 unique Centrum templates), for full URL-level detail see [`scraped-site-map.md`](./scraped-site-map.md).

## How to use this file

- Update the row **when you touch that page**: don't batch it up for later, it'll drift.
- **Components:** name what was reused from an existing component vs. newly created (new ones should usually be built reusable, see the reuse rule in [`conventions.md`](./conventions.md)).
- **i18n:** `PL` / `EN` status each as `: ` (not started), `draft`, or `done`. See [`i18n.md`](./i18n.md): the scraped source is Polish-only, so EN is always a translation task, not a copy task.
- **Visual QA:** `: ` until you've opened the built page next to `localhost:8765/<slug>/` (or the live site) and confirmed layout/copy/imagery match (see `scraped-site-map.md`).
- **Status:** `Not started` → `In progress` → `Built (PL)` → `Bilingual` → `Verified`.

## Site-wide check against the live original: 2026-07-26

All 22 built routes were compared **rendered-output to rendered-output**: our SSR HTML from
`localhost:3000` against the live `bodywork.testowe.eu`, matching headings, paragraphs, price
figures and per-page section inventory. This is stronger than the earlier per-section checks,
which compared our *message files* to the scrape and so could not catch a string that exists in
`messages/*.json` but is never rendered, which is exactly the class of bug it found (Iwona's
empty pricing panel). Result: **0 missing headings and 0 missing price figures on every subpage.**

**A real browser pass followed on the same day**: Chrome connected for the first time in this
project. It compared our pages with the live site by reading `getBoundingClientRect` /
`getComputedStyle` on both sides (screenshots are downscaled, so eyeballed positions mislead) and
found four further defects: hub titles were left-aligned where the reference right-aligns them,
the display-heading cap was 282px instead of the real 255px, accordion panel copy didn't line up
under its own row heading, and every price list had lost the reference's blank lines. All fixed
and re-measured against the original, see `AI_NOTES.md`.

Two things it could **not** confirm: the reference's promo pills were already dismissed by cookie
in this browser, so they were compared by spec rather than side by side; and `resize_window` does
nothing while the Chrome window is maximized, so the sub-1060px layout is confirmed from the
compiled CSS only, not from a live narrow render.

What the pass fixed is recorded in `AI_NOTES.md`; the rows below carry the per-page detail.

## Audit against the original: 2026-07-27

URL coverage: **27 of 32** content pages built; **62 of 62** blog posts in the database
(exact match both ways). The 5 unbuilt: `/masaz` and `/cookies` (deferred by the user),
`/test` and `/podziekowanie` (awaiting a client decision on whether they carry over), and
`/trening-grupowy/grafik-zajec` (not applicable: outbound eFitness link). `/zakupy/*`
(10 URLs) stays out of scope as the future shop model.

### Gaps, worst first

All six items were fixed on 2026-07-27. Item 1 was the last, once the user picked the
delivery route: *"ogólnie będziemy robić to przez bramkę resenda"*. **Two manual steps are
still outstanding before newsletter mail physically leaves the building**: verifying
`body-work.pl` in Resend (DKIM + SPF in Cloudflare) and setting `RESEND_API_KEY`. Neither is
a code task; see `docs/stack.md`.

| # | Gap | Why it matters |
|---|---|---|
| 1 | ~~The newsletter form throws the address away~~: **fixed 2026-07-27.** A `subscribers` collection, a double opt-in through `/api/newsletter`, and Resend as the relay. See the note below | - |
| 2 | ~~Every page has the same `<title>`~~: **fixed 2026-07-27.** Every route has a `generateMetadata` built from its existing title copy; posts prefer their SEO `meta` fields and fall back to the article title. Verified 12/12 distinct titles across a sample | - |
| 3 | ~~No `sitemap.xml`~~: **fixed 2026-07-27.** `src/app/sitemap.ts` emits **89 URLs** (27 pages + 62 posts) with `hreflang` pairs for both locales. Static routes are discovered by walking `src/app/[locale]` so the list can't drift; posts come from Payload, and a database outage degrades to the static pages rather than failing the build | - |
| 4 | ~~No `robots.txt`~~: **fixed 2026-07-27.** Allows everything except `/admin` and `/api/`, and points at the sitemap | - |
| 5 | ~~No Open Graph tags~~: **fixed 2026-07-27.** Seven `og:*` plus four `twitter:*` tags per page, canonical and `hreflang`. A post with a featured image uses it; the rest fall back to a real brand photo. Posts also carry `og:type=article` and `article:published_time` | - |
| 6 | ~~The 404 page is Next's default~~: **fixed 2026-07-27.** Branded 404, a `[locale]/error.tsx` boundary and a root `global-error.tsx`. See the note below | - |

### Error pages: how they had to be wired

Three surfaces: `[locale]/not-found.tsx` (404), `[locale]/error.tsx` (render failures, with
a retry button) and `app/global-error.tsx` (a failure in the locale layout itself, so it
brings its own `<html>`, styles and font).

Two things about this app's shape made it harder than it looks, both worth knowing:

1. **An unmatched URL never reached our 404.** With no root layout: `[locale]` and
   `(payload)` deliberately own their own `<html>`: Next resolves an unmatched path
   against the *root* `not-found`, which doesn't exist here, so visitors got the unstyled
   built-in. Fixed with a `[locale]/[...rest]` catch-all that calls `notFound()`, since a
   `notFound()` raised inside the segment *does* resolve to the segment's boundary.
   Next's `global-not-found` would cover this too but is still behind an experimental flag.
2. **`not-found.tsx` has to be a Client Component.** Both `getTranslations()` and
   `getTranslations({ locale: await getLocale() })` throw inside a not-found boundary: the
   request locale is never established for one, and when the file throws, Next silently
   substitutes its own blank 404. That failure is indistinguishable from "the boundary
   isn't wired up", which cost real time to diagnose. `useTranslations` works because the
   locale layout still renders around it. Trade-off: the copy is hydrated rather than
   server-rendered, so the initial HTML is empty. Acceptable: the 404 **status** is what
   crawlers act on, and the page renders fully for every real visitor.

### Checked and *not* a gap

- The reference's post pages have no share buttons, related posts, comments, tags, prev/next navigation or newsletter block: neither do ours. Two earlier "prev/next" and "result count" hits were false positives: ordinary prose (`poprzednich swoich idei`) and a comment inside its filter script.
- The reference's listing has no pagination; it renders every post and filters client-side, as ours does.
- Its "POWRÓT" is a `<button>` firing browser history, not a link. Ours is a real `WRÓĆ NA BLOG` link to `/blog`, which survives deep links and shares, a deliberate improvement, not a divergence.
- All 12 sampled routes resolve under `/en`.

## Homepage

| Scraped route | Target route | Components | i18n | Visual QA | Status |
|---|---|---|---|---|---|
| `/` | `/` (+ `/en`) | Hero (text only), FullBleedVideo (real hero video, now its own section), NewsCarousel, TextMedia ×2 (friendly space, team teaser: real photos), StatementSection ×4 (balanced fitness, movement tool, teach potential, health process), FullBleedImage, ServiceGrid (6 real photo tiles + CTA), TestimonialCarousel (with name attribution), NewsletterSignup (real bg, cream section), PartnerLogos (7 real logos), Header/MobileNav (real logo + icons, scroll-triggered logo/tagline crossfade, Akademia/Kontakt utility bar), Footer, PromoBar | PL: done / EN: done | Verified structurally against the scraped reference's actual HTML/CSS (not just build + dev server render, read `assets/css/auto.css` directly for exact colors/section structure since the header/section shape turned out meaningfully different from the first pass): **still not checked in an actual browser**, Claude-in-Chrome was unavailable both sessions; do that before calling this row done. 2026-07-26: all 7 testimonial quotes restored **verbatim** (they had been silently tidied up, see AI_NOTES). Remaining unmatched copy here is the News carousel, deliberately deferred until the blog exists | In progress |

## Trening personalny

| Scraped route | Target route | Components | i18n | Visual QA | Status |
|---|---|---|---|---|---|
| `/trening-personalny/` | `/trening-personalny/` | New: SectionNav/PersonalTrainingNav, PageHero, CenteredBand, MediaCardCta. Reused: StatementSection, TextMedia, TestimonialCarousel (generalised to take items as props), NewsletterSignup | PL: done / EN: done | Copy verified verbatim against the scrape both ways (no missing headings, no altered strings): **not yet opened in a browser** | Bilingual |
| `/trening-personalny/trening-indywidualny/` | same | New: Accordion. Reused: PageHero, CenteredBand, TextMedia, SectionNav | PL: done / EN: done | Same automated two-way check | Bilingual |
| `/trening-personalny/trening-w-parze/` | same | Reused: PageHero, TextMedia, Accordion (subset of the shared items), SectionNav | PL: done / EN: done | Same automated two-way check: this check caught a whole section I'd missed | Bilingual |
| `/trening-personalny/ocena-funkcjonalna/` | same | Reused: PageHero, CenteredBand, StatementSection, SectionNav | PL: done / EN: done | Same automated two-way check | Bilingual |
| `/trening-personalny/trenerzy/` | same | Reused: PageHero, CenteredBand, SectionNav; 3 categories × 18 trainer cards | PL: done / **EN: bios still Polish** (see AI_NOTES) | Same automated two-way check | Built (PL) |

## Fizjoterapia

| Scraped route | Target route | Components | i18n | Visual QA | Status |
|---|---|---|---|---|---|
| `/fizjoterapia/` | `/fizjoterapia/` | New: PhysiotherapyNav. Reused: PageHero, CenteredBand, TextMedia ×4, Accordion (6 equipment items), MediaCardCta ×2, TestimonialCarousel | PL: done / EN: done | Automated two-way check vs. the scrape (0 issues): **not opened in a browser** | Bilingual |
| `/fizjoterapia/terapia-manualna/` | same | Reused: PageHero, CenteredBand, Accordion (10 conditions) | PL: done / EN: done | Same check: caught a missing contact section | Bilingual |
| `/fizjoterapia/rehabilitacja-ruchowa/` | same | Reused: PageHero, CenteredBand, Accordion (12 conditions) | PL: done / EN: done | Same check | Bilingual |
| `/fizjoterapia/zdrowy-brzuch/` | same | Reused: PageHero; 3 leads + 2 pricing formats | PL: done / EN: done | Same check | Bilingual |
| `/fizjoterapia/specjalisci/` | same | Reused: PageHero, CenteredBand; 2 categories × 11 specialists | PL: done / **EN: bios still Polish** (same reason as the trainers) | Same check | Built (PL) |

## Trening grupowy

| Scraped route | Target route | Components | i18n | Visual QA | Status |
|---|---|---|---|---|---|
| `/trening-grupowy/` | `/trening-grupowy/` | New: GroupTrainingNav. Reused: PageHero, CenteredBand, TextMedia ×2, TestimonialCarousel | PL: done / EN: done | Automated two-way check (0 issues): **not opened in a browser** | Bilingual |
| `/trening-grupowy/zajecia-grupowe/` | same | Reused: PageHero, CenteredBand, StatementSection ×3, Accordion (13 classes) | PL: done / EN: done | Same check | Bilingual |
| `/trening-grupowy/plan-zdrowej-zmiany/` | same | Reused: PageHero, CenteredBand, StatementSection ×3, TestimonialCarousel (16 unattributed quotes). Title runs on two lines (`titleNote` carries the edition date, as the reference's `<br>` does) | PL: done / EN: done | Same check + live re-verify 2026-07-26 | Bilingual |
| `/trening-grupowy/medicover/` | same | Reused: PageHero | PL: done / EN: done | Same check | Bilingual |
| `/trening-grupowy/grafik-zajec/` | outbound link only (eFitness) | n/a: confirmed: the scraped page carries no content of its own, only the shared footer, and every nav on the reference links straight to eFitness | n/a | n/a | Not applicable |

## Dietetyka

| Scraped route | Target route | Components | i18n | Visual QA | Status |
|---|---|---|---|---|---|
| `/dietetyka/` | `/dietetyka/` | New: DieteticsNav. Reused: PageHero, StatementSection ×3, two path cards | PL: done / EN: done | Automated two-way check (0 issues): **not opened in a browser** | Bilingual |
| `/dietetyka/iwona-stachowiak/` | same | Reused: PageHero, TextMedia ×4, Accordion (pricing: 6 priced items, **was shipped empty until 2026-07-26**), TestimonialCarousel (9 quotes) + 4-photo strip. No newsletter block (reference has none) | PL: done / **EN: bio still Polish** | Same check + live re-verify 2026-07-26 | Built (PL) |
| `/dietetyka/magdalena-hajduk-warchol/` | same | Reused: PageHero, StatementSection ×3, TextMedia ×2, Accordion (pricing), TestimonialCarousel (4 quotes). No newsletter block (reference has none) | PL: done / **EN: bio still Polish** | Same check + live re-verify 2026-07-26 | Built (PL) |

## BodyLab

| Scraped route | Target route | Components | i18n | Visual QA | Status |
|---|---|---|---|---|---|
| `/bodylab/` | `/bodylab/` | New: BodylabNav. Reused: PageHero; 3 alternating tool blocks | PL: done / EN: done | Automated two-way check (0 issues): **not opened in a browser** | Bilingual |
| `/bodylab/technologia-vald/` | same | Reused: PageHero, StatementSection ×7, Accordion (pricing). No newsletter block (reference has none) | PL: done / EN: done | Same check + live re-verify 2026-07-26 | Bilingual |
| `/bodylab/analiza-skadu-ciala/` | same, note the slug really is missing the "ł" on the reference (markup + sitemap.xml) | Reused: PageHero, TextMedia ×2. No newsletter block (reference has none) | PL: done / EN: done | Same check + live re-verify 2026-07-26 | Bilingual |

## Standalone pages

| Scraped route | Target route | Components | i18n | Visual QA | Status |
|---|---|---|---|---|---|
| `/cennik/` | `/cennik/` | Reused: PageHero, Accordion (9 price rows; the component gained `cta`/`note`/`groups` and now `panelHeading` for this page). **No newsletter block**: the reference has none here | PL: done / EN: done | Two-way check plus a dedicated price audit, all 46 distinct figures verified present; re-verified against the live site 2026-07-26 | Bilingual |
| `/masaz/` | `/masaz/` | - | PL:: / EN:: | - | Not started |
| `/kontakt/` | `/kontakt/` | Reused: PageHero (display title, **left**-aligned), MeetUsCta. **The reference page has no content of its own**, see the note below | PL: done / EN: done | Composed from copy already verified elsewhere; nothing invented | Bilingual |
| `/instrukcja/` | `/instrukcja/` | New: none. Reused: PageHero, StatementSection ×8 (3 of them a 3-up bullet row), FullBleedImage ×4, CenteredBand, MediaCardCta ×2. 7 images copied. No newsletter block: the reference has none | PL: done / EN: done | Two-way check vs. the live site: 0 missing headings | Bilingual |

## Blog

| Scraped route | Target route | Components | i18n | Visual QA | Status |
|---|---|---|---|---|---|
| `/blog/` (listing) | `/blog/` | New: `BlogList`: the reference's featured card for the newest post (half-width photo, oversized title, lead, PRZECZYTAJ), then a 3-column grid with its border dividers, reading time and author. Rectangular category select with the reference's own painted chevron, search field filling the row, SZUKAJ button. Reused: PageHero | PL: done / EN: done | Measured in a browser: 3 equal 479px columns with edge borders, divider dropped on every 3rd card, featured photo fills the row, search/category/empty-state/reset all correct, no horizontal overflow. Rendering window verified with real scroll input: 9 → 27 → 61 cards, window resets to 9 on filter, counter and button disappear when exhausted. **Mobile not verified in a browser**: the extension would not resize the viewport | Bilingual |
| `/blog/<slug>/` × 62 posts | `/blog/<slug>/` | Rebuilt 2026-07-27 in the reference's order: title (half width, so 68px type still wraps), rule, date + reading time, rule, author block (10rem round portrait, AUTOR:, name, role), then the article. Lexical body via `RichText`; `.blog-prose` in globals.css carries the article typography | PL: done / EN: UI strings done, **post content is Polish** (62 articles, a translation job for a human, not a machine) | Checked in a real browser: 62 cards, filter (Fizjoterapia 43 / Trening 50 / Dietetyka 4 / Masaż 4) and search both work, empty state matches the reference wording. Six post pages sampled: bodies, inline images and author blocks all render, no failed image loads, no dashboard-host URLs. 0 empty bodies, 0 posts missing an author/date/reading time, 0 CSS leaks | Bilingual |

**No hero image and no lead paragraph on a post page: both were duplicates.**
`featuredImage` is the post's *first body image*, kept for the listing card; rendering it
as a hero showed the same picture twice, full-bleed and again a few lines into the
article. `excerpt` is likewise the article's own opening paragraph, so printing it above
the body repeated that paragraph in oversized type. The reference has neither element.

### Blog: what the reference actually has (verified 2026-07-27)

| Thing | Finding |
|---|---|
| Posts | 62. One (`operacja-koniecznosc-czy-ostatecznosc`) had failed the original scrape with a `ConnectionError` and was re-fetched by hand |
| Images | **56 of 62 posts carry content images; 6 have none at all.** An earlier count of "60 of 61, 194 images" was wrong, it counted the author portrait as a content image. 168 media files were imported in total (post images + 18 author portraits) |
| Categories | Exactly four: Fizjoterapia, Masaż, Trening, Dietetyka. Posts can carry several (35 posts carry two); 2 posts are uncategorised |
| Authors | **24 distinct names**, of which only **18 have a portrait** in the source. They are trainers/physiotherapists, not CMS users: hence the `Authors` collection rather than a `users` relationship. Two credits don't split cleanly in the source: one is a joint "Karol Kikut & Jakub Grzęda", another runs the name into a sentence; the importer cuts the name at the first comma, which handles both |
| Card meta | date · reading time ("10 min") · author name |
| Body markup | A small, clean vocabulary: `p`, `h2`, `h3`, `strong`, `em`, `ol`/`li`, `img`, `a`: plus exactly one `blockquote` and one `table` in the whole corpus |
| Pagination | None found. The listing renders every post and filters client-side |
| Uncategorised | 2 posts carry no category on the reference, and none here either |

## Legal & utility

| Scraped route | Target route | Components | i18n | Visual QA | Status |
|---|---|---|---|---|---|
| `/regulamin/` | `/regulamin/` | New: `LegalDocument`. Reused: PageHero. 11 sections (§ I–XI), no imagery, no newsletter | PL: done / **EN: text stays Polish**, see below | Two-way check vs. the live site: 0 missing headings | Built (PL) |
| `/polityka-prywatnosci/` | `/polityka-prywatnosci/` | Reused: PageHero, `LegalDocument`. 12 sections (I–XII) | PL: done / **EN: text stays Polish**, see below | Same check: 0 missing headings | Built (PL) |
| `/cookies/` | `/cookies/` | - | PL:: / EN:: | - | Not started |

**The two legal documents are deliberately not translated.** `en.json` carries the Polish
text for `Terms` and `Privacy`. A mistranslated T&C or privacy policy is legal exposure,
not a copy nit: these need a professional/legal pass before an English version ships.
Same precedent as the trainer and specialist biographies.

### Why the listing renders a window of cards (2026-07-27)

All 62 posts stay in memory: filtering and search run over the whole set client-side, as on
the reference, and fetching in batches would mean a round trip per keystroke, but only 9 are
put in the DOM, growing by 9 as the reader scrolls (`IntersectionObserver`, 600px ahead of
the viewport, with a "Pokaż więcej" button beside it for keyboards and for anything without
an observer).

Measured before and after, because the obvious suspect turned out to be innocent:

| | before | after |
|---|---|---|
| DOM nodes | 1764 | **571** |
| page height | 20,039px | **4,972px** |
| document transferred | 119KB | 103KB |
| raw HTML (dev) | 546KB | 344KB |
| blog images actually fetched | **1 of 62** | 1 of 10 |

**The images were never the problem**: `next/image` already defers them, and only one of 62
had loaded. The cost was the markup and the DOM: 62 cards, each carrying two inline SVG
icons. The document only shrank 13% because the post *data* still ships for client-side
filtering; that is the deliberate trade.

### In-article images, author photos, and English versions (2026-07-28)

**Half the in-article images were being blown up.** Measured: of 150 images inside articles,
**75 are narrower than the 1376px body**, one of them 196px, so `w-full` was stretching them by
up to seven times into mush. The reference does exactly the same (`db w100p ha`, no cap) but its
article column is half the width, which hid how bad it looks. Under the amended 1:1 rule this is
plainly defective, so each image is now capped at its own pixel width and centred, which makes a
narrow figure read as deliberate rather than stranded. Nothing is upscaled any more; verified
caps of 443px, 526px, 768px, 818px, 1026px, 1198px and 1920px on real posts.

**Author photos: verified, all correct.** Parsed the author block from all 62 reference post
pages and compared name and portrait against ours.

| Check | Result |
|---|---|
| Portrait matches the reference | **48 of 48**, zero mismatches |
| Author name matches | 60 of 61 (the one "mismatch" is `&amp;` against `&`, correctly decoded) |
| Portraits never confirmed by any reference page | **0** |
| Posts where the reference shows no portrait | 14, and we show none either |

So nothing was invented and nothing is attached to the wrong person.

### English versions of posts

`docs/i18n.md` settles on Payload field-level localisation for CMS content, and that is still
the right long-term answer. **Turning it on for the existing table is what does not work here.**
Adding `localized: true` moves every localised column into a `_locales` table, and the dev-mode
schema push asks for confirmation before a destructive change. With no TTY it hangs: it did,
twice, for ten minutes each time. Reverted with **zero data loss** (62 posts, 230 media verified
intact afterwards, against a 1.9MB backup taken first). Doing it properly needs a written
migration and a maintenance window, not a dev push.

The same outcome without schema surgery: a **`post-translations` collection**, one document per
post. An editor opens "Tłumaczenia wpisów", picks a post, writes the English version, and flips
it from "Szkic" to "Gotowe". No developer involved.

**The fallback rule is now enforced rather than described.** Previously `/en/blog/<slug>` served
Polish prose under an English URL, which the doc explicitly rules out and which the canonical
tags were only papering over. Now:

- a post with no published translation **404s** in English
- the English listing shows only translated posts, so no Polish cards appear on it
- `generateStaticParams` prerenders an English URL only where a translation exists
- "published" also requires a body, so a translation with just a title cannot go live as an
  empty article

Verified: `/en/blog` lists 1 post, `/en/blog/czy-to-na-pewno-rwa-kulszowa` renders its English
title, `/en/blog/trzy-oblicza-bolu` returns 404, and Polish is untouched at 62 posts.

**One post is fully translated as a worked example** (`scripts/seed-translation-example.ts`), so
the panel shows an editor what a finished one looks like. **The other 61 article bodies are
deliberately left alone.** Machine-translating roughly 100,000 words of physiotherapy advice
that nobody would review is not something to ship quietly, and an untranslated post is a
supported state here rather than a bug. Happy to translate any batch on request.

### Every Lighthouse category at 100 (2026-07-27)

Second pass, closing each item the first pass had listed as outstanding.

| | `/` | `/blog` | Post page |
|---|---|---|---|
| Performance | **100** | **100** | **100** |
| Accessibility | **100** | **100** | **100** |
| Best practices | **100** | **100** | **100** |
| SEO | **100** | **100** | **100** |
| LCP | 0.7s | 0.6s | 0.8s |
| CLS / TBT | 0 / 0ms | 0 / 0ms | 0 / 0ms |
| Server response | 0ms | 10ms | 10ms |

Accessibility was 96 and 94; the three findings behind that are all closed.

**Green darkened, and this one is a palette deviation.** `#2c8657` measured **4.21** against the
cream button text where WCAG AA wants 4.5 at 14px. It is now `#28794f`, which measures **4.97**.
The palette is normally the client's and stays as the reference has it; this is the single value
that failed an accessibility floor, and the shift is small enough to be imperceptible beside the
original. Logged in the deviations table.

**Heading levels are re-based at render time, and not one word of copy changed.** Some imported
articles open at `h3` with no `h2` above them, which leaves a hole in the outline a screen
reader reads out. `PostBody` now renders an article's own top heading level as `h2` and shifts
everything below it by the same amount, so the author's relative structure survives intact.
Verified on `trzy-oblicza-bolu`, whose three `h3` now render as three `h2`.

The converter is built per article rather than at module scope, because it counts levels as it
goes and a shared counter would leak one post's structure into the next.

**The SVG logos carry `width` and `height`.** Only the aspect ratio; the CSS classes still
decide the rendered size.

**`/blog` is static at last.** It was the one blog page still answering `no-store`, because a
route that reads `searchParams` cannot be prerendered. Pagination moved from `?page=N` into
`/blog/strona/N`: page one is `/blog`, page two onwards is a prerendered route, `strona/1` and
anything past the end return 404 rather than serving a duplicate or an empty indexable page.
Verified: `/blog` 10 post links, `strona/2` 19, `strona/7` all 62, `strona/8` 404, and the whole
chain now answers `s-maxage=3600, stale-while-revalidate`.

`BLOG_PAGE_SIZE` lives in `src/lib/blog-page-size.ts`, a module with no imports, because
`BlogList` is a Client Component and taking the constant from `blog-listing.ts` would drag
Payload into the browser bundle.

### What is left, and why it stays

- **"Avoid multiple page redirects", 170ms.** Still not reproducible. Four header variants and
  two never-requested paths answer 200 directly, and `proxy.ts` issues no redirect for public
  paths. Treated as an artefact of Lighthouse's own navigation.
- **13KiB of "legacy JavaScript" and 27KiB unused, in one chunk.** Checked: it is a Turbopack
  chunk carrying Next's runtime, loaded `async`, not a `nomodule` polyfill bundle. The
  polyfills Lighthouse names (`Array.prototype.at`, `Object.hasOwn`) are the framework's own.
  Not reachable without leaving Next's defaults.
- **Three portrait thumbnails "improperly sized".** They are tall images in a 16:9 box under
  `object-cover`, so the crop discards pixels that were still downloaded. `sizes` cannot
  express a crop; the only fix is cropping the stored variants, which is a decision about the
  client's photographs rather than a technical one.

### Lighthouse, and a correction: nothing was static (2026-07-27)

**Correction first.** An earlier entry claimed the build went from 67 to 199 prerendered pages.
That was wrong. `Generating static pages (199/199)` counts pages Next *processes* during a
build, not pages it serves statically. The route table told the truth and I had not read it:
**every route was `f`**, dynamic, and `.next/prerender-manifest.json` listed five entries, none
of them a page. Every response carried `Cache-Control: private, no-cache, no-store`.

The cause is documented inside next-intl's own error text: *"Usage of next-intl APIs in Server
Components currently opts into dynamic rendering ... you can use the `setRequestLocale` API to
enable static rendering."* Reading a translation on the server marked each route dynamic.
`setRequestLocale(locale)` now runs in the locale layout and in all 29 pages.

| | Before | After |
|---|---|---|
| Prerendered routes | **0** | all but two |
| Post page `Cache-Control` | `no-store` | `s-maxage=3600, stale-while-revalidate` |
| Static page `Cache-Control` | `no-store` | `s-maxage=31536000` |
| Post TTFB, warm | 60-70ms | **6-13ms** |
| Lighthouse performance | 99 | **100** |

`/blog` and `[...rest]` stay dynamic: the listing reads `?page`, and the catch-all only calls
`notFound()`. Moving pagination into a path segment would make the listing static too, which is
the obvious next step if it ever matters.

**`localeDetection` is off.** A browser asking for English got a **307 to `/en/...`** on its
first visit to any page, which Lighthouse costed at 175ms and which sent people into the tree
whose 62 articles are still Polish. The EN toggle still works, and the canonicals already
pointed at the Polish URL for the same reason.

**Card images are now `alt=""`.** Lighthouse flagged "alt attributes that are redundant text":
on a card the heading beside the image already names the article, so an alt repeating it makes a
screen reader say the same thing twice. In-article images keep their descriptions.

### Lighthouse scores

| | `/blog` | Post page |
|---|---|---|
| Performance | **100** | **100** |
| Accessibility | 96 | 94 |
| Best practices | 100 | 100 |
| SEO | **100** | **100** |
| FCP / LCP | 0.4s / 0.8s | 0.3s / 0.7s |
| TBT / CLS | 0ms / **0** | 0ms / **0** |
| Server response | 180ms | **10ms** |

### What Lighthouse still flags, and why it is left

- **Contrast 4.21 on the green Akademia button** (`#f9f7f0` on `#2c8657`; AA wants 4.5 at 14px).
  A real WCAG AA failure, but the remedy is a palette change and the palette is the client's.
  `#28794f` measures 4.97 and is a barely perceptible darkening. **Needs a decision.**
- **Heading order: an `<h3>` with no `<h2>` above it.** That is the imported article's own
  structure, and post copy is not ours to edit.
- **"Avoid multiple page redirects", 170ms.** Not reproducible: four header variants and two
  cold paths all answer 200 directly, and `src/proxy.ts` issues no redirect for public paths.
  Recorded as an artefact of Lighthouse's own navigation rather than chased further.
- Unused and legacy JavaScript, 13-27KiB in one Next chunk; unsized SVG logos; three portrait
  thumbnails served slightly larger than their rendered box. All small, all framework or asset
  territory.

### The blog audit against the live site, and the 188KB nobody had noticed (2026-07-27)

Weighed both sites with the same tool, the same `Accept` header, and the same srcset selection
rule, so neither is charged for candidates it merely offers.

| | Ours before | Ours after | Live reference |
|---|---|---|---|
| `/blog` document | 362.8 KB | **169.8 KB** | 1659.5 KB |
| `/blog` page weight | 754.9 KB | **561.9 KB** | 3605.6 KB (capped at 40 images; it renders 63) |
| Post document | 305.5 KB | **112.4 KB** | 159.7 KB |
| Post page weight | 375.9 KB | **182.8 KB** | 230.4 KB |
| Image format served | AVIF | AVIF | WebP, 2 JPEG |

**The audit found one thing that was worse than the reference, and it was ours.** Our post
document was 305 KB against their 160 KB. `getMessages()` returns all 46 namespaces, about
188 KB, and handing that whole object to `NextIntlClientProvider` shipped every word of every
page to every visitor. A post page carried the newsletter status copy, the blog filter labels
and the trainer biographies, none of which it renders.

Only **11 of 46** namespaces are read inside a `"use client"` file, and those total **7.1 KB**.
Server components use `getTranslations`, which resolves server-side and sends nothing. So 96%
of that payload was dead weight, on every page of the site rather than just the blog.

`src/i18n/client-namespaces.ts` holds the list and `pnpm check:messages` fails the build if a
client component starts reading a namespace nobody added, which would otherwise render as a
key path in a rarely visited component.

**Image formats:** every one of the 998 files in `media/` is WebP, no exceptions, averaging
47 KB; the 230 originals average 73 KB with only 8 above 250 KB. What reaches a browser is
AVIF, since `next/image` re-encodes on the way out. The reference serves WebP with a couple of
JPEGs left over.

TTFB is not a fair comparison, ours is localhost against their public host, but for the record:
a static post page answers in **~60ms**, the listing and archives in ~150ms.

### A fourth field the import got from the wrong place (2026-07-27)

`scripts/content-health.ts` was written to list editorial work, and the first thing it found
was not editorial: **two posts had no category at all**, one of them
`testy-w-sporcie-twoja-mapa-w-drodze-na-szczyt`, the newest post and the one the listing
features.

The reference has categories for all 62, in the same `filter` field on the same listing
metadata that supplied the thumbnails, excerpts and dates. Compared all 62 against it: **60
matched exactly, 2 were empty.** So this is the same root cause as the earlier three fields,
just narrower, and `fix-blog-from-reference.ts` now repairs categories too.

The consequences were not cosmetic. With no category a post appears in no archive, emits no
`article:section`, and shows no category link, so the newest article was absent from the
cluster it belongs to. After the fix: Trening 52 posts, Fizjoterapia 44, Masaż 4, Dietetyka 4,
and the featured post carries `article:section` and links to its archive.

Category names are mapped from the reference's own opaque filter ids, which are hard-coded in
the script rather than derived, because they are hashes in a mirrored page.

### The two editorial gaps, as far as code can honestly take them (2026-07-27)

Both items previously listed as "left for a human". Post copy was not touched.

**Alt text.** Checked the mirror first, and **all 572 content images on the reference carry no
`alt` attribute at all**, so there was nothing to import and no description to copy. Our
fallback of "the post's title" therefore already beat the reference, but it meant up to six
images in one article announced the same sentence, which for a screen-reader user is worse
than useless because it cannot tell them apart.

`scripts/fix-image-alt-text.ts` sets the alt to `"<post title>: <nearest heading above the
image>"`. Every word is the client's own copy, taken from the article the image sits in, and
it does what an alt is for here: it locates the picture. **102 of 150** in-article images now
name their section. The other 48 sit above the first heading, so there is no section to name
and they keep the title.

Two things the first run taught, both fixed: several of these "headings" are whole sentences,
so the result is clipped at a word boundary to stay near the 125 characters screen readers and
search engines expect; and most titles end in a full stop while some end in a question mark,
so a blind `": "` produced `"...ostateczność?: Ponieważ"`. Result: median alt 41 characters,
longest 129, no punctuation collisions.

Thumbnails keep the article title, which is correct rather than lazy: a card's subject *is*
the article.

**Subheadings cannot be fixed by code.** Inserting `h2`s means writing in someone else's
article. Instead `scripts/content-health.ts` turns "somebody should look at the posts" into a
worklist: the 15 posts with no subheading, longest first, so the worst offender
(`anatomia-i-funkcja-miesnia-czworoglowego-uda`, 2765 words with no structure at all) is at
the top. It also reports the 48 images that still need eyes, and separates them from the 58
thumbnails where the title is the right answer, so it does not invent a gap.

It found one thing nobody had noticed: **two posts have no category**, including
`testy-w-sporcie-twoja-mapa-w-drodze-na-szczyt`, which is the newest post and the one the
listing features. No category means no archive lists it and no `article:section` is emitted.
A ten-second fix in the panel, on a real gap.

### SEO hardening, production ready (2026-07-27)

Everything proposed after the first SEO pass, less one item that turned out to be moot.

| Change | Effect |
|---|---|
| **Static generation for post pages and archives** | `generateStaticParams` for both locales plus `revalidate = 3600`. **The "199 prerendered pages" claimed here originally was wrong**; see the correction below, nothing was actually static until `setRequestLocale` landed. Measured on a production server: a warm post page answers in **~90ms**, an archive in 160ms, the listing in 140ms. Each of those used to open a database connection per request for an article that changes a few times a year |
| **Blur placeholders** | The reference paints a base64 LQIP as the `background-image` of every `<picture>`. `scripts/import-blur-placeholders.ts` harvests them from the mirror and stores them on Media as `blurDataURL`, so `next/image` gets `placeholder="blur"` without us generating anything. **189 of 230** media rows covered; the rest are pre-existing site imagery the mirror has no placeholder for |
| **`/en` duplicate content, properly closed** | Removing the `hreflang` pair was not enough: `/en/blog/<slug>` still self-canonicalised while serving Polish. `singleLanguage` now also points the canonical at the default locale, consolidating the signals on one URL |
| **Sitemap told the truth about freshness** | All 27 static routes reported `lastmod` as the current request time. They now use the route file's own mtime, and posts keep `updatedAt`. Distinct `lastmod` values went from 3 to 88. Posts also stopped advertising an English alternate, which was the same mistake the meta tags had |
| **`og:image:width` and `og:image:height`** | Declared, so social platforms do not have to fetch the file to lay out a card |
| **Category archives** | `/blog/kategoria/{fizjoterapia,trening,masaz,dietetyka}`, statically generated, in the sitemap, each with `BreadcrumbList`. **An addition:** the reference filters categories client-side only, so 43 physiotherapy articles were invisible as a group |
| **Internal links on the same subject** | `BlogTeasers` puts three recent posts from a matching category at the foot of `/fizjoterapia`, `/trening-personalny`, `/trening-grupowy`, `/dietetyka` and `/bodylab`. Post pages link their categories to the archives, so no archive is an orphan. **Also an addition:** nothing on the reference links a service page to an article |

**One proposal was dropped as unnecessary, having been measured.** Regenerating the `card`
variant at 960px for retina cards would change nothing: the listing sources its cards from
the `hero` variant (1920px), so with the corrected `sizes` a 2x screen already receives a
1080px image for a 480px slot. Re-processing 230 media rows would have bought no pixels.

**Left for a human, unchanged:** 15 of the 62 posts have no subheadings, and every image's alt
text is its post's title. Both are editorial, and post copy is not ours to edit.

### SEO: what was missing, and what was added (2026-07-27)

An audit of the finished blog found the metadata layer solid (per-page titles, canonicals,
Open Graph, Twitter cards, an 89-URL sitemap, robots) and four real gaps behind it.

| Gap | Fixed by |
|---|---|
| **A crawler saw 10 of 62 posts.** The rendering window put nine cards in the HTML and there was no link to the rest, so 52 post URLs appeared nowhere on the site | `/blog?page=N` renders `N x 9` cards. "Pokaż więcej" is now a real `<a href="?page=N+1">` that `preventDefault`s when JavaScript runs, so a crawler and a reader without JS both reach everything. Verified: `?page=7` carries all 62 links |
| **No structured data anywhere.** Not one `application/ld+json` on the site | `src/lib/structured-data.ts`. `HealthAndBeautyBusiness` sitewide (address, phone, opening hours, all mirroring the footer's own strings), plus `BlogPosting` and `BreadcrumbList` per post |
| **`hreflang="en"` over Polish text**, on all 62 posts, promising a translation that does not exist and leaving the two URLs competing | `singleLanguage` on `pageMetadata` drops the `alternates.languages` pair for posts. The canonical stays |
| **`/blog` had no description of its own**, falling through to the layout's site-wide one, so it described the centre rather than the blog | Its own `metaDescription` string |

Also added: `article:modified_time` and `article:section` (the category was already in the
database, just never emitted), an RSS feed at `/feed.xml` with a discovery `<link>` on every
page, and a "Przeczytaj również" block of three posts sharing a category.

**The related-posts block is an addition, not a reproduction.** The reference has nothing of
the kind, but nothing on the site linked one article to another, and internal links between
related pages are among the cheapest ranking signals there are.

**Where the feed link is declared matters.** A page's `generateMetadata` **replaces** the
layout's whole `alternates` object rather than merging into it, so a feed declared in the
layout disappeared from every route that sets a canonical, which is all of them. It lives in
`pageMetadata` instead.

**Left for a human, not code:** 15 of the 62 posts have no subheadings at all (38 do, and no
post duplicates its `h1`, so the hierarchy is sound where it exists), and every image's alt
text is its post's title, which is honest but adds nothing per image. Category archive pages
were raised and not built: they would be indexable topical clusters, but the reference has
none, so that is the client's call.

### Image delivery: what actually cost bytes (2026-07-27)

The stored files were not the problem: uploads are already capped at a 2560px long edge and
converted to WebP, and four sized variants are generated per image. What was wrong was the
**`sizes` hint**, which decides the width Next actually serves.

The grid cards said `33vw`. The grid is capped at 1440px, so above that a card is a fixed
**480px**, not 33vw, at a 1920 viewport `33vw` claims 634px, and on a 2x display Next
therefore reached for its 1920 candidate. Measured on one photo: **270KB a card** where the
honest slot needs 99KB.

Three changes, all measured:

| Change | Effect |
|---|---|
| `sizes="(min-width: 1440px) 480px, …"` on grid cards, and `1024px` for the three-up breakpoint (it said 1060, but the grid goes three-up at `lg`) | Next picks the 1080 candidate instead of 1920 |
| `formats: ["image/avif", "image/webp"]` in `next.config.ts` | Every response had been WebP even when the browser advertised AVIF. AVIF is 12-16% smaller here; WebP-only browsers still get WebP: verified |
| Author portraits ask for `thumbnail` (400px), not `card` (768px) | A 10rem slot needs 320px at 2x |

**First screen of `/blog`, ten images, at 2x: 518KB → 208KB (−59%).**

Also: in-article images now take `hero` (1920) as their source rather than `content` (1200).
The body went full width, so its images occupy up to 1376 CSS px and a 1200px source was
being stretched. This costs no transfer: `sizes` decides the served width, not the source,
it only stops the optimizer working from too small a picture.

**Still on the table:** 46MB across 998 files on disk. That is four variants plus a capped
original per image and is largely inherent; getting it down means narrower `imageSizes` and
regenerating all 230 media rows, which is a separate operation. `next/image` was never
serving those full files to anyone.

### The blog import took three fields from the wrong place (found 2026-07-27)

`import-blog.ts` read the thumbnail, the blurb and the date out of each **article body**. On
the reference those are separate fields on the listing, and they need not appear in the
article at all. Measured damage, before the fix:

| Field | State | Why |
|---|---|---|
| `featuredImage` | **0 of 62 correct** | Each post showed whatever picture came first in its text. The client spotted this: *"losowo powstawiałeś zdjęcia, które nie są thumbnailami"* |
| `excerpt` | **51 of 62 wrong, 48 cut mid-sentence** | The body's opening paragraph truncated to a character budget, instead of the real blurb |
| `publishedAt` | 1 wrong, and it mattered | The one post the reference leaves undated got the date the import ran, so it sorted **above** the genuinely newest post and the listing looked unordered |

The authoritative source turned out to be the listing page itself: every card carries an
escaped-JSON `data-content` attribute holding `images1[0]` (the thumbnail), plus
`short_description`, `date_published` and `time`. `scripts/fix-blog-from-reference.ts` reads
it and repairs all three; it is idempotent, and a second run reports nothing to do.

Two things worth knowing about that data:

- **The reference ships one slug twice** (`odpoczynek-i-sen-utracona-sztuka-zycia`, dated
  2017-02-06 and 2016-12-11, with different thumbnails). The script keeps the newer, which is
  the one the reference's own ordering shows first.
- **Two thumbnails exist only as WebP** even though the metadata names a `.jpg`, so the
  script falls back through sibling extensions.

The pictures the import wrongly promoted are real in-content images, they stay in Media and
still render inside the articles. Only the pointer moved.

### The newsletter, and the one place its copy had to change

The reference posts to `/api/newsletter/subscribe.php` and immediately says "you've been
added". Ours does a **double opt-in** instead: `POST /api/newsletter` stores the address as
`pending` and mails a confirmation link; clicking it is what writes `confirmedAt`, and that
timestamp, with the token and the IP, is the RODO consent record. Single opt-in would let
anyone subscribe anyone, with nothing to show if challenged.

That forces one copy change, listed in the deviations table below: the old success message
("Zostałeś pomyślnie dodany do naszego newslettera") would now be a lie, because at that
moment nothing has been added. It says "check your inbox" instead.

**Still worth a decision from the client:** the consent line under the form reads
*"równoznaczne z akceptacją regulaminu"* and links to `/regulamin`. Consent to have an email
address processed belongs in the **privacy policy**, not the terms. Left as the reference has
it, because fixing it properly means changing the wording, not just the link target, and
copy is the client's call.

Unsubscribe deliberately splits GET from POST: the link in an email only *asks*, and a button
on `/newsletter` does the removing. Mail clients and corporate link scanners prefetch URLs,
so a one-click GET quietly unsubscribes people who never clicked.

### Deliberate deviations from the reference

Recorded per the amended 1:1 rule in `CLAUDE.md`: the reference is reproduced except
where it is plainly defective. Content is still verbatim in every case; these are
styling and link-target changes.

| Where | Reference does | We do | Why |
|---|---|---|---|
| `LegalDocument` body | `ho:f7s6`, ~39.5px, its oversized opening-statement size, on every paragraph | `text-body` at 1.7 line-height, measure capped at 42rem | At ~39.5px an 11-section T&C is unreadable and runs to absurd length |
| `LegalDocument` layout | text in the **right** half of a two-column row, left half empty | one left-aligned column per section | The empty half reads as broken, and the right column put the text directly under the fixed promo pills |
| `LegalDocument` section headings | ~68px section size | `menu` size, ~34px | At eleven numbered sections, 68px reads as eleven page titles |
| Gallery buttons (4 places) | link to `/galeria` | link to the Instagram profile (`GALLERY_URL`) | `/galeria` 404s on the live site, is absent from `sitemap.xml` and has no scrape folder: the broken link is upstream |
| MegaMenu "Grafik zajęć" | links to internal `/trening-grupowy/grafik-zajec` | links out to eFitness | That internal page carries no content of its own; the reference's own header dropdown links out |
| Brand green on buttons | `#2c8657` | `#28794f` | The original measured **4.21** contrast against the cream button text where WCAG AA requires 4.5 at 14px. The new value measures 4.97 and is visually near-identical. The only palette value that failed an accessibility floor |
| Newsletter success message | "Zostałeś pomyślnie dodany do naszego newslettera" | "Sprawdź skrzynkę: wysłaliśmy Ci link, który potwierdza zapis" | With double opt-in the old wording is simply untrue at that moment: nothing is added until the link is clicked |
| `/blog` listing dates | featured card prints `29.08.2025` | no date anywhere on the listing | Client's instruction: *"Na stronie /blog nie pisz kurwa daty kiedy to było"*. Reading time and author stay. Dates are untouched on the post pages themselves, which is where the instruction did not reach |
| `/blog` grid edges | vertical lines at the row's left and right edges (its row is full-bleed) | same lines, at the 1440px cap instead of the viewport | Client asked for them back after the first pass dropped them. The grid gets its own wrapper rather than `Container`, so its horizontal padding sits on the cards: otherwise the edge line would be 64px from the text where the interior dividers are 32px |
| `/blog` grid breakpoint | 3 columns from 1060px (`ho:`) | 3 columns from 1024px (`lg:`) | `sm:grid-cols-2` beats `wide:grid-cols-3` above 1060px, so the grid silently stayed at two columns: measured. `lg` orders after `sm`; 36px earlier is invisible |
| Post page: author vs. article | author block and article body **side by side at 50% each** (`ho:w50p` on both) | author block spans the row, article runs full width beneath it | Client's call: *"pod tym autorem ma być treść wpisu rozciągnięty ładnie bo narazie jest rozjebany pół wpis pół autor... a to brzydko jest i tragedia"*. The reference's split leaves the article in a half-width gutter |
| Post page: article measure | ~886px (50% of the row less its padding), centred | **no cap: fills the container (1376px at full width)** | Ours was 672px (`max-w-[42rem]` on `PostBody`), then briefly 960px. Full width is the client's call, made twice: *"treść na blogu nie jest na całą szerokość"*. I flagged that a 1376px measure runs ~180 characters to a line, past what reads comfortably; they want it full width regardless. One class on `PostBody` if it ever needs walking back |
| Post page: categories | not shown | not shown | Unchanged, noted because we used to print them under the title. They still drive the listing filter |
| `/kontakt` content | nothing, its `<main>` holds only the shared footer block; no `<form>`, no map embed | display title + the "Spotkajmy się" invitation | An empty page in the sitemap is a defect. Composed from copy already verified elsewhere (the footer's details, the homepage's invitation): no new copy written |
| Nav "Kontakt" | anchors to the footer (`#kontakt`) | goes to `/kontakt` | A real page nothing links to is worse than the anchor. The in-page "book a session" CTA on `/trening-personalny/trening-w-parze` stays an anchor, it is not a nav entry |

**`/kontakt` deliberately has no address/hours block and no map embed.** The footer sits
directly beneath it with exactly those details, and rendering the same three columns
twice within one scroll read as a rendering bug. A Google Maps iframe was also left out:
it sets third-party cookies and there is no consent mechanism yet: revisit when the
cookies page lands.

**Known trade-off, not a bug:** the fixed promo pills can cover the footer's "Nawiguj"
button at some scroll positions. Inherent to a fixed promo bar: the reference has the
same overlap, and both pills are dismissible.

`StatementSection` also gained `whitespace-pre-line`, which is a bug fix rather than a
deviation, without it the multi-line copy on `/instrukcja`, including its three bullet
lists: collapsed into run-on paragraphs.
| `/instrukcja/`, `/test/`, `/podziekowanie/` | TBD | - | - | - | **Confirm with client first** (PRD §13 Phase 0): may not carry over |

## Out of scope for Centrum migration

| Scraped route | Why it's not a Centrum page |
|---|---|
| `/zakupy/<product>/` × 9 | Maps to the future shop data model (`CourseEditions`/`Products`, PRD §10.2), not a static content page, see `scraped-site-map.md` |
