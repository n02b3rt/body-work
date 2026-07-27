# Migration tracker — Centrum, scraped mirror → Next.js

> Living checklist, update as you go. Written in English. One row per unique template/page (PRD §6.2 counts ~22 unique Centrum templates) — for full URL-level detail see [`scraped-site-map.md`](./scraped-site-map.md).

## How to use this file

- Update the row **when you touch that page** — don't batch it up for later, it'll drift.
- **Components:** name what was reused from an existing component vs. newly created (new ones should usually be built reusable — see the reuse rule in [`conventions.md`](./conventions.md)).
- **i18n:** `PL` / `EN` status each as `—` (not started), `draft`, or `done`. See [`i18n.md`](./i18n.md) — the scraped source is Polish-only, so EN is always a translation task, not a copy task.
- **Visual QA:** `—` until you've opened the built page next to `localhost:8765/<slug>/` (or the live site) and confirmed layout/copy/imagery match (see `scraped-site-map.md`).
- **Status:** `Not started` → `In progress` → `Built (PL)` → `Bilingual` → `Verified`.

## Site-wide check against the live original — 2026-07-26

All 22 built routes were compared **rendered-output to rendered-output**: our SSR HTML from
`localhost:3000` against the live `bodywork.testowe.eu`, matching headings, paragraphs, price
figures and per-page section inventory. This is stronger than the earlier per-section checks,
which compared our *message files* to the scrape and so could not catch a string that exists in
`messages/*.json` but is never rendered — which is exactly the class of bug it found (Iwona's
empty pricing panel). Result: **0 missing headings and 0 missing price figures on every subpage.**

**A real browser pass followed on the same day** — Chrome connected for the first time in this
project. It compared our pages with the live site by reading `getBoundingClientRect` /
`getComputedStyle` on both sides (screenshots are downscaled, so eyeballed positions mislead) and
found four further defects: hub titles were left-aligned where the reference right-aligns them,
the display-heading cap was 282px instead of the real 255px, accordion panel copy didn't line up
under its own row heading, and every price list had lost the reference's blank lines. All fixed
and re-measured against the original — see `AI_NOTES.md`.

Two things it could **not** confirm: the reference's promo pills were already dismissed by cookie
in this browser, so they were compared by spec rather than side by side; and `resize_window` does
nothing while the Chrome window is maximized, so the sub-1060px layout is confirmed from the
compiled CSS only, not from a live narrow render.

What the pass fixed is recorded in `AI_NOTES.md`; the rows below carry the per-page detail.

## Audit against the original — 2026-07-27

URL coverage: **27 of 32** content pages built; **62 of 62** blog posts in the database
(exact match both ways). The 5 unbuilt: `/masaz` and `/cookies` (deferred by the user),
`/test` and `/podziekowanie` (awaiting a client decision on whether they carry over), and
`/trening-grupowy/grafik-zajec` (not applicable — outbound eFitness link). `/zakupy/*`
(10 URLs) stays out of scope as the future shop model.

### Gaps, worst first

All six items were fixed on 2026-07-27. Item 1 was the last, once the user picked the
delivery route: *"ogólnie będziemy robić to przez bramkę resenda"*. **Two manual steps are
still outstanding before newsletter mail physically leaves the building** — verifying
`body-work.pl` in Resend (DKIM + SPF in Cloudflare) and setting `RESEND_API_KEY`. Neither is
a code task; see `docs/stack.md`.

| # | Gap | Why it matters |
|---|---|---|
| 1 | ~~The newsletter form throws the address away~~ — **fixed 2026-07-27.** A `subscribers` collection, a double opt-in through `/api/newsletter`, and Resend as the relay. See the note below | — |
| 2 | ~~Every page has the same `<title>`~~ — **fixed 2026-07-27.** Every route has a `generateMetadata` built from its existing title copy; posts prefer their SEO `meta` fields and fall back to the article title. Verified 12/12 distinct titles across a sample | — |
| 3 | ~~No `sitemap.xml`~~ — **fixed 2026-07-27.** `src/app/sitemap.ts` emits **89 URLs** (27 pages + 62 posts) with `hreflang` pairs for both locales. Static routes are discovered by walking `src/app/[locale]` so the list can't drift; posts come from Payload, and a database outage degrades to the static pages rather than failing the build | — |
| 4 | ~~No `robots.txt`~~ — **fixed 2026-07-27.** Allows everything except `/admin` and `/api/`, and points at the sitemap | — |
| 5 | ~~No Open Graph tags~~ — **fixed 2026-07-27.** Seven `og:*` plus four `twitter:*` tags per page, canonical and `hreflang`. A post with a featured image uses it; the rest fall back to a real brand photo. Posts also carry `og:type=article` and `article:published_time` | — |
| 6 | ~~The 404 page is Next's default~~ — **fixed 2026-07-27.** Branded 404, a `[locale]/error.tsx` boundary and a root `global-error.tsx`. See the note below | — |

