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
| `/blog/` (listing) | `/blog/` | New: `BlogList` (category select + search + empty state, filtered client-side as on the reference). Reused: PageHero | PL: done / EN: done | 62 cards render from the database; no dashboard-host URLs leak into the page | Bilingual |
| `/blog/<slug>/` × 62 posts | `/blog/<slug>/` | Template built: meta line, hero, Lexical body via `RichText`, author block, back link. `.blog-prose` in globals.css carries the article typography | PL: done / EN: UI strings done, **post content is Polish** (62 articles — a translation job for a human, not a machine) | All 62 imported and rendering: body, inline images, author block. Verified 0 empty bodies, 0 posts without an author/date/reading time, 0 CSS leaks | Built (PL) |

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
