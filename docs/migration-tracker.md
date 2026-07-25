# Migration tracker — Centrum, scraped mirror → Next.js

> Living checklist, update as you go. Written in English. One row per unique template/page (PRD §6.2 counts ~22 unique Centrum templates) — for full URL-level detail see [`scraped-site-map.md`](./scraped-site-map.md).

## How to use this file

- Update the row **when you touch that page** — don't batch it up for later, it'll drift.
- **Components:** name what was reused from an existing component vs. newly created (new ones should usually be built reusable — see the reuse rule in [`conventions.md`](./conventions.md)).
- **i18n:** `PL` / `EN` status each as `—` (not started), `draft`, or `done`. See [`i18n.md`](./i18n.md) — the scraped source is Polish-only, so EN is always a translation task, not a copy task.
- **Visual QA:** `—` until you've opened the built page next to `localhost:8765/<slug>/` (or the live site) and confirmed layout/copy/imagery match (see `scraped-site-map.md`).
- **Status:** `Not started` → `In progress` → `Built (PL)` → `Bilingual` → `Verified`.

## Homepage

| Scraped route | Target route | Components | i18n | Visual QA | Status |
|---|---|---|---|---|---|
| `/` | `/` (+ `/en`) | Hero (text only), FullBleedVideo (real hero video, now its own section), NewsCarousel, TextMedia ×2 (friendly space, team teaser — real photos), StatementSection ×4 (balanced fitness, movement tool, teach potential, health process), FullBleedImage, ServiceGrid (6 real photo tiles + CTA), TestimonialCarousel (with name attribution), NewsletterSignup (real bg, cream section), PartnerLogos (7 real logos), Header/MobileNav (real logo + icons, scroll-triggered logo/tagline crossfade, Akademia/Kontakt utility bar), Footer | PL: done / EN: done | Verified structurally against the scraped reference's actual HTML/CSS (not just build + dev server render — read `assets/css/auto.css` directly for exact colors/section structure since the header/section shape turned out meaningfully different from the first pass) — **still not checked in an actual browser**, Claude-in-Chrome was unavailable both sessions; do that before calling this row done | In progress |

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
| `/trening-grupowy/plan-zdrowej-zmiany/` | same | Reused: PageHero, CenteredBand, StatementSection ×3, TestimonialCarousel (16 unattributed quotes) | PL: done / EN: done | Same check | Bilingual |
| `/trening-grupowy/medicover/` | same | Reused: PageHero | PL: done / EN: done | Same check | Bilingual |
| `/trening-grupowy/grafik-zajec/` | outbound link only (eFitness) | n/a — confirmed: the scraped page carries no content of its own, only the shared footer, and every nav on the reference links straight to eFitness | n/a | n/a | Not applicable |

## Dietetyka

| Scraped route | Target route | Components | i18n | Visual QA | Status |
|---|---|---|---|---|---|
| `/dietetyka/` | `/dietetyka/` | New: DieteticsNav. Reused: PageHero, StatementSection ×3, two path cards | PL: done / EN: done | Automated two-way check (0 issues) — **not opened in a browser** | Bilingual |
| `/dietetyka/iwona-stachowiak/` | same | Reused: PageHero, TextMedia ×4, Accordion (pricing), TestimonialCarousel (9 quotes) + 4-photo strip | PL: done / **EN: bio still Polish** | Same check | Built (PL) |
| `/dietetyka/magdalena-hajduk-warchol/` | same | Reused: PageHero, StatementSection ×3, TextMedia ×2, Accordion (pricing), TestimonialCarousel (4 quotes) | PL: done / **EN: bio still Polish** | Same check | Built (PL) |

## BodyLab

| Scraped route | Target route | Components | i18n | Visual QA | Status |
|---|---|---|---|---|---|
| `/bodylab/` | `/bodylab/` | New: BodylabNav. Reused: PageHero; 3 alternating tool blocks | PL: done / EN: done | Automated two-way check (0 issues) — **not opened in a browser** | Bilingual |
| `/bodylab/technologia-vald/` | same | Reused: PageHero, StatementSection ×7, Accordion (pricing) | PL: done / EN: done | Same check | Bilingual |
| `/bodylab/analiza-skadu-ciala/` | same — note the slug really is missing the "ł" on the reference (markup + sitemap.xml) | Reused: PageHero, TextMedia ×2 | PL: done / EN: done | Same check | Bilingual |

## Standalone pages

| Scraped route | Target route | Components | i18n | Visual QA | Status |
|---|---|---|---|---|---|
| `/cennik/` | `/cennik/` | Reused: PageHero, Accordion (9 price rows; the component gained `cta`/`note`/`groups` for this page) | PL: done / EN: done | Two-way check plus a dedicated price audit — all 46 distinct figures verified present | Bilingual |
| `/masaz/` | `/masaz/` | — | PL: — / EN: — | — | Not started |
| `/kontakt/` | `/kontakt/` | — | PL: — / EN: — | — | Not started |

## Blog

| Scraped route | Target route | Components | i18n | Visual QA | Status |
|---|---|---|---|---|---|
| `/blog/` (listing) | `/blog/` | — | PL: — / EN: — | — | Not started |
| `/blog/<slug>/` × 62 posts | `/blog/<slug>/` | — | PL: — / EN: — | — | Not started (template-level; once the template ships, per-post content/translation is tracked separately, not row-by-row here) |

## Legal & utility

| Scraped route | Target route | Components | i18n | Visual QA | Status |
|---|---|---|---|---|---|
| `/polityka-prywatnosci/`, `/regulamin/`, `/cookies/` | matching routes | — | PL: — / EN: — | — | Not started |
| `/instrukcja/`, `/test/`, `/podziekowanie/` | TBD | — | — | — | **Confirm with client first** (PRD §13 Phase 0) — may not carry over |

## Out of scope for Centrum migration

| Scraped route | Why it's not a Centrum page |
|---|---|
| `/zakupy/<product>/` × 9 | Maps to the future shop data model (`CourseEditions`/`Products`, PRD §10.2), not a static content page — see `scraped-site-map.md` |