### Error pages — how they had to be wired

Three surfaces: `[locale]/not-found.tsx` (404), `[locale]/error.tsx` (render failures, with
a retry button) and `app/global-error.tsx` (a failure in the locale layout itself, so it
brings its own `<html>`, styles and font).

Two things about this app's shape made it harder than it looks, both worth knowing:

1. **An unmatched URL never reached our 404.** With no root layout — `[locale]` and
   `(payload)` deliberately own their own `<html>` — Next resolves an unmatched path
   against the *root* `not-found`, which doesn't exist here, so visitors got the unstyled
   built-in. Fixed with a `[locale]/[...rest]` catch-all that calls `notFound()`, since a
   `notFound()` raised inside the segment *does* resolve to the segment's boundary.
   Next's `global-not-found` would cover this too but is still behind an experimental flag.
2. **`not-found.tsx` has to be a Client Component.** Both `getTranslations()` and
   `getTranslations({ locale: await getLocale() })` throw inside a not-found boundary — the
   request locale is never established for one — and when the file throws, Next silently
   substitutes its own blank 404. That failure is indistinguishable from "the boundary
   isn't wired up", which cost real time to diagnose. `useTranslations` works because the
   locale layout still renders around it. Trade-off: the copy is hydrated rather than
   server-rendered, so the initial HTML is empty. Acceptable — the 404 **status** is what
   crawlers act on, and the page renders fully for every real visitor.

### Checked and *not* a gap

- The reference's post pages have no share buttons, related posts, comments, tags, prev/next navigation or newsletter block — neither do ours. Two earlier "prev/next" and "result count" hits were false positives: ordinary prose (`poprzednich swoich idei`) and a comment inside its filter script.
- The reference's listing has no pagination; it renders every post and filters client-side, as ours does.
- Its "POWRÓT" is a `<button>` firing browser history, not a link. Ours is a real `WRÓĆ NA BLOG` link to `/blog`, which survives deep links and shares — a deliberate improvement, not a divergence.
- All 12 sampled routes resolve under `/en`.

## Homepage

| Scraped route | Target route | Components | i18n | Visual QA | Status |
|---|---|---|---|---|---|
| `/` | `/` (+ `/en`) | Hero (text only), FullBleedVideo (real hero video, now its own section), NewsCarousel, TextMedia ×2 (friendly space, team teaser — real photos), StatementSection ×4 (balanced fitness, movement tool, teach potential, health process), FullBleedImage, ServiceGrid (6 real photo tiles + CTA), TestimonialCarousel (with name attribution), NewsletterSignup (real bg, cream section), PartnerLogos (7 real logos), Header/MobileNav (real logo + icons, scroll-triggered logo/tagline crossfade, Akademia/Kontakt utility bar), Footer, PromoBar | PL: done / EN: done | Verified structurally against the scraped reference's actual HTML/CSS (not just build + dev server render — read `assets/css/auto.css` directly for exact colors/section structure since the header/section shape turned out meaningfully different from the first pass) — **still not checked in an actual browser**, Claude-in-Chrome was unavailable both sessions; do that before calling this row done. 2026-07-26: all 7 testimonial quotes restored **verbatim** (they had been silently tidied up — see AI_NOTES). Remaining unmatched copy here is the News carousel, deliberately deferred until the blog exists | In progress |

## Trening personalny

