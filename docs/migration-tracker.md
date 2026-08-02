> Read when: asking whether a page is built, bilingual or visually verified, or logging a deliberate deviation from the reference.

# Migration tracker: Centrum, scraped mirror → Next.js

One row per route. URL-level detail: [`scraped-site-map.md`](./scraped-site-map.md).
The dated audits, measurements and per-page investigations that produced these statuses live in
[`archive/migration-audits-2026-07.md`](./archive/migration-audits-2026-07.md): history, not working context.

**Update the row when you touch the page.** Don't batch it; it drifts.

- **Status:** `Not started` → `In progress` → `Built (PL)` → `Bilingual` → `Verified`
- **QA:** `HTML` = rendered-output compared two ways against the scrape · `live` = re-checked against
  the live site · `browser` = opened in a real browser and measured · `browser ✗` = never opened in one
- **Coverage (2026-07-27):** 28 of 32 content pages built, 62 of 62 blog posts imported.

## Homepage

| Route | Components | i18n | QA | Status |
|---|---|---|---|---|
| `/` | Hero, FullBleedVideo, NewsCarousel, TextMedia ×2, StatementSection ×4, FullBleedImage, ServiceGrid, TestimonialCarousel, NewsletterSignup, PartnerLogos, Header/MobileNav, Footer, PromoBar | PL ✓ / EN ✓ | HTML + CSS read directly; **browser ✗** | In progress |

News carousel copy is the one deliberate gap here, deferred until the blog existed.

## Trening personalny

| Route | Components | i18n | QA | Status |
|---|---|---|---|---|
| `/trening-personalny/` | New: SectionNav/PersonalTrainingNav, PageHero, CenteredBand, MediaCardCta. Reused: StatementSection, TextMedia, TestimonialCarousel, NewsletterSignup | PL ✓ / EN ✓ | HTML; browser ✗ | Bilingual |
| `…/trening-indywidualny/` | New: Accordion (deferred media). Reused: PageHero, CenteredBand, TextMedia, SectionNav | PL ✓ / EN ✓ | HTML + browser 30.07 (8 widths, 0 overflow) | Bilingual |
| `…/trening-w-parze/` | PageHero, TextMedia, Accordion, SectionNav | PL ✓ / EN ✓ | HTML (caught a missing section) + browser 30.07 (9 widths from 320) | Bilingual |
| `…/ocena-funkcjonalna/` | PageHero, CenteredBand, StatementSection, SectionNav | PL ✓ / EN ✓ | HTML + browser 30.07 (title overflowed at 320, fixed) | Bilingual |
| `…/trenerzy/` | PageHero, CenteredBand, SectionNav; 3 categories × 19 trainer cards | PL ✓ / **EN: bios still Polish** | HTML + browser 30.07 (cards and category row overflowed at 320, fixed) | Built (PL) |

## Fizjoterapia

| Route | Components | i18n | QA | Status |
|---|---|---|---|---|
| `/fizjoterapia/` | New: PhysiotherapyNav. Reused: PageHero, CenteredBand, TextMedia ×4, Accordion (6), MediaCardCta ×2, TestimonialCarousel | PL ✓ / EN ✓ | HTML; browser ✗ | Bilingual |
| `…/terapia-manualna/` | PageHero, CenteredBand, Accordion (10 conditions, deferred media) | PL ✓ / EN ✓ | HTML (caught a missing contact section) + browser 31.07 (10 widths × every row, both locales, 0 findings) | Verified |
| `…/rehabilitacja-ruchowa/` | PageHero, CenteredBand, Accordion (12 conditions, deferred media) | PL ✓ / EN ✓ | HTML + browser 31.07 (same sweep, 0 findings) | Verified |
| `…/zdrowy-brzuch/` | PageHero, Accordion (3 leads, `squareMedia`) + 2 pricing formats | PL ✓ / EN ✓ | HTML + browser 31.07 (same sweep, 0 findings) | Verified |
| `…/specjalisci/` | PageHero, CenteredBand, Accordion (11 specialists, `squareMedia`); `SectionHeading size="section-late"` | PL ✓ / **EN: bios still Polish** | HTML + browser 31.07 (fixed a 320/360 sideways scroll and a mid-word heading break at 1060) | Built (PL) |

## Trening grupowy