| Scraped route | Target route | Components | i18n | Visual QA | Status |
|---|---|---|---|---|---|
| `/trening-personalny/` | `/trening-personalny/` | New: SectionNav/PersonalTrainingNav, PageHero, CenteredBand, MediaCardCta. Reused: StatementSection, TextMedia, TestimonialCarousel (generalised to take items as props), NewsletterSignup | PL: done / EN: done | Copy verified verbatim against the scrape both ways (no missing headings, no altered strings) — **not yet opened in a browser** | Bilingual |
| `/trening-personalny/trening-indywidualny/` | same | New: Accordion. Reused: PageHero, CenteredBand, TextMedia, SectionNav | PL: done / EN: done | Same automated two-way check | Bilingual |
| `/trening-personalny/trening-w-parze/` | same | Reused: PageHero, TextMedia, Accordion (subset of the shared items), SectionNav | PL: done / EN: done | Same automated two-way check — this check caught a whole section I'd missed | Bilingual |
| `/trening-personalny/ocena-funkcjonalna/` | same | Reused: PageHero, CenteredBand, StatementSection, SectionNav | PL: done / EN: done | Same automated two-way check | Bilingual |
| `/trening-personalny/trenerzy/` | same | Reused: PageHero, CenteredBand, SectionNav; 3 categories × 18 trainer cards | PL: done / **EN: bios still Polish** (see AI_NOTES) | Same automated two-way check | Built (PL) |

## Fizjoterapia

| Scraped route | Target route | Components | i18n | Visual QA | Status |
|---|---|---|---|---|---|
| `/fizjoterapia/` | `/fizjoterapia/` | New: PhysiotherapyNav. Reused: PageHero, CenteredBand, TextMedia ×4, Accordion (6 equipment items), MediaCardCta ×2, TestimonialCarousel | PL: done / EN: done | Automated two-way check vs. the scrape (0 issues) — **not opened in a browser** | Bilingual |
| `/fizjoterapia/terapia-manualna/` | same | Reused: PageHero, CenteredBand, Accordion (10 conditions) | PL: done / EN: done | Same check — caught a missing contact section | Bilingual |
| `/fizjoterapia/rehabilitacja-ruchowa/` | same | Reused: PageHero, CenteredBand, Accordion (12 conditions) | PL: done / EN: done | Same check | Bilingual |
| `/fizjoterapia/zdrowy-brzuch/` | same | Reused: PageHero; 3 leads + 2 pricing formats | PL: done / EN: done | Same check | Bilingual |
| `/fizjoterapia/specjalisci/` | same | Reused: PageHero, CenteredBand; 2 categories × 11 specialists | PL: done / **EN: bios still Polish** (same reason as the trainers) | Same check | Built (PL) |

## Trening grupowy

| Scraped route | Target route | Components | i18n | Visual QA | Status |
|---|---|---|---|---|---|
| `/trening-grupowy/` | `/trening-grupowy/` | New: GroupTrainingNav. Reused: PageHero, CenteredBand, TextMedia ×2, TestimonialCarousel | PL: done / EN: done | Automated two-way check (0 issues) — **not opened in a browser** | Bilingual |
| `/trening-grupowy/zajecia-grupowe/` | same | Reused: PageHero, CenteredBand, StatementSection ×3, Accordion (13 classes) | PL: done / EN: done | Same check | Bilingual |
| `/trening-grupowy/plan-zdrowej-zmiany/` | same | Reused: PageHero, CenteredBand, StatementSection ×3, TestimonialCarousel (16 unattributed quotes). Title runs on two lines (`titleNote` carries the edition date, as the reference's `<br>` does) | PL: done / EN: done | Same check + live re-verify 2026-07-26 | Bilingual |
| `/trening-grupowy/medicover/` | same | Reused: PageHero | PL: done / EN: done | Same check | Bilingual |
| `/trening-grupowy/grafik-zajec/` | outbound link only (eFitness) | n/a — confirmed: the scraped page carries no content of its own, only the shared footer, and every nav on the reference links straight to eFitness | n/a | n/a | Not applicable |

## Dietetyka

| Scraped route | Target route | Components | i18n | Visual QA | Status |
|---|---|---|---|---|---|
| `/dietetyka/` | `/dietetyka/` | New: DieteticsNav. Reused: PageHero, StatementSection ×3, two path cards | PL: done / EN: done | Automated two-way check (0 issues) — **not opened in a browser** | Bilingual |
| `/dietetyka/iwona-stachowiak/` | same | Reused: PageHero, TextMedia ×4, Accordion (pricing — 6 priced items, **was shipped empty until 2026-07-26**), TestimonialCarousel (9 quotes) + 4-photo strip. No newsletter block (reference has none) | PL: done / **EN: bio still Polish** | Same check + live re-verify 2026-07-26 | Built (PL) |
| `/dietetyka/magdalena-hajduk-warchol/` | same | Reused: PageHero, StatementSection ×3, TextMedia ×2, Accordion (pricing), TestimonialCarousel (4 quotes). No newsletter block (reference has none) | PL: done / **EN: bio still Polish** | Same check + live re-verify 2026-07-26 | Built (PL) |

## BodyLab

| Scraped route | Target route | Components | i18n | Visual QA | Status |
|---|---|---|---|---|---|
| `/bodylab/` | `/bodylab/` | New: BodylabNav. Reused: PageHero; 3 alternating tool blocks | PL: done / EN: done | Automated two-way check (0 issues) — **not opened in a browser** | Bilingual |
| `/bodylab/technologia-vald/` | same | Reused: PageHero, StatementSection ×7, Accordion (pricing). No newsletter block (reference has none) | PL: done / EN: done | Same check + live re-verify 2026-07-26 | Bilingual |
| `/bodylab/analiza-skadu-ciala/` | same — note the slug really is missing the "ł" on the reference (markup + sitemap.xml) | Reused: PageHero, TextMedia ×2. No newsletter block (reference has none) | PL: done / EN: done | Same check + live re-verify 2026-07-26 | Bilingual |

## Standalone pages

| Scraped route | Target route | Components | i18n | Visual QA | Status |
|---|---|---|---|---|---|
| `/cennik/` | `/cennik/` | Reused: PageHero, Accordion (9 price rows; the component gained `cta`/`note`/`groups` and now `panelHeading` for this page). **No newsletter block** — the reference has none here | PL: done / EN: done | Two-way check plus a dedicated price audit — all 46 distinct figures verified present; re-verified against the live site 2026-07-26 | Bilingual |
| `/masaz/` | `/masaz/` | — | PL: — / EN: — | — | Not started |
| `/kontakt/` | `/kontakt/` | Reused: PageHero (display title, **left**-aligned), MeetUsCta. **The reference page has no content of its own** — see the note below | PL: done / EN: done | Composed from copy already verified elsewhere; nothing invented | Bilingual |
| `/instrukcja/` | `/instrukcja/` | New: none. Reused: PageHero, StatementSection ×8 (3 of them a 3-up bullet row), FullBleedImage ×4, CenteredBand, MediaCardCta ×2. 7 images copied. No newsletter block — the reference has none | PL: done / EN: done | Two-way check vs. the live site: 0 missing headings | Bilingual |

## Blog

| Scraped route | Target route | Components | i18n | Visual QA | Status |
|---|---|---|---|---|---|
| `/blog/` (listing) | `/blog/` | New: `BlogList` — the reference's featured card for the newest post (half-width photo, oversized title, lead, PRZECZYTAJ), then a 3-column grid with its border dividers, reading time and author. Rectangular category select with the reference's own painted chevron, search field filling the row, SZUKAJ button. Reused: PageHero | PL: done / EN: done | Measured in a browser: 3 equal 479px columns with edge borders, divider dropped on every 3rd card, featured photo fills the row, search/category/empty-state/reset all correct, no horizontal overflow. Rendering window verified with real scroll input: 9 → 27 → 61 cards, window resets to 9 on filter, counter and button disappear when exhausted. **Mobile not verified in a browser** — the extension would not resize the viewport | Bilingual |
| `/blog/<slug>/` × 62 posts | `/blog/<slug>/` | Rebuilt 2026-07-27 in the reference's order: title (half width, so 68px type still wraps), rule, date + reading time, rule, author block (10rem round portrait, AUTOR:, name, role), then the article. Lexical body via `RichText`; `.blog-prose` in globals.css carries the article typography | PL: done / EN: UI strings done, **post content is Polish** (62 articles — a translation job for a human, not a machine) | Checked in a real browser: 62 cards, filter (Fizjoterapia 43 / Trening 50 / Dietetyka 4 / Masaż 4) and search both work, empty state matches the reference wording. Six post pages sampled — bodies, inline images and author blocks all render, no failed image loads, no dashboard-host URLs. 0 empty bodies, 0 posts missing an author/date/reading time, 0 CSS leaks | Bilingual |

**No hero image and no lead paragraph on a post page — both were duplicates.**
`featuredImage` is the post's *first body image*, kept for the listing card; rendering it
as a hero showed the same picture twice, full-bleed and again a few lines into the
article. `excerpt` is likewise the article's own opening paragraph, so printing it above
the body repeated that paragraph in oversized type. The reference has neither element.

### Blog — what the reference actually has (verified 2026-07-27)

| Thing | Finding |
|---|---|
| Posts | 62. One (`operacja-koniecznosc-czy-ostatecznosc`) had failed the original scrape with a `ConnectionError` and was re-fetched by hand |
| Images | **56 of 62 posts carry content images; 6 have none at all.** An earlier count of "60 of 61, 194 images" was wrong — it counted the author portrait as a content image. 168 media files were imported in total (post images + 18 author portraits) |
| Categories | Exactly four: Fizjoterapia, Masaż, Trening, Dietetyka. Posts can carry several (35 posts carry two); 2 posts are uncategorised |
| Authors | **24 distinct names**, of which only **18 have a portrait** in the source. They are trainers/physiotherapists, not CMS users — hence the `Authors` collection rather than a `users` relationship. Two credits don't split cleanly in the source: one is a joint "Karol Kikut & Jakub Grzęda", another runs the name into a sentence; the importer cuts the name at the first comma, which handles both |
| Card meta | date · reading time ("10 min") · author name |
| Body markup | A small, clean vocabulary: `p`, `h2`, `h3`, `strong`, `em`, `ol`/`li`, `img`, `a` — plus exactly one `blockquote` and one `table` in the whole corpus |
| Pagination | None found. The listing renders every post and filters client-side |
| Uncategorised | 2 posts carry no category on the reference, and none here either |

## Legal & utility

| Scraped route | Target route | Components | i18n | Visual QA | Status |
|---|---|---|---|---|---|
| `/regulamin/` | `/regulamin/` | New: `LegalDocument`. Reused: PageHero. 11 sections (§ I–XI), no imagery, no newsletter | PL: done / **EN: text stays Polish** — see below | Two-way check vs. the live site: 0 missing headings | Built (PL) |
| `/polityka-prywatnosci/` | `/polityka-prywatnosci/` | Reused: PageHero, `LegalDocument`. 12 sections (I–XII) | PL: done / **EN: text stays Polish** — see below | Same check: 0 missing headings | Built (PL) |
| `/cookies/` | `/cookies/` | — | PL: — / EN: — | — | Not started |

**The two legal documents are deliberately not translated.** `en.json` carries the Polish
text for `Terms` and `Privacy`. A mistranslated T&C or privacy policy is legal exposure,
not a copy nit — these need a professional/legal pass before an English version ships.
Same precedent as the trainer and specialist biographies.

### Why the listing renders a window of cards (2026-07-27)

All 62 posts stay in memory — filtering and search run over the whole set client-side, as on
the reference, and fetching in batches would mean a round trip per keystroke — but only 9 are
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

**The images were never the problem** — `next/image` already defers them, and only one of 62
had loaded. The cost was the markup and the DOM: 62 cards, each carrying two inline SVG
icons. The document only shrank 13% because the post *data* still ships for client-side
filtering; that is the deliberate trade.

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

The pictures the import wrongly promoted are real in-content images — they stay in Media and
still render inside the articles. Only the pointer moved.

### The newsletter, and the one place its copy had to change

The reference posts to `/api/newsletter/subscribe.php` and immediately says "you've been
added". Ours does a **double opt-in** instead: `POST /api/newsletter` stores the address as
`pending` and mails a confirmation link; clicking it is what writes `confirmedAt`, and that
timestamp — with the token and the IP — is the RODO consent record. Single opt-in would let
anyone subscribe anyone, with nothing to show if challenged.

That forces one copy change, listed in the deviations table below: the old success message
("Zostałeś pomyślnie dodany do naszego newslettera") would now be a lie, because at that
moment nothing has been added. It says "check your inbox" instead.

**Still worth a decision from the client:** the consent line under the form reads
*"równoznaczne z akceptacją regulaminu"* and links to `/regulamin`. Consent to have an email
address processed belongs in the **privacy policy**, not the terms. Left as the reference has
it, because fixing it properly means changing the wording, not just the link target — and
copy is the client's call.

Unsubscribe deliberately splits GET from POST: the link in an email only *asks*, and a button
on `/newsletter` does the removing. Mail clients and corporate link scanners prefetch URLs,
so a one-click GET quietly unsubscribes people who never clicked.

### Deliberate deviations from the reference

Recorded per the amended 1:1 rule in `CLAUDE.md` — the reference is reproduced except
where it is plainly defective. Content is still verbatim in every case; these are
styling and link-target changes.

| Where | Reference does | We do | Why |
|---|---|---|---|
| `LegalDocument` body | `ho:f7s6`, ~39.5px, its oversized opening-statement size, on every paragraph | `text-body` at 1.7 line-height, measure capped at 42rem | At ~39.5px an 11-section T&C is unreadable and runs to absurd length |
| `LegalDocument` layout | text in the **right** half of a two-column row, left half empty | one left-aligned column per section | The empty half reads as broken, and the right column put the text directly under the fixed promo pills |
| `LegalDocument` section headings | ~68px section size | `menu` size, ~34px | At eleven numbered sections, 68px reads as eleven page titles |
| Gallery buttons (4 places) | link to `/galeria` | link to the Instagram profile (`GALLERY_URL`) | `/galeria` 404s on the live site, is absent from `sitemap.xml` and has no scrape folder — the broken link is upstream |
| MegaMenu "Grafik zajęć" | links to internal `/trening-grupowy/grafik-zajec` | links out to eFitness | That internal page carries no content of its own; the reference's own header dropdown links out |
| Newsletter success message | "Zostałeś pomyślnie dodany do naszego newslettera" | "Sprawdź skrzynkę — wysłaliśmy Ci link, który potwierdza zapis" | With double opt-in the old wording is simply untrue at that moment: nothing is added until the link is clicked |
| `/blog` listing dates | featured card prints `29.08.2025` | no date anywhere on the listing | Client's instruction: *"Na stronie /blog nie pisz kurwa daty kiedy to było"*. Reading time and author stay. Dates are untouched on the post pages themselves, which is where the instruction did not reach |
| `/blog` grid edges | vertical lines at the row's left and right edges (its row is full-bleed) | same lines, at the 1440px cap instead of the viewport | Client asked for them back after the first pass dropped them. The grid gets its own wrapper rather than `Container`, so its horizontal padding sits on the cards — otherwise the edge line would be 64px from the text where the interior dividers are 32px |
| `/blog` grid breakpoint | 3 columns from 1060px (`ho:`) | 3 columns from 1024px (`lg:`) | `sm:grid-cols-2` beats `wide:grid-cols-3` above 1060px, so the grid silently stayed at two columns — measured. `lg` orders after `sm`; 36px earlier is invisible |
| Post page: author vs. article | author block and article body **side by side at 50% each** (`ho:w50p` on both) | author block spans the row, article runs full width beneath it | Client's call: *"pod tym autorem ma być treść wpisu rozciągnięty ładnie bo narazie jest rozjebany pół wpis pół autor... a to brzydko jest i tragedia"*. The reference's split leaves the article in a half-width gutter |
| Post page: article measure | ~886px (50% of the row less its padding), centred | **no cap — fills the container (1376px at full width)** | Ours was 672px (`max-w-[42rem]` on `PostBody`), then briefly 960px. Full width is the client's call, made twice: *"treść na blogu nie jest na całą szerokość"*. I flagged that a 1376px measure runs ~180 characters to a line, past what reads comfortably; they want it full width regardless. One class on `PostBody` if it ever needs walking back |
| Post page: categories | not shown | not shown | Unchanged, noted because we used to print them under the title. They still drive the listing filter |
| `/kontakt` content | nothing — its `<main>` holds only the shared footer block; no `<form>`, no map embed | display title + the "Spotkajmy się" invitation | An empty page in the sitemap is a defect. Composed from copy already verified elsewhere (the footer's details, the homepage's invitation) — no new copy written |
| Nav "Kontakt" | anchors to the footer (`#kontakt`) | goes to `/kontakt` | A real page nothing links to is worse than the anchor. The in-page "book a session" CTA on `/trening-personalny/trening-w-parze` stays an anchor — it is not a nav entry |

**`/kontakt` deliberately has no address/hours block and no map embed.** The footer sits
directly beneath it with exactly those details, and rendering the same three columns
twice within one scroll read as a rendering bug. A Google Maps iframe was also left out:
it sets third-party cookies and there is no consent mechanism yet — revisit when the
cookies page lands.

**Known trade-off, not a bug:** the fixed promo pills can cover the footer's "Nawiguj"
button at some scroll positions. Inherent to a fixed promo bar — the reference has the
same overlap — and both pills are dismissible.

`StatementSection` also gained `whitespace-pre-line`, which is a bug fix rather than a
deviation: without it the multi-line copy on `/instrukcja` — including its three bullet
lists — collapsed into run-on paragraphs.
| `/instrukcja/`, `/test/`, `/podziekowanie/` | TBD | — | — | — | **Confirm with client first** (PRD §13 Phase 0) — may not carry over |

## Out of scope for Centrum migration

| Scraped route | Why it's not a Centrum page |
|---|---|
| `/zakupy/<product>/` × 9 | Maps to the future shop data model (`CourseEditions`/`Products`, PRD §10.2), not a static content page — see `scraped-site-map.md` |