| Route | Components | i18n | QA | Status |
|---|---|---|---|---|
| `/trening-grupowy/` | New: GroupTrainingNav. Reused: PageHero, CenteredBand, TextMedia ×2, TestimonialCarousel | PL ✓ / EN ✓ | HTML; browser ✗ | Bilingual |
| `…/zajecia-grupowe/` | PageHero, CenteredBand, StatementSection ×3, Accordion (13 classes) | PL ✓ / EN ✓ | HTML | Bilingual |
| `…/plan-zdrowej-zmiany/` | PageHero, CenteredBand, StatementSection ×3, TestimonialCarousel (16 quotes). Title wraps via `titleNote` | PL ✓ / EN ✓ | HTML + live 26.07 | Bilingual |
| `…/medicover/` | PageHero | PL ✓ / EN ✓ | HTML | Bilingual |
| `…/grafik-zajec/` | Outbound link only (eFitness). The scraped page carries no content of its own | n/a | n/a | Not applicable |

## Dietetyka

| Route | Components | i18n | QA | Status |
|---|---|---|---|---|
| `/dietetyka/` | New: DieteticsNav. Reused: PageHero, StatementSection ×3, two path cards | PL ✓ / EN ✓ | HTML; browser ✗ | Bilingual |
| `…/iwona-stachowiak/` | PageHero, TextMedia ×4, Accordion (6 priced items), TestimonialCarousel (9) + 4-photo strip. No newsletter block | PL ✓ / **EN: bio still Polish** | HTML + live 26.07 | Built (PL) |
| `…/magdalena-hajduk-warchol/` | PageHero, StatementSection ×3, TextMedia ×2, Accordion, TestimonialCarousel (4). No newsletter block | PL ✓ / **EN: bio still Polish** | HTML + live 26.07 | Built (PL) |

## BodyLab

| Route | Components | i18n | QA | Status |
|---|---|---|---|---|
| `/bodylab/` | New: BodylabNav. Reused: PageHero; 3 alternating tool blocks | PL ✓ / EN ✓ | HTML + browser 30.07 (24 widths from 320, 0 overflow) | Bilingual |
| `…/technologia-vald/` | PageHero, StatementSection ×7, Accordion (pricing) | PL ✓ / EN ✓ | HTML + live 26.07 + browser 30.07 (14 widths; audience grid fixed) | Bilingual |
| `…/analiza-skadu-ciala/` | PageHero, TextMedia ×2. ⚠ The slug really is missing the "ł" on the reference (markup + sitemap) | PL ✓ / EN ✓ | HTML + live 26.07 + browser 30.07 (10 widths, 0 overflow) | Bilingual |

## Standalone pages

| Route | Components | i18n | QA | Status |
|---|---|---|---|---|
| `/cennik/` | PageHero, Accordion (9 price rows; gained `cta`/`note`/`groups`/`panelHeading`). No newsletter block | PL ✓ / EN ✓ | HTML + price audit (46/46 figures) + live 26.07 + browser 30.07 (every row opened) | Bilingual |
| `/masaz/` | Hero, intro band, 4 treatment panels (no alternation), team accordion, testimonial carousel, contact block. **The reference's 6 WooCommerce buttons are deliberately gone** | PL ✓ / EN ✓ | 53/54 content chunks, 10/10 images. Gap: `ZAMKNIJ`, which our accordion renders only when open. Browser 30.07: 23 widths, every therapist row opened | Bilingual |
| `/kontakt/` | PageHero (left-aligned), MeetUsCta. **The reference page has no content of its own** | PL ✓ / EN ✓ | Composed from copy verified elsewhere; nothing invented | Bilingual |
| `/instrukcja/` | PageHero, StatementSection ×8, FullBleedImage ×4, CenteredBand, MediaCardCta ×2. 7 images | PL ✓ / EN ✓ | HTML vs live: 0 missing headings | Bilingual |
| `/test/`, `/podziekowanie/` | TBD | n/a | n/a | **Confirm with client first** (`prd/08-fazy.md`, Phase 0): may not carry over |

## Blog

| Route | Components | i18n | QA | Status |
|---|---|---|---|---|
| `/blog/` (listing) | New: `BlogList`, a featured card for the newest post, then a 3-column grid with divider borders, reading time, author, category select + search. Reused: PageHero | PL ✓ / EN ✓ | browser: 3 × 479px columns, window 9 → 27 → 61 on scroll, filters/reset correct. **Mobile browser ✗** | Bilingual |
| `/blog/<slug>/` × 62 | Title, rule, date + reading time, rule, author block, article. Lexical body via `RichText`; `.blog-prose` in `globals.css` | PL ✓ / **EN: UI done, 62 article bodies still Polish** (a human translation job) | browser: 62 cards, filters and search work, 6 posts sampled, 0 empty bodies | Bilingual |

**No hero image and no lead paragraph on a post page: both were duplicates.** `featuredImage` is the
post's *first body image* (kept for the listing card) and `excerpt` is its opening paragraph, so
rendering either above the article repeated it. The reference has neither.

What the reference actually holds (verified 2026-07-27): 62 posts · **56 carry content images, 6 have
none** · exactly 4 categories (35 posts carry two, 2 are uncategorised) · **24 author names, 18 with a
portrait**: hence the `Authors` collection rather than a `users` relationship · body markup is a small
vocabulary (`p`, `h2`, `h3`, `strong`, `em`, `ol`/`li`, `img`, `a`, one `blockquote`, one `table`) ·
no pagination, the listing filters client-side.

## Legal and utility

| Route | Components | i18n | QA | Status |
|---|---|---|---|---|
| `/regulamin/` | New: `LegalDocument`. Reused: PageHero. 11 sections (§ I–XI) | PL ✓ / **EN: stays Polish** | HTML vs live: 0 missing headings | Built (PL) |
| `/polityka-prywatnosci/` | PageHero, `LegalDocument`. 12 sections (I–XII) | PL ✓ / **EN: stays Polish** | Same | Built (PL) |
| `/cookies/` | n/a | n/a | n/a | Not started (deferred by client) |

**The two legal documents are deliberately not translated.** `en.json` carries the Polish text for
`Terms` and `Privacy`. A mistranslated T&C is legal exposure, not a copy nit: these need a professional
pass first. Same precedent as the trainer and specialist biographies.

## Deliberate deviations from the reference

Recorded per the amended 1:1 rule in `CLAUDE.md`: the reference is reproduced except where it is plainly
defective. **Copy stays verbatim in every case**: these are styling and link-target changes.

| Where | Reference does | We do | Why |
|---|---|---|---|
| `LegalDocument` body | ~39.5px on every paragraph | `text-body`, 1.7 line-height, measure capped at 42rem | At 39.5px an 11-section T&C is unreadable |
| `LegalDocument` layout | text in the right half, left half empty | one left-aligned column per section | The empty half reads as broken and collided with the fixed promo pills |
| `LegalDocument` headings | ~68px | `menu` size, ~34px | Eleven sections at 68px read as eleven page titles |
| Gallery buttons (×4) | link to `/galeria` | link to Instagram (`GALLERY_URL`) | `/galeria` 404s on the live site and is absent from its sitemap: broken upstream |
| MegaMenu "Grafik zajęć" | internal `/trening-grupowy/grafik-zajec` | outbound to eFitness | That page has no content of its own; the reference's own header links out |
| Brand green on buttons | `#2c8657` | `#28794f` | Original measured **4.21** contrast against cream text where WCAG AA needs 4.5. New value: 4.97, visually near-identical |
| Newsletter success message | "Zostałeś pomyślnie dodany…" | "Sprawdź skrzynkę: wysłaliśmy Ci link…" | With double opt-in the old wording is untrue at that moment |
| `/blog` listing dates | featured card prints a date | no date anywhere on the listing | Client's instruction. Reading time and author stay; post pages keep their dates |
| `/blog` grid edges | edge lines at the viewport | same lines at the 1440px cap | Client asked for them back; the grid gets its own wrapper so padding sits on the cards |
| `/blog` grid breakpoint | 3 columns from 1060px | 3 columns from 1024px (`lg:`) | `sm:grid-cols-2` beat `wide:grid-cols-3`, so it silently stayed at two columns |
| Post page: author vs article | side by side at 50% each | author block spans the row, article full width beneath | Client's call: the reference's split leaves the article in a half-width gutter |
| Post page: article measure | ~886px, centred | no cap, fills the container (1376px) | Client's call, made twice. Flagged that 1376px runs ~180 characters per line; they want it anyway. One class on `PostBody` to walk it back |
| `/kontakt` content | nothing but the shared footer | display title + the "Spotkajmy się" invitation | An empty page in the sitemap is a defect. Composed from copy verified elsewhere |
| Nav "Kontakt" | anchors to the footer | goes to `/kontakt` | A real page nothing links to is worse than the anchor |

**`/kontakt` deliberately has no address/hours block and no map embed.** The footer sits directly
beneath it with exactly those details, and rendering the same three columns twice in one scroll read as
a rendering bug. A Google Maps iframe was left out too: it sets third-party cookies and there is no
consent mechanism yet: revisit when the cookies page lands.

**Known trade-off, not a bug:** the fixed promo pills can cover the footer's "Nawiguj" button at some
scroll positions. Inherent to a fixed promo bar; the reference has the same overlap and both pills are
dismissible.

`StatementSection` also gained `whitespace-pre-line`. That is a bug fix rather than a deviation: without
it the multi-line copy on `/instrukcja`, including its three bullet lists, collapsed into run-on paragraphs.

## Out of scope for Centrum migration

| Scraped route | Why it isn't a Centrum page |
|---|---|
| `/zakupy/<product>/` × 9 | Maps to the future shop data model (`CourseEditions`/`Products`, `prd/06-dane-api.md`), not a static content page. See `scraped-site-map.md` |
