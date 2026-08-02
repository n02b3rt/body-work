> Read when: you need to know WHY something looks the way it does: a specific measurement, audit or decision from July 2026.

# Archiwum: audyty migracji Centrum (lipiec 2026)

Przeniesione z `migration-tracker.md`, żeby tracker został tabelą stanu, a nie dziennikiem sesji.
Wnioski z tych audytów siedzą już w kodzie. To jest historia, nie kontekst roboczy: **nie czytaj w całości**, grepuj.

Stan strona po stronie: [`../migration-tracker.md`](../migration-tracker.md).

---

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

URL coverage: **28 of 32** content pages built; **62 of 62** blog posts in the database
(exact match both ways). The 4 unbuilt: `/cookies` (deferred by the user),
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

### The empty SEO fields are deliberate, and not a fifth import bug (2026-07-28)

Asked why the posts' SEO title, description and OG image are blank in the panel. They are, on
all 62, and this one is by design rather than another field the import fetched from the wrong
place.

`generateMetadata` falls back: SEO title to the post title, SEO description to the excerpt, OG
image to the featured image. So a post nobody has optimised still ships a distinct title, a real
description and a real share image.

**Checked whether the reference has something we failed to import, and it does not.** Its
listing metadata carries a `meta_description` per post, and on **62 of 62 it is byte-identical
to `short_description`**, which is already imported as the excerpt (one is empty). Verified on a
post page: our `<meta name="description">` and the reference's are the same text. Copying
`meta_description` into `meta.description` would duplicate identical text into a second field,
and then editing the excerpt would silently stop affecting search results.

What was actually wrong was the panel: `Tytuł SEO` explained itself and the other two did not, so
an empty group read as an oversight. All three now say what happens when left blank.

### The four physiotherapy subpages, and a deferred photo that never arrived (2026-07-31)

`/fizjoterapia/terapia-manualna`, `/rehabilitacja-ruchowa`, `/zdrowy-brzuch` and `/specjalisci`:
RWD, media weight, lazy loading and structured data, the same four jobs as the pages before them.

#### RWD: two real breaks, both on /specjalisci, both the min-content floor

Measured, not assumed: **10 widths (320, 360, 390, 414, 768, 1024, 1060, 1280, 1400, 1920) x every
state of every page**, closed plus each accordion row opened one at a time, in **both locales**:
776 measured states. Each state checks `scrollWidth` against `clientWidth`, every element's box
against the viewport, every leaf's content against its own box, and every pill button's height.

Only `/specjalisci` was broken, and only below 390px:

| | at 320 | at 360 |
|---|---|---|
| document | 364px wide in a 320px viewport (**+44**) | 364 in 360 (**+4**) |
| `h2` "Specjalizacja uroginekologiczna" | 348px box, 44px past the edge | 348px box, 4px past |
| `h2` "Dobry fizjoterapeuta." | 333px box in a 288px container | fits |
| the `p` beside the first heading | dragged to 348px with it | same |

Both are the lesson this project has now written down three times: **`overflow-wrap` does not lower
a box's min-content width.** `break-words` stops a word spilling *out* of its box; it does nothing
for a grid track or a flex item that is *sized against* min-content in the first place.

- The category sections are `Container className="grid gap-10 … lg:grid-cols-2"`. Below `lg` that
  is a single **implicit** track, and an implicit track is `auto`, floored at min-content: 348px,
  set by "uroginekologiczna". The paragraph shares the track, so it inflated too. Fixed with an
  explicit `grid-cols-1`, which is Tailwind's `minmax(0, 1fr)`.
- The lead section is `flex flex-col items-start`. On a column flex container `items-start` sizes
  each child to fit-content, which is also floored at min-content, so "Dobry fizjoterapeuta."
  claimed 333px. Both children are block-level and left-aligned, so dropping `items-start` and
  letting them stretch changes nothing visually.

The same explicit `grid-cols-1` went on the other three pages' two-up sections and on the
`zdrowy-brzuch` pricing cards, which are latent cases of the identical shape: the English
"Ultrasound consultation + training" wants 237px in a 224px card at 320px.

#### A heading that fitted its column and still read as broken

At 1060 "Specjalizacja uroginekologiczna" no longer crossed its column: `hyphens-auto break-words`
landed on `SectionHeading` the day before and keeps it inside, but a screenshot showed *how*: as
**"uroginekologi / czna", broken mid-word with no hyphen.** `hyphens: auto` was doing nothing,
because Chrome's hyphenation dictionaries are a **downloadable component** and a fresh profile has
none; the `break-words` underneath then breaks anywhere at all. A visitor on such a profile reads a
mangled word.

So this is the fifth sighting of the grid-breakpoint-vs-type-breakpoint shape, and it got its own
size rather than another per-page patch: **`SectionHeading size="section-late"`** =
`text-h-mobile min-[1400px]:text-h-section`. `compactHeading` on `StatementSection` answers the
three-up case by never growing; a two-up column *does* hold 67.7px, just not until it is about
610px wide.

**1400px is measured.** The word wants 570–612px at 67.7px: it broke in a 569px column at a 1280
viewport and sat on two clean lines in a 612px one at 1366. `Container` caps at 1440, so the column
is `(min(vw, 1440) - 64 - 64) / 2`: 636px at 1400, and only wider after that. English needs it too
("Urogynaecological specialisation"). Verified by screenshot at 1060 (two clean lines at 39.5px)
and at 1440 (two clean lines at 67.7px).

This closes the `/fizjoterapia/specjalisci` item left open under "Found on other pages, not fixed
here" on 2026-07-30. `/trening-grupowy/zajecia-grupowe` still has the same shape and can now take
`section-late` instead of `compactHeading`.

#### The bug worth remembering: a deferred image that never loads

`Accordion` holds a row's photo back until the row is opened, which is the optimisation these pages
needed most. Opening a row on `/fizjoterapia/specjalisci` in a real browser showed **the blur
placeholder and nothing else**. Not a wrong `sizes`, not a 404: the photo was simply never fetched.

`next/image` defaults to `loading="lazy"`. A deferred row mounts its image into a panel that is
still `grid-rows-[0fr]` with `overflow: hidden`, **zero visible area**. Chrome takes the
lazy-loading decision at insertion, concludes the element is nowhere near the viewport, and never
revisits it: the panel's growth is an ancestor's own `grid-template-rows` transition, not a scroll,
so nothing re-triggers the check.

Proved rather than guessed, on the live page: open a row, `scrollIntoView` the photo to the middle
of the screen, dispatch `resize`, wait three seconds: `complete` stays `false` and `naturalWidth`
stays `0`. Set `loading="eager"` on that same element and it loads immediately.

**Mounting on first open *is* the deferral, so lazy has no work left to do.** The image now carries
`loading={item.imageBlur ? "eager" : "lazy"}`: deferred rows load on open, rows with no placeholder
are mounted from the start and keep native lazy loading, exactly as before.

**This was pre-existing**, shipped on 2026-07-30 with the deferral itself, and reproduced on
`/trening-personalny/trening-indywidualny` before any of this branch's changes. Both pages are
fixed by the one-line change. Verified after: open four of eleven rows on `/specjalisci` and
exactly four photographs are fetched, all `complete`, at `w=750` for a 688px slot.

#### Media: the phone was pulling half a megabyte for photographs nobody had opened

Blur placeholders now cover `fizjoterapia/manualna`, `fizjoterapia/rehab` and
`fizjoterapia/specjalisci` (the map is 140 entries, 21.2KB; the script still does not recurse).
Passing `imageBlur` is what switches the deferral on, so the accordion photographs left the initial
document entirely.

Images fetched by a 390px phone at DPR2, resolved from each page's own `srcset` and `sizes` against
the built server:

| page | before | after | images in the document |
|---|---|---|---|
| `/fizjoterapia/specjalisci` | **495.1KB** | **60.6KB** (−88%) | 26 → 15 |
| `/fizjoterapia/rehabilitacja-ruchowa` | 221.9KB | 74.5KB (−66%) | 28 → 16 |
| `/fizjoterapia/zdrowy-brzuch` | 200.1KB | 99.2KB (−50%) | 20 → 17 |
| `/fizjoterapia/terapia-manualna` | 194.2KB | 58.3KB (−70%) | 26 → 16 |

Opening a row then costs what that one photograph costs and nothing else: on the same 390px phone
at DPR2 the slot is `calc(100vw - 32px)` = 358px, so it fetches the 750px rung: **36.1KB for a
specialist's portrait, 13.6–16.0KB for a condition photo.** Eleven portraits used to arrive whether
or not anybody opened a single row.

What is left on a phone is the hero (40–148KB, `priority`, and its `100vw` is honest), the section
watermark and the newsletter background at 30KB each. `zdrowy-brzuch` keeps more than the others
because it has a real full-bleed photograph, `brzuch-projekt.webp`, which now carries a placeholder
too.

`/specjalisci` and the `zdrowy-brzuch` leads also took `squareMedia`, the flag `Accordion` has been
carrying a note about since `/masaz`: without it a portrait is stretched to whatever height the bio
happens to need, so whoever wrote least about themselves gets cropped hardest.

**No source image was re-encoded.** Everything goes through `next/image`, so shrinking an 8534px
original changes the repository and not one delivered byte.

#### SEO

All four routes shipped **no meta description at all**, so no `og:description` either, and all four
fell back to the same generic `og-default.jpg`. Each now has a 143–157 character description in
both locales, and its own **1200x630 JPEG** card cut from its hero by
`scripts/generate-og-images.mjs`, same recipe as the default (JPEG because some scrapers still
refuse WebP), 31–71KB each.

JSON-LD per page, on top of the sitewide `HealthAndBeautyBusiness`:

| page | blocks |
|---|---|
| `terapia-manualna` | `Service` + `MedicalTherapy` (10 `MedicalIndication`) + 3-level `BreadcrumbList` |
| `rehabilitacja-ruchowa` | `Service` + `MedicalTherapy` (12 indications) + `BreadcrumbList` |
| `zdrowy-brzuch` | `Service` with the two formats as an `OfferCatalog` + `ItemList` of 3 `Person` + `BreadcrumbList` |
| `specjalisci` | `ItemList` of 11 `Person` + `BreadcrumbList` |

**`MedicalTherapy` is new and it earns its place.** `Service` says the centre sells manual therapy;
it says nothing about what the therapy is *for*, and the entire page below the fold is exactly
that: ten and twelve named conditions, each with its own paragraph. `indication` is the vocabulary
for it. Every condition named is a visible heading, which is what Google's structured-data policy
requires, and the bodies stay out because they are already in the prose.

Three things deliberately **not** claimed:

- **No prices on `zdrowy-brzuch`**, although the page prints two. Only `/cennik` reads amounts back
  out of its own copy, and its parser is written for that page's shape: "2.000,-" and its English
  "2,000 PLN" are not that shape, and a second hand-kept price is free to drift from the one the
  visitor reads.
- **No `Service` on `/specjalisci`**: people, not a therapy, the same reason the hub's own
  catalogue leaves it out.
- **No `jobTitle` for the three `zdrowy-brzuch` leads.** They are introduced by name only; their
  bios open with a shouted display label ("SPECJALIZACJA - TRENING MEDYCZNY, …") that is right on
  the page and wrong as a title. `trainerListJsonLd` now takes `jobTitle` as optional. On
  `/specjalisci` the category heading *is* the clean value, so those eleven do carry one.

Titles are stripped of the reference's trailing full stop before they enter a breadcrumb or a
`Service` name: "Terapia manualna.", stop included, was going into search results.

Verified on the built server, both locales: description present and under 160 characters, canonical,
`hreflang` pair, `og:image` the new JPEG with declared 1200x630, `twitter:card`, and every JSON-LD
block parsing as valid JSON with the expected `@type`.

#### Found and not fixed: two shared components, both pre-existing, both sitewide

Reported rather than fixed because each one lives in a component every route renders, and each needs
a decision about the whole site rather than about four pages.

**The mega-menu column headings overflow their own box.** "Fizjoterapia" by 10px in a 176px column
at 1366 and by 9px at 1400; in English "Physiotherapy" by **36px in a 194px column at 1920 and 47px
in a 183px one at 1400**: the English label is over its box at *every* width measured. It spills
into the column's own 40px padding rather than clipping or colliding with the divider, so nothing is
unreadable. The cause is structural: the mega menu is `grid-cols-5` with `px-10`, and `Container`
caps at 1440 where the reference has no cap at all, so our columns are narrower than the ones this
type size was chosen for.

**The footer's fitted "KONTAKT" heading overflows in English.** `SectionHeading size="display"` sets
`font-size: 100cqw / chars * 1.5` and is `whitespace-nowrap`, and `FIT_COEFFICIENT` was calibrated
on an average uppercase advance of ~0.62em. "CONTACT" is rounder than that average (two `C`s and an
`O`), so it lands 2–3% over its container at every width: +6px in a 273px box at 320, +22px in a
981px box at 1060, +16px in a 1201px box at 1400. Polish "KONTAKT" has the same seven characters and
fits everywhere, which is why this has gone unnoticed. Lowering the coefficient fixes it, and moves
**every** display heading on **every** page, so it is the client's call, not a subpage's.

### The other three personal-training subpages, and the 320px bug the first sweep missed (2026-07-30)

`/trening-w-parze`, `/ocena-funkcjonalna` and `/trenerzy` got the same pass as
`/trening-indywidualny`. **The first sweep started at 360px and that was too narrow a net**: three
of the four pages scroll sideways at **320px**, which is a real viewport (iPhone SE, and the
narrowest common preset). Two distinct causes, both the same underlying trap.

**Text that cannot break.** At `text-h-mobile` (39.5px) a single Polish word can be wider than a
small phone's whole column. Measured at 320: "Trening z oceną funkcjonalną." wanted 327px inside a
273px box and pushed the document to 343px; "Trening indywidualny." did it by 33px. `SectionHeading`
now carries `hyphens-auto break-words` on its non-fitted sizes: a dictionary break with a hyphen,
which is what Polish wants, and a hard break underneath for words the dictionary does not know.
Neither does anything until a word genuinely cannot fit, so nothing that fits today moved. Fitted
`display` headings are exempt: they are `whitespace-nowrap` and scale to their own container.

**Boxes that cannot shrink**, which is the part `break-words` does *not* solve. `overflow-wrap`
lets text wrap but does **not** lower the intrinsic min-content width that a grid track or flex item
is sized against. On `/trenerzy` that bit twice: each trainer card floored at 294px (a 228px
min-content `h3` plus its own `p-8`) inside a 273px column, and the category row's implicit `auto`
track was floored by "TRENING FUNKCJONALNY". Fixed with `min-w-0` on the card and an explicit
`grid-cols-1` (`minmax(0, 1fr)`) on the row: the same two idioms the accordion already documents.

After the fixes, all four pages: **zero overflowing elements and no horizontal scroll at 320, 360,
390, 414, 768, 1024, 1280, 1440 and 1900**, every button 56px.

**`/trenerzy` was the page that actually carried weight**: 19 portraits, 2.8MB of source, and not a
single blur placeholder, because the script does not recurse and `trening-personalny/trenerzy` had
no entry. Its `sizes` was also written purely in viewport units, so it claimed the whole grid column
including padding: 634px for a 395px cell at 1920 (60% over) and 390 for a 277px cell on a phone.
Rewritten against the measured slot (247px at 360, 277 at 390, 287 at 768, 388 at 1440, 393 at 1900,
all now within 2–7%). **478KB to 355KB of portraits on a 390px phone at DPR2**, and naming pixel
lengths also lets the srcset reach `imageSizes` instead of `deviceSizes`, whose floor is 640.

`/ocena-funkcjonalna` had two full-bleed photos built with a raw `next/image` and no placeholder,
though both were already in the blur map, just never wired up. `/trening-w-parze` now passes
`imageBlur` for its six accordion rows, which is also what earns it the deferred-photo behaviour
described above.

All three had **no meta description at all**, so no `og:description` either; each now has one in
both locales plus a `BreadcrumbList`. `/trenerzy` gets an `ItemList` of 19 `Person`, which is what
those entries honestly are: real named people with a role and a photograph. Their `jobTitle` comes
from the category heading, not from `trainer.specialisation`: that string is the reference's own
display label, "SPECJALIZACJA: TRENING MEDYCZNY", prefix and shouting included, which is right on
the page and wrong in structured data.

**Two content problems found and deliberately not fixed**, because they are real people's names and
the scraped reference does not contain them to check against (its trainer list is rendered by
script, so the mirror has the `SPECJALIZACJA` labels but no names): `Franiciszek Kruk` is almost
certainly "Franciszek", its own image file is `franciszek-kruk.webp`, and `Małgorzata
Muzyka-kopera` should probably be "Muzyka-Kopera". Both want a human to confirm. Katarzyna Adamek
appearing under two categories is **not** a bug; she has two specialisations.

**Pre-existing, on another agent's page, reported not fixed:** `/masaz` scrolls sideways at 320px
(32 overflowing elements, the `TextMedia` text column among them). Same min-content shape as above.

### /trening-personalny/trening-indywidualny: the accordion was downloading eight photos nobody asked for (2026-07-30)

The page was already sound: **no horizontal scroll and no overflowing element at any width from
345 to 1885 px**, no heading wider than its own box, and every button 56 px tall. That was measured,
not eyeballed: `getBoundingClientRect` on every element in the document at 360, 390, 414, 768,
1024, 1280, 1440 and 1900, with the off-canvas menu and the newsletter honeypot (parked at
`-9999px`) excluded. So **no layout change was needed and none was made.**

`sizes` was checked the same way, against the slot each image really renders into: 313 px at a 360
viewport, 343 at 390, 705 at 768, 441 at 1024, 649 at 1440, 656 from 1900 on. Every declaration
lands within 1–7 % of the truth, the residual being the desktop scrollbar, which a phone does not
have. Nothing to fix there either.

**What was actually wrong was the "Kiedy warto?" accordion.** Its eight photos had no blur
placeholders, because `generate-blur-placeholders.mjs` does not recurse and
`trening-personalny/reasons` had no entry of its own: the same trap `fizjoterapia/sprzet` was
already in.

Worse, `loading="lazy"` was not saving anything. A closed panel is a `0fr` grid row, so it has no
*height*, but its photo keeps its own 288 px layout box, and the eight boxes end up stacked within
about a thousand pixels of each other (tops measured at 6771, 6905, 7014 …). That band sits well
inside the distance at which Chrome starts a lazy image, so scrolling past the row *titles*
downloaded all eight photos of an accordion nobody had opened. They are now mounted on first open,
with the 151-byte blur painted on the wrapper so the panel is never blank.

Measured against the built server, a 390 px phone at DPR 2: **153 KB of images before, 96 KB after**,
so 57 KB and eight requests that are no longer spent by default. The absolute numbers are small
because AVIF plus the width ladder in `next.config.ts` were already doing the heavy lifting: this
page was never anywhere near the megabytes the brief feared.

**The deferral is conditional on `imageBlur` being present**, which is what keeps it safe. Without
a placeholder there is nothing to paint between the click and the photo, and trading a download the
visitor might not need for a blank half-panel they certainly see is the wrong way round. The eleven
other pages on this component pass no placeholder and so are byte-for-byte unchanged; verified in
the build output (`/masaz` still ships all 11 of its `<img>` tags). `/fizjoterapia` does pass one
and picked up six deferred photos for free.

SEO: the route shipped no description at all, so no `og:description` either. It now has one in both
locales, plus a `Service` whose catalogue is the eight focuses the accordion describes, and a
three-level `BreadcrumbList` (the hub's is two). The catalogue entries carry **no `url`**: they are
sections of this page, not routes, and linking them somewhere would be inventing pages. It is
deliberately **not** a `FAQPage`: those eight headings are topics ("Redukcja tkanki tłuszczowej"),
not questions, and dressing them as `Question`/`Answer` would claim a shape the page does not have.

Not done: `/trening-personalny/trening-w-parze` renders the same eight `TrainingReasons` rows and
still passes no `imageBlur`, so it keeps the old behaviour. One `blurFor` map there buys it the
same 57 KB.

### /cennik: RWD, loading and structured data (2026-07-30)

**The page is a display title and a nine-row accordion, and its whole content is inside panels that
are `grid-rows-[0fr]` until clicked.** A sweep that only loads the page measures nothing, so the
harness opens each row in turn: **23 widths from 320 to 1920 x 10 states each** (closed, plus each
of the nine rows), **230 measured states**. `scrollWidth` equals `clientWidth` in every one of them,
and after the fix below nothing overflows its own box either.

#### The one layout fault, and it was ours

The dietetics row is the only accordion row on the site with `groups` (two named sub-lists, one per
dietitian). `Accordion` stacked both of them inside the panel's **left** column and left the right
half empty at every desktop width, which also made the longest price line wrap next to that empty
space. The reference does not do this: both blocks there carry `ul:w2-2 ho:w1-2`, full width on a
phone and **a half each** from its wide breakpoint up.

So a panel that is *only* sub-lists now lays them out as the panel's own halves. Measured at a 1912
viewport: two cells 688px wide at x=261 and x=949, which is the capped container split in two. The
branch is guarded (`groupsFillPanel`) so a row that also has copy, a photo or a panel heading keeps
the original layout, and that guard matters, because this is a shared component used by twelve
other pages.

The panel's `Container` also gained an explicit `grid-cols-1`. An implicit `auto` track is floored
at min-content, so one unbreakable word in a price list could have sized the panel wider than the
page; `grid-cols-*` is `minmax(0, 1fr)` and removes that floor without changing anything else.

#### Images: there are none, and that is correct

This route renders **no photographs at all**: `PageHero` is called without an `imageSrc` and no
accordion row here carries an `image`. Checked against the mirror rather than assumed: every file in
`scripts/scrape/scraped/cennik/media/` is a favicon, a logo or a social icon, so the reference has no
photography on this page either.

Measured whole-page transfer, unchanged by this work: **2KB of images across 13 `<img>` elements**
(all SVG chrome from the header and footer) out of **237–284KB total** at every width from 320 to
1920. There is nothing to resize, nothing to lazy-load and nothing to put a blur placeholder under.
Said plainly rather than manufactured: `next/image` `sizes` tuning and the blur map are the right
tools for the pages that have photographs, and this is not one of them.

#### SEO

**Nine links pointed at the reference mirror.** Every CTA in the price list, in both locales, was an
absolute `https://bodywork.testowe.eu/...` URL left over from the import, so the pricing page, which
is exactly where a visitor decides to book, sent them to a staging clone of this site. All nine
targets exist here as routes, and the reference's own markup uses relative paths (`href="/dietetyka/
iwona-stachowiak/"`), so the absolute origin was never even in the source. Now internal paths, which
`PanelLink` routes through next-intl's locale-aware `Link`. The tenth CTA is left alone: it is the
eFitness calendar, genuinely off-site and identical to `SCHEDULE_URL`.

**The route shipped no description**, so no `og:description` either. Now 145 characters PL and 148 EN.

**`OfferCatalog` with real prices, which no other page on this site can honestly declare.** Every
section hub uses a bare `hasOfferCatalog` precisely because it shows no prices; this page shows 65 of
them. Each of the nine rows becomes a `Service` carrying an `AggregateOffer` with `lowPrice`,
`highPrice`, `priceCurrency: PLN` and `offerCount`, plus a `BreadcrumbList`.

The amounts are **read back out of the page copy** (`src/lib/pricing.ts`) rather than kept as a
second hand-maintained list, so the structured data cannot drift from what a visitor reads. Only the
amounts are read, never the labels: a number here always carries a `,-` or `zł` marker and cannot be
confused with "(1,5h)" or "(pakiet 5x)", whereas the labels are genuinely ambiguous: on the massage
row the treatment name sits on the line *above* its price, and "1 trening" appears three times at
three different price levels. Reconstructing 64 individually named offers would be 64 chances to
publish a mangled price; a range per service says exactly what the page says and cannot be mangled.

Verified against the rendered page: nine services, ranges 240–5710, 360–7800, 240–5710, 240–4750,
560–560, 45–2090, 180–1550, 495–795 and 200–395 PLN, each cross-checked against its own price list.
Seven carry a `url`; group classes and dietetics do not, because their row CTA is off-site and
per-dietitian respectively.

#### Found on other pages, not fixed here

The sweep was pointed at the twelve other pages that share `Accordion` to check for regressions.
Two pre-existing faults turned up, **both confirmed present with `main`'s `Accordion` too**, on a
rebuild with this branch's component reverted, and both in the `closed` state, i.e. page content
rather than panel content:

- `/fizjoterapia/specjalisci` at 1060: "Specjalizacja uroginekologiczna" needs 596px in a 466px
  column (+130). The page does not scroll sideways, but the heading crosses its column.
- `/trening-grupowy/zajecia-grupowe` at 1920: a `StatementSection` heading over its column by 59px.

Both are the `lg`-grid-vs-`wide`-type shape this project has now hit four times, and both take the
same `compactHeading` fix. Left for their own branches rather than widened into this one.

### `/masaz`: RWD, media and SEO (2026-07-30)

Swept at 23 widths from 320 to 1920, every therapist row opened at six of them.
`scrollWidth === clientWidth` at all 23 before and after; the faults were all inside boxes, which
is why nobody had seen them.

- **A quoted review was painting across its neighbour.** One Google review contains
  `kobido/fizjoterapeutyczne/relaksacyjne`, 38 characters with no space and no default break
  opportunity at a slash, so its min-content width is 335px. As a shrink-to-fit flex item the
  paragraph took that width whatever the slide was, and overran a 252px slide by **66px at a 1024
  viewport**, printing fragments of itself over the testimonial next to it. The copy is quoted
  verbatim, so `w-full break-words` on the quote is the fix.
- **`break-words` on its own would not have fixed it, and this is the reusable part.** A browser
  ignores `overflow-wrap: break-word` when it computes an element's min-content contribution, so a
  shrink-to-fit flex item is still *sized* to the unbreakable word and simply overflows without ever
  breaking it. The width has to be pinned as well: `w-full break-words`. The same pair went onto
  `SectionHeading`, where at a 320 viewport "kompleksowego" (317px) and "KLASYCZNY" (303px) did not
  fit the container's 288px content box and were sliced by the viewport edge.
- **The therapist portraits were a letterbox on tablets.** `Accordion`'s `squareMedia` only applied
  `lg:aspect-square`, and below that the box fell back to `min-h-[18rem]`: **720x288 at a 768
  viewport, 2.5:1**, which keeps a band across the chest and crops the head off entirely. That is the
  exact thing the flag exists to prevent. Square at every width now, matching the reference's own
  unprefixed `ratio1-1`.
- **`TextMedia`'s grid took `grid-cols-1`**, without which its single implicit `auto` track was
  floored at the widest word and the row measured 303px inside a 288px container at 320.
- **Four source images were carrying rows the page can never display**, so
  `scripts/crop-to-display-aspect.mjs` crops them to the tallest box each one appears in: the hero
  from 2:3 to the 4:3 of `PageHero`'s narrowest breakpoint, two portraits to the square the accordion
  now uses. Centred, so it is exactly the region `object-cover` was already painting. **33 to 36% off
  the hero at every width, 20 to 21% off one portrait, 16 to 18% off the other, 16% across the four
  files.** `wiktoria-wysocka.webp` is already square and is left alone. Quality 80 was picked by
  measurement, not taste: it reproduces the mirror's own bytes per pixel, and RMSE against the cropped
  original is 1.20 to 1.73 on 0-255, the same band as the blog's `cardWide` pre-crop.
- **Blur placeholders** now cover `public/images/masaz` (map 91 entries), with the three accordion
  portraits taking theirs as an `imageBlur` prop because `static-blur` is server-only. The two
  full-bleed plates (`hub-mark`, `jak-skorzystac`) are deliberately left without one: both are blank
  cream at under 10KB and arrive before a placeholder would help, the same call `CenteredBand`
  already documents.
- **SEO:** an SEO title and a meta description on a route that had a bare one-word `<title>` and no
  description at all, plus `Service` with the four treatments as an `OfferCatalog` and a
  `BreadcrumbList`. The catalogue entries all point at `/masaz` because none of the four has a page
  of its own; prices stay out, they live on `/cennik`.
- **Measured, deliberately not fixed:** at 320 two `shrink-0` rows in the shared header and footer
  are 7px and 13px wider than the container's content box. They are not this page's, they are
  contained by `overflow-x: clip`, and nothing is visibly cut.
| `/kontakt/` | `/kontakt/` | Reused: PageHero (display title, **left**-aligned), MeetUsCta. **The reference page has no content of its own**, see the note below | PL: done / EN: done | Composed from copy already verified elsewhere; nothing invented | Bilingual |
| `/instrukcja/` | `/instrukcja/` | New: none. Reused: PageHero, StatementSection ×8 (3 of them a 3-up bullet row), FullBleedImage ×4, CenteredBand, MediaCardCta ×2. 7 images copied. No newsletter block: the reference has none | PL: done / EN: done | Two-way check vs. the live site: 0 missing headings | Bilingual |

### `/bodylab`: deviations and fixes (2026-07-30)

- **The "W BODYLAB każdy ruch ma znaczenie." band is two columns now, not text over a background.**
  It rendered `hub-mark.webp` as a full-bleed `object-cover` background with the heading and body
  on top, which put navy copy over navy line art, and, because the section's height comes from its
  content, showed a different arbitrary crop of the drawing at every viewport width. The reference
  puts that drawing in its own `ratio4-3` cell beside the copy (`ul:w2-2 ho:w1-2`), so this restores
  the reference rather than inventing a layout. `hub-mark.webp` here is a real editorial
  illustration (stdev 39 across channels); the file of the same name on `/trening-grupowy` is a flat
  cream plate (stdev 3), which is why `CenteredBand` gets away with a background there.
- **The heading in that band is no longer forced uppercase.** The reference's `h2` carries neither
  `ttu` nor `ul:ttu`, and the stored copy is already mixed case.
- **The three tool photographs are square, from the reference's own `ratio1-1`.** They were in a
  16:9 box; two of the three sources are 720x1080 portraits, so that discarded two thirds of the
  frame, and the third (an InBody readout, 2833x2625) lost 40% of a screenshot people are meant to
  read.
- **`StatementSection`'s heading is `w-full break-words`.** It is a column flex container, so
  `items-start` sized the heading to max-content: on `/bodylab/technologia-vald` a heading painted
  209px across the neighbouring cell at a 1060 viewport, colliding with its text. Invisible to a
  `scrollWidth` check because `html` carries `overflow-x: clip`. The audience grid on that page also
  takes `compactHeading` (a third of the row is 262px there, and "Rehabilitacji" needs about 440px
  at the `section` size) and an explicit `grid-cols-1`, without which the single implicit `auto`
  track was floored at the widest word and the cells measured 340px inside a 328px container at 360.
- **Reported, deliberately not changed:** the reference's lead band is centred with an eyebrow line
  ("BODYLAB – Laboratorium Twojej wydajności.") that this page has never carried, and its own
  background image there is a blank cream plate, so nothing is lost by our `bg-background`. The
  audience heading "OSOBY W TRKACIE REHABILITACJI" is misspelled on the reference too (`TRKACIE`),
  and copy stays verbatim. `og:image` stays the shared 1200x630 JPEG rather than a page photo, for
  the reason in `src/lib/metadata.ts`.

### /trening-grupowy: RWD, media, lazy loading and structured data (2026-07-29)

**No layout breaks to fix.** Swept eleven widths (485, 529, 589, 669, 769, 1009, 1049, 1219, 1469,
1889) and `scrollWidth` equalled `clientWidth` at every one, with nothing overflowing its own box
either. That is the shared-component work from the previous two pages paying off: this page is built
entirely from `PageHero`, `CenteredBand`, `TextMedia`, `TestimonialCarousel`, `BlogTeasers` and
`NewsletterSignup`, all of which were measured and corrected already. It has no multi-column
statement grid, which is the shape that broke the other two.

#### Media and lazy loading

The page uses **217KB of images** out of the 1.22MB in its folder, and no video. Measured first-load
transfer:

| | total | images |
|---|---|---|
| 485px viewport | **476KB** | 67KB |
| 1469px viewport | 396KB | 109KB |

The only work needed was extending `scripts/generate-blur-placeholders.mjs` to
`public/images/trening-grupowy`, taking the map to **81 entries, 160 bytes each, 16.6KB of JSON**.

Verified in the served HTML rather than after load: **12 blur placeholders**, with the hero eager
(it carries `priority`) and `hub-zajecia` and `hub-plan` both `loading="lazy"` with a placeholder
under them.

**A measurement note:** counting blurred images from the page after three seconds reports zero,
because `next/image` drops the placeholder once the real file decodes. Check the served HTML for
`data:image/webp;base64,` instead.

#### SEO

**The route shipped no description**, same as `/trening-personalny`: `pageMetadata` was called with a
title only. The new one is 136 characters and every fact is on the page: the lead statement names
Poznań and multi-plane movement, the band offers a free first class, and the sub-pages are group
classes, the Healthy Change Plan and Medicover.

Added a `Service` with those three as its catalogue and a two-level `BreadcrumbList`, both hanging
off the sitewide business by `@id`. `grafik-zajec` is deliberately not among the variants: it is an
outbound eFitness link, not a route here.

Verified: description 136 characters, canonical present, `og:image` the 1200x630 JPEG with `alt`, and
**three JSON-LD blocks, all valid JSON**: `HealthAndBeautyBusiness`, `Service` with the three named
variants and `areaServed` Poznań, and the breadcrumb trail.

#### A mismatch that turned out to be correct

The PL/EN key-path check came back uneven, 1076 against 1072, and the four extra keys are
`Blog.categoryLocative.*`. That is **deliberate**: they hold Polish locative forms
(fizjoterapii, masażu, treningu, dietetyce) for the blog-teaser heading, English declines nothing,
and `BlogTeasers` guards the lookup with `t.has()` before falling back to the category title. It is
documented in that component. Left alone.

### /trening-personalny: RWD, media, lazy loading and structured data (2026-07-29)

The same four jobs as the homepage, and the one real layout break here was the same *shape* of bug
as the service grid's: a grid that changes column count at one breakpoint while the type scales at
another.

#### The heading that could never fit

Swept eight widths. Seven were clean; **at 1049 the page was 75px wider than the viewport**, and the
culprit was a specialisation heading.

The three-up specialisations grid went three-up at `lg` (1024), while `SectionHeading`'s `section`
size jumps from 39.5px straight to 67.7px at `wide` (1060). Between those the columns are narrow and
the type is already large. Worse, the arithmetic says it never fits: at 67.7px the word
"funkcjonalny." needs roughly 396px, and a third of the capped 1440 container is at most 378px, so
**the heading overflows its column at every desktop width**, not just in that band.

**The reference gives this block three type steps**, `ul:f7s4 hg:f9s4 eo:f12s5`, so 39.5px, then
50.8px, then 67.7px only at a genuinely wide viewport. Our scale has two steps and no middle. Rather
than re-scale `section` sitewide, `StatementSection` gained a `compactHeading` prop that holds the
heading at 39.5px, which is what the reference's base step is, and the specialisations grid uses it.
The grid also moved to `wide:grid-cols-3` so the column count and the rest of the type scale change
together, matching the reference's own `ho:w1-3`.

Two-up columns are unaffected and deliberately left alone: at roughly 656px they hold 67.7px fine,
which is why the homepage's split statement block never showed this.

After the fix: `scrollWidth` equals `clientWidth` at 485, 669, 1009, 1049, 1219, 1469 and 1889, and
the same holds on the homepage, which shares `StatementSection`.

#### Media

No video on this page, and the images were already reasonable. Measured first-load transfer:

| | total | images |
|---|---|---|
| 485px viewport | **539KB** | 125KB |
| 1469px viewport | 606KB | 298KB |

`MediaCardCta`'s `sizes` was the one overstatement: `(min-width: 1060px) 50vw, 100vw` against a slot
that measures 389px at 485, 557 at 669 and 396 at 1049. Plain `100vw` overstated it by a fifth on a
phone and `50vw` by a third at 1049, because the container padding and the card's own `p-8`/`lg:p-12`
come off.

> **Superseded on 2026-07-29** by the `/fizjoterapia` pass, which found the replacement still wrong
> between 1024 and 1059: it put the two-up branch at `wide` (1060) while both calling pages lay the
> cards out with `lg:grid-cols-2` (1024). See that section for the measured value now in the file.

`PageHero` and the full-bleed `sprawnosc.webp` band were both confirmed genuinely full width at 485,
669, 1049 and 1469, so their `100vw` stays.

#### Lazy loading with blur placeholders

`scripts/generate-blur-placeholders.mjs` gained `public/images/trening-personalny`, taking the map
to **45 entries, 167 bytes each, 9.6KB of JSON**. Placeholders are now on `PageHero` (which also
keeps `priority`, being the first paint), `MediaCardCta`, `TextMedia` and the 668KB `sprawnosc.webp`
band. `CenteredBand`'s watermark deliberately has none: it is under 40KB and arrives before a blur
would help, and that is now written down in the component.

#### SEO

**The route shipped no description at all**, because `pageMetadata` was called with a title only, so
there was no `description`, `og:description` or `twitter:description` either. `metaDescription` is
157 characters and every fact in it comes from the page: the three specialisations, the intro
statement about integrated training and physiotherapy, and the footer's Poznań address.

Two JSON-LD blocks added on top of the sitewide business:

- a **`Service`** naming the three variants the hub links to, with `provider` pointing at the
  business by `@id` and `areaServed` read from the footer's city
- a **`BreadcrumbList`**, home then this page

`hasOfferCatalog` rather than `offers`: there are no prices in the markup, so an `Offer` would be a
claim the page does not make. The catalogue names what is available and links to it, which is what
the page actually says.

"Strona główna" moved from the Blog namespace to `common.breadcrumbHome`, since a second page now
needs it and reaching into another page's namespace for a shared label is a smell. The blog keeps
its own key so this change stays inside the task.

Verified: description 157 characters, canonical present, `og:image` the 1200x630 JPEG with `alt`,
and **three JSON-LD blocks, all valid JSON**: `HealthAndBeautyBusiness`, `Service` with 3 variants
and `areaServed` Poznań, and a 2-level `BreadcrumbList`.

### /fizjoterapia: RWD, media, lazy loading and structured data (2026-07-29)

The same four jobs again. Unlike the two pages before it, **this one had no layout break at all**:
`scrollWidth` equals `clientWidth` at 360, 390, 414, 480, 540, 600, 639, 640, 700, 768, 834, 900,
1023, 1024, 1059, 1060, 1200, 1366, 1440, 1600 and 1920, with no unclipped element past the right
edge at any of them, and the same holds with an equipment row expanded. The faults were all in what
the page *fetches*, not how it lays out.

#### Measuring below 500px without a phone

Worth writing down, because the previous two sessions each hit this and worked around it differently.
**Headless Chrome clamps its layout viewport at 500px** (`--window-size=360` still reports
`clientWidth` 500), and the Chrome extension's `resize_window` leaves the page laying out at ~980
regardless. Neither can show you a 360px phone.

What does work: a scratch page served from `public/` that iframes the route at an exact width. An
iframe gets its own layout viewport, so media queries evaluate against *its* width: verified with a
control page that reports `matchMedia('(min-width:640px)')` false at an iframe width of 360. Being
same-origin, the harness reads `contentDocument` and measures from the outside, and
`--dump-dom` carries the result back out. Two things to know if this gets rebuilt: the extension's
JS runs in a sandboxed, opaque-origin world that cannot touch a child frame (and hangs the renderer
if you try), so drive it with headless Chrome instead; and **headless force-loads lazy images**, so
any `loading="lazy"` measurement taken there is meaningless: that one has to come from a headed
browser.

#### Media

Nothing here was pulling megabytes. The whole page at 360px is **111KB of images**, and first paint
fetches exactly two of the eighteen: the hero and the 2KB watermark. Confirmed in a headed browser at
a 477px viewport: sixteen images still unloaded at `scrollY` 0.

Two `sizes` were wrong, both understated as overdraws rather than layout faults:

- **`Accordion` ended in a bare `100vw`.** A `sizes` written only in viewport units makes Next build
  the srcset from `deviceSizes` alone, and its smallest entry is 640, so a 343px slot on a phone was
  handed a 640px file. Naming a pixel length lets it reach `imageSizes`: **640 → 384 at 360 and
  390px**, 828 → 750 at 1024 and above.
- **`MediaCardCta` put its two-up branch at 1060 while the grid goes two-up at 1024.** Between those
  the slot halves to 376px and the old value was still claiming `calc(100vw - 64px)`: **a 960px file
  for a 376px hole**. Now `(min-width: 1440px) 592px, (min-width: 1024px) calc(50vw - 128px),
  (min-width: 640px) calc(100vw - 112px), calc(100vw - 96px)`, measured at 249px/360, 513/640,
  376/1024, 592/1920. This fixes `/trening-personalny` too, which has the same `lg:grid-cols-2`.

No source file was re-encoded. `hub-zespol.webp` is 6048px and 1148KB on disk, but every byte the
browser sees comes through `next/image`, so shrinking the source would change the repo and not one
delivered request. Left alone deliberately.

#### Lazy loading with blur placeholders

`generate-blur-placeholders.mjs` gained `public/images/fizjoterapia` **and**
`public/images/fizjoterapia/sprzet`: the script does not recurse, which is now said in its comment.
The map is 70 entries, 11.1KB.

`Accordion` is a **client** component, so it cannot call `blurProps`: importing the server-only map
would ship all 11KB to every page that renders an accordion. It takes an `imageBlur` string on
`AccordionItemData` instead, resolved by the page with `blurFor()`: the same shape as the
homepage's `posterBlur`. Verified in the HTML: all six equipment photos carry a placeholder and
`loading="lazy"`, and the hero carries a placeholder plus its `rel="preload"` (which is how Next 16
implements `priority`).

`CenteredBand`'s watermark and the newsletter background keep no placeholder: both deliver ~2KB.

#### SEO

Same gap as the last two routes: `pageMetadata` was called with a title only, so there was no
`description`, `og:description` or `twitter:description`. `metaDescription` is 150 characters (PL)
and 156 (EN), and every fact in it is on the page: the three sub-therapies, the equipment named in
"Metody pracy", and the footer's Poznań address.

Two JSON-LD blocks on top of the sitewide business: a **`Service`** with a three-entry
`hasOfferCatalog`, and a two-level **`BreadcrumbList`**.

**The catalogue deliberately omits `/fizjoterapia/specjalisci`**, which is the sub-nav's fourth
entry. It lists the people, not a therapy, and an `OfferCatalog` entry for it would say the centre
sells "specialists".

**No `FAQPage` for the equipment accordion.** It is the obvious-looking win and it would be wrong:
the rows are device names (USG, EPTE, COMPEX), not questions, and marking up a non-FAQ as one is
what manual actions are for.

Verified in both locales: description present and mirrored into `og:`/`twitter:`, canonical set,
`hreflang` pair emitted, and three JSON-LD blocks that all parse :
`HealthAndBeautyBusiness`, `Service` with 3 catalogue entries and `areaServed` Poznań, and the
breadcrumb trail.

#### Two sitewide faults this page surfaced (fixed 2026-07-29)

Both were found while checking `/fizjoterapia` but live in shared components, so the fix lands on
every route.

**The floating "Akademia" CTA was completely covered by the promo pills.** `Header` pins the CTA
bottom-centre below `wide` and `PromoBar` pins its pills bottom-right, and **both were anchored 16px
off the bottom edge**, so the lowest pill spanned the CTA's whole box. Measured: collision at 360,
414, 640, 834, 1024 and 1059, i.e. every width where the CTA renders.

The reference has the identical fault and resolves it by stacking order alone: its
`.academy-mobile-button` is `z-index: 120` and the promo `aside` is `121`, so the pills simply win
and the CTA is unreachable. That is the reference being broken, not a design.

`PromoBar`'s stack is now lifted clear of it below `wide`:
`bottom-[calc(1rem+3.5rem+0.5rem)]`, which reads as the CTA's own `bottom-4`, plus its fixed
`min-h-14`, plus a gap. The height is safe to hard-code because the button never wraps: measured
177px wide at a 360 viewport, 56px tall at every width. From `wide` up the CTA is hidden and the
pills keep their original `wide:bottom-7`.

After: **no collision at 360, 414, 480, 640, 768, 834, 1024 or 1059**, a consistent 20px gap, and the
pills back at their old position from 1060 up. Page overflow still 0 across 14 widths.

**"WIĘCEJ O FIZJOTERAPIA".** `Blog.moreIn` is "Więcej o {category}", which governs the locative in
Polish, and it was being handed the category title in the nominative. Wrong on all five service pages
carrying the block. ICU has no declension, so `Blog.categoryLocative` now carries an explicit form
for each of the four slugs (fizjoterapii, masażu, treningu, dietetyce) keyed by **slug** rather
than title, because the slug is what routes there and survives an editor renaming the category. A
category added later falls back to its title, which is exactly what every category got before.

Verified: "Więcej o fizjoterapii", "Więcej o treningu", "Więcej o dietetyce".

**English is deliberately untouched.** `en.json` has no `categoryLocative`, so it takes the fallback
and renders "More on fizjoterapia": the Polish title, because the Payload `Categories` collection is
not localised. That is a real gap, but the fix is localising the collection, not patching one label
into disagreeing with the archive page it links to.

### Two things that only break on a real phone (2026-07-28)

Both reported with screenshots from an actual handset, and both are below the 485px floor that
headless Chrome will render, which is why the earlier nine-width sweep did not catch them. Neither
was a page-level overflow: `scrollWidth` equalled `clientWidth` throughout. They were an element
escaping its own section and a flex rule that only misbehaves at one slide per view.

**"Przyjazna przestrzeń" was climbing out of the top of its section.** The card was `absolute`,
anchored to the photo's bottom edge so it could only grow upward, which the component's own comment
called structurally safe. It is safe *downward*. At 360 CSS px the card's content is far taller than
a 4:5 photo, so it grew up and out: the heading ended up above the photo entirely, over the news
carousel above it.

Anchoring cannot fix that, because at that width the card genuinely needs more height than the photo
has. So below `sm` the photo and the card are simply **stacked**, and the overlay comes back from
`sm` up where it fits. Measured: at 485 and 529 the card's top equals the photo's bottom and
`overlaps` is false; at 669, 1049 and 1469 it overlaps as designed.

**The testimonial slides were 85% wide with their content flung apart.** Two separate faults in one
class list:

- `flex-[0_0_85%]` left 15% of the next slide hanging off the right edge as a sliced column
- `justify-between` on a flex column whose height comes from the **tallest** slide in the track. The
  homepage's longest testimonial is 617 characters and its shortest 69, a ninefold spread, so a
  short quote got its quote mark at the very top, its text floating in the middle and its name
  pinned far below. That is the "strangely large padding".

Now full width below `sm` with the three parts grouped and centred, and `justify-between` kept from
`sm` up where several slides share a row and their heights are close. Measured: 485x506 at a 485
viewport, 335x710 at 669, 262x930 at 1049. The box is still as tall as the longest quote, because
that is how a flex track works, but nothing floats apart inside it.

Overflow re-checked after both changes: **0px at 485, 529, 669, 769, 1049, 1369 and 1889.**

**The lesson for next time:** a nine-width sweep that only reaches down to 485 is not a phone test.
The two faults here were a fixed aspect ratio meeting content that outgrows it, and a `justify`
rule whose correctness depends on how many slides are visible. Both are things to reason about at
360px even when nothing can render it.

### The homepage: RWD, media weight, lazy loading and structured data (2026-07-28)

Four separate jobs on `/`, all measured rather than eyeballed.

#### The one real layout break

Swept nine viewport widths for horizontal overflow. Eight were clean; **at 629px the page was 7px
wider than the viewport**, and the cause was the service grid.

It went two-up at `sm` (640px), which made each tile 289px wide while the label renders at 39.5px,
so the single word "Fizjoterapia" needed 252px in a 225px box and spilled out. "Akademia
szkoleniowa" was 64px over.

**The reference goes two-up at 1060, not 640.** Its own tile carries `ul:w2-2 ho:w1-2`, and its
stylesheet's media bands stop at 1059 (`640-779`, `780-919`, `920-1059`), so `ho` is 1060 and up.
Changed to `wide:grid-cols-2`, which is this project's 1060 token. After it, `scrollWidth` equals
`clientWidth` at 489, 629, 669, 769, 1029, 1069, 1329, 1469 and 1889.

**A measurement trap worth knowing:** the grid was flipping to two-up at a *reported* 629px because
media queries evaluate against the full viewport while `clientWidth` excludes the scrollbar gutter.
629 + 15 = 644, which is over 640.

Two smaller findings left alone, both measured: the mobile drawer's list is 24px wider than its box
(inside `overflow-y-auto`, so it scrolls internally and never touches the page), and a mega-menu
link is 14px over its column between 1340 and 1360 (inside `overflow-hidden`).

#### Media weight: 9MB down to 1.3MB on a phone

The homepage was pulling **8388KB of video** plus 1.4MB of images. The video was 1280x720 h264 at
3459 kb/s **with an audio track** that the muted, decorative player never used.

| | before | after |
|---|---|---|
| video, phone | 8388KB | **734KB** |
| video, desktop | 8388KB | 1736KB |
| first-load transfer, 489px viewport | ~9MB | **1305KB** |
| first-load transfer, 1469px viewport | ~9MB | 2586KB |

`scripts/optimize-hero-video.mjs` produces the four encodes and the poster, using the
`@ffmpeg-installer/ffmpeg` binary `compress-media.ts` already depends on, so nothing was added to
the stack. Audio stripped, CRF-based bitrates, `+faststart` so playback can begin before the file
finishes:

- 1280px VP9 1736KB and h264 2800KB
- 720px VP9 733KB and h264 836KB, picked by `media="(max-width: 640px)"` on the `<source>`
- poster 17KB WebP

The original footage is kept as `public/videos/hero-source.mp4` and gitignored: it is only an input
to the script. Net effect on the repository is **3.85MB smaller**, since the 8.4MB file it replaces
was tracked.

#### Every `sizes` is now a measured number

Each image's rendered width was read out of the live page at 489, 1069, 1469 and 1889 rather than
guessed:

| image | rendered | was | now |
|---|---|---|---|
| service tile | 391 / 437 / 623 / 623 | `(min-width: 640px) 50vw, 100vw` | `(min-width: 1440px) 624px, (min-width: 1060px) calc(50vw - 96px), calc(100vw - 96px)` |
| team | 457 / 471 / 656 / 656 | `(min-width: 1024px) 50vw, 100vw` | `(min-width: 1440px) 656px, (min-width: 1024px) calc(50vw - 40px), calc(100vw - 32px)` |
| friendly-space, movement-tool, newsletter-bg | full width at all four | `100vw` | unchanged, confirmed honest |
| partner logos | 180 at all four | `180px` | unchanged, confirmed honest |

The 96px on a tile is the container padding plus the tile's own `p-8` on both sides. Plain `50vw`
claimed 944px for the team photo at a 1889 viewport, a third more than it uses.

#### Lazy loading with blur placeholders

The blog gets its `blurDataURL` from Payload. The marketing pages have no CMS, so
`scripts/generate-blur-placeholders.mjs` renders each `public/images/home` file to a 16px-wide WebP
at quality 30 and writes `src/lib/static-blur.json`: **18 entries, 195 bytes each, 3.4KB total**.

`src/lib/static-blur.ts` exposes `blurFor` and a spreadable `blurProps`, and is **for server
components only**. `FullBleedVideo` is a client component, so the homepage reads the poster's
placeholder on the server and hands it over as a prop; importing the map there would have shipped
all 3.4KB to every visitor.

The video now behaves like a lazy image: `preload="none"`, the poster paints first with its blur
underneath, and an `IntersectionObserver` with `rootMargin: "100% 0px"` attaches the sources one
viewport ahead. `prefers-reduced-motion` and `navigator.connection.saveData` both leave the poster
in place and fetch no video at all.

**Stated plainly:** the video section is second on the page, so on a phone it is inside that
one-viewport margin immediately and still loads on first paint. The lazy attach is what protects
everything further down; at a 489px viewport all eighteen images together came to 169KB.

#### SEO

Already in place before this and left alone: canonical, `hreflang` for both locales, the RSS
alternate, Open Graph and Twitter tags, and a sitewide `HealthAndBeautyBusiness`.

What changed:

- **The meta description was 307 characters**, being `Statements.balancedFitnessBody`, on-page copy
  doing metadata's job. Google truncates around 155, so it was cut mid-sentence.
  `Hero.metaDescription` is 151 and every fact in it comes from the page: the six services, the
  balanced-fitness statement, the footer's Poznań address.
- **The default Open Graph image was a 2100x1300 WebP.** Facebook, LinkedIn and X all document
  1200x630, and some scrapers still refuse WebP outright. Now `public/images/og-default.jpg`, 96KB,
  with `og:image:width`, `og:image:height` and `og:image:alt` declared so a scraper can lay the card
  out without fetching the file.
- **`WebSite` and an `ItemList` of six `Service` entries**, both hanging off the business by `@id`
  so a crawler does not read them as separate organisations. Verified: two JSON-LD blocks on the
  page, both valid JSON, types `HealthAndBeautyBusiness` and `WebSite` + `ItemList`.

**No `SearchAction`.** The sitelinks searchbox needs a URL that takes a query string, and the only
search here is the blog's client-side filter, so declaring one would be a claim that does not hold.

Regenerating the OG card after the source photo changes:

```
node -e "const s=require('sharp');s('public/images/home/friendly-space.webp').resize(1200,630,{fit:'cover'}).jpeg({quality:82,mozjpeg:true}).toFile('public/images/og-default.jpg')"
```

### The accordion's desktop pill was showing on phones too (2026-07-28)

Reported with a screenshot of `/masaz`: the therapists' names wrapping onto two lines and running
straight across the "DOWIEDZ SIĘ WIĘCEJ" button.

**Root cause, and it is a trap worth remembering.** `cn` in this project is a plain
`classes.filter(Boolean).join(" ")`, **not** `tailwind-merge`, so conflicting utilities both reach
the class attribute and the stylesheet's own order decides which wins. `buttonClasses` starts with
`inline-flex`; the pill added `hidden ... lg:inline-flex` beside it; and the unprefixed
`inline-flex` beat the unprefixed `hidden`.

So the pill rendered at **every** width. Measured at a 485px viewport: `display: flex`, 228px wide,
sitting next to the mobile chevron and squeezing the row title down to 145px, at which point long
Polish names wrapped and spilled over the button.

The show/hide now lives on a **wrapper** span with no competing display utility, which makes it
order-independent. Measured after the fix:

| | 485px | 1169px |
|---|---|---|
| row title | 303px, one line | 303px |
| pill | `display: none` | `display: block`, 228px |
| chevron | visible, 32px | `display: none` |

The title also gained `break-words`, because `min-w-0` on its own lets a single long word spill out
of the shrunken box rather than wrapping inside it.

**This also revises yesterday's note about the 32px overflow.** That was a symptom of the same bug:
the invisible-by-intention pill was taking 228px, so the title's min-content plus the chevron could
not fit. `min-w-0` was the right fix for the flex behaviour, but the pill was the actual cause.

Checked the rest of the codebase for the same collision: this was the only case. Every other
`hidden` is paired with a **prefixed** counterpart (`nav:block`, `wide:grid`, `wide:hidden`), and a
prefixed utility is emitted after the unprefixed ones, so those win in their own range. The trap
only bites when two **unprefixed** display utilities meet in one `cn` call.

### The page could be dragged sideways on a phone (2026-07-28)

Reported as "something goes out of alignment on phones", and it was real, though not where it
looked. **Two separate causes, and one of them was my own measurement.**

**The page had genuine horizontal overflow.** The mobile nav drawer is `fixed inset-0` and, when
closed, sits off-screen at `translate-x-full`. A fixed element is not clipped by any ancestor's
overflow, so it added scrollable width to the document: measured at a 485px viewport,
`scrollWidth` was **517 against a `clientWidth` of 485**. On a phone that means the whole page can
be dragged sideways into dead space. Fixed with `overflow-x: clip` on `html`.

`clip` rather than `hidden`: `hidden` on the root turns the viewport into a scroll container, which
is what breaks `position: sticky` descendants. This site's header is `fixed` so either would have
worked, but `clip` refuses the scroll without creating a container.

**The accordion row header overflowed inside the visible area.** The row title is a flex item and
flex items default to `min-width: auto`, so a long name refused to shrink and pushed the
`shrink-0` chevron clean out of `Container`: measured at x=485 with 32px hanging past the edge.
`min-w-0` on the title fixes it.

**It was not only `/masaz`.** Checked nine pages: the overflow was on all of them, because both
causes are in shared components. After the fix, `scrollWidth` equals `clientWidth` on the homepage,
`/masaz`, `/fizjoterapia`, `/cennik`, `/kontakt`, `/trening-grupowy`, `/bodylab` and `/dietetyka`.
`/blog` still reports 509 against 485, but every element involved starts at x=501 or beyond, so it
is the off-screen drawer being measured rather than anything a visitor can see, and `clip` stops it
being reachable.

**A correction worth recording, because it cost time.** The first pass "found" the whole page
overflowing, with headings and buttons sliced down the right edge. That was an artefact: headless
Chrome refuses to go below roughly a **485px viewport**, so `--window-size=390` renders at 485 and
paints it onto a 390px canvas. Everything looked cut because the screenshot was narrower than the
layout, not because the layout was broken. Measure `scrollWidth` against `clientWidth` from inside
the page; do not infer overflow from the edge of a screenshot.

The measurement itself was done by temporarily injecting a script into the layout that writes its
findings to a `data-probe` attribute, read back with `--dump-dom`. Worth knowing, because headless
Chrome cannot otherwise run script for you, and the browser extension cannot resize a window below
Chrome's own minimum.

### Three client-requested tweaks on the massage page (2026-07-28)

All three are deviations from the reference, asked for after looking at the built page, and all
three are opt-in props so no other page moves.

**The treatment photographs no longer touch the section hairlines.** `TextMedia` gained
`imageInset`, which adds `py-6 lg:py-10`. Four of these panels stack on `/masaz` and the reference
lets each photo bleed into the rules above and below it, which reads as cramped when repeated.
Worth knowing for anyone touching this: the padding has to sit on a **wrapper**, because an
absolutely positioned child (`fill`) resolves `inset: 0` against its containing block's *padding
box*, so padding on the positioned element itself moves nothing at all.

**The team statement uses the whole container.** `CenteredBand` gained `headingWide`, which drops
the usual `max-w-4xl`. That cap stops a short statement stretching into a thin line, but the
massage team's sentence is long and was wrapping onto four cramped rows; it is three full-width
rows now.

**Every therapist row opens to the same height.** `Accordion` gained `squareMedia`, which pins the
panel photo to `lg:aspect-square`. Before it, a row was only as tall as its own copy, so Filip
Deskur's one-paragraph bio gave a much shorter panel than Przemysław Górski's two, and
`object-cover` cropped the shorter one's portrait harder. **This is what the reference does**, its
panel media carries `ratio1-1`, so it is closer to the original rather than further from it.

Measured rather than eyeballed: with every row forced open, the three portraits come out **681,
680 and 681 px** tall, identical to a rounding pixel. `/fizjoterapia/specjalisci` is the other
people accordion and has exactly the same problem; it can take the same flag when somebody looks
at it.

### The massage section, and Centrum losing its e-commerce (2026-07-28)

`/masaz` is built, and it is the page where the reference sells things. Centrum is not getting a
shop (the client's call: that belongs on Akademia), so the selling is gone.

**Six buttons removed:** one `UMÓW SIĘ` under the intro band and five `KUP TERAZ` across the four
treatment panels, including the two Kobido variants with their durations. All six were JS-driven
WooCommerce add-to-cart handlers with **no `href` at all**, so there was no destination to preserve
even if we wanted one. Nothing replaces them, because the section directly below already tells a
visitor how to book: call reception, and the phone number is right there.

**The client believed massage was the only page with e-commerce. It was not.** Seven more buy or
sign-up buttons were already built into the site, all pointing at the old WordPress shop:

| Page | Button |
|---|---|
| `/fizjoterapia` | `bandSignUp` to `/zakupy/fizjoterapia/` |
| `/trening-grupowy` | `planSignUp` to `/zakupy/plan-zdrowej-zmiany/` |
| `/trening-grupowy/plan-zdrowej-zmiany` | `bandCta` and `detailsCta`, same target |
| `/trening-personalny` | `assessmentCta`, "Kup teraz 169,-" |
| `/trening-personalny/ocena-funkcjonalna` | `bandCta` to `/zakupy/ocena-funkcjonalna/` |
| `/trening-personalny/trening-indywidualny` | `assessmentSignUp`, same target |
| `/fizjoterapia/zdrowy-brzuch` | two `formats[].href` shop links on the pricing cards |

All are gone, along with the ten message keys they used, and `Format` lost its `href`. Every one of
them sat beside either an internal link or copy that still stands on its own, so nothing is
stranded. **One casualty worth knowing:** the personal-training page's button carried the price
("Kup teraz 169,-"), so that figure is no longer on that page. It is on `/cennik`.

`GroupTraining.bandCta` deliberately survives: it labels a different, non-shop button on the same
page. Verified: zero mentions of `zakupy`, `kup teraz`, `SHOP_` or `add-to-cart` anywhere in `src`
or `messages`, and zero in the rendered HTML of all ten affected pages.

#### Building the page

The structure maps onto components that already existed, which is the point of the reuse rule:
`PageHero`, `CenteredBand`, `TextMedia`, `Accordion`, `TestimonialCarousel`, `NewsletterSignup`.

**The four treatment panels do not alternate.** Every one has the text column first and the
photograph second. That came from the reference's own markup, where all four carry identical
wrapper classes (`ul:w2-2 ho:w1-2` on the text column), not from a screenshot. Worth writing down,
because most other section pages here *do* alternate and copying that pattern would have been the
obvious mistake.

Copy was extracted from the mirror programmatically rather than retyped, so the Polish is verbatim.
The therapists' specialities are a line above each bio, matching the reference's single `<p>` with
`<br>` pairs inside it; `PanelText` already renders `whitespace-pre-line`, so the breaks survive.
English is a real translation, shape-checked key path by key path against the Polish.

The ten content images were copied from the mirror **capped at 2560px wide**, the same limit the
Media collection applies to uploads. Earlier sections copied theirs untouched, which is why
`fizjoterapia/hub-zespol.webp` is 6048px and 1.1MB; nothing on this site renders wider than 1376
CSS px, so that is dead weight.

#### Verified against the original

Compared block by block against the served mirror, case-insensitively (the reference bakes
uppercase into its markup; this project stores natural case and applies `text-transform`, which
every other section page already does).

- **53 of 54** non-shop content chunks present, so 98.1% coverage
- **10 of 10** content images
- the four removed shop buttons account for the rest
- the two strings on our page only are a form placeholder attribute and the newsletter's
  off-screen `aria-hidden` honeypot label, both fine

Two things the comparison caught that a screenshot would not have. The therapists' bios were
merged into one blob on the first pass, where the reference breaks two of the three into separate
paragraphs; fixed, and the paragraph counts now match across both locales. And the accordion's
open-state label read `Zwiń` where the reference says `ZAMKNIJ` on **every** accordion it has
(6 on fizjoterapia, 9 on cennik, 13 on zajecia-grupowe), paired with `DOWIEDZ SIĘ WIĘCEJ` which
already matched. That was a pre-existing, site-wide one-word deviation, now `Zamknij` / `Close`.

`ZAMKNIJ` still reads as absent from our HTML, and that one is not a defect: our accordion renders
the open-state label only when a row is open, where the reference ships both and toggles in CSS.

### Post tiles are cropped to 16:9 before they are served (2026-07-28)

The blog tile is 16:9 with `object-cover`. A portrait photograph put in one downloads its **full
height** and lets the browser throw most of it away. Measured across the featured images: **17 of
62 are portrait or square, discarding an average of 51% of their bytes**, the worst 63%. `sizes`
cannot help, because the wasted pixels are height.

A new `cardWide` size (960x540, `fit: cover`) is generated on upload, and every 16:9 tile asks for
it: the listing grid, the category archives, the "read next" block and the service-page teasers.

**Measured, all 62 tiles at 480 CSS px on a 2x screen:**

| | before | after | saved |
|---|---|---|---|
| 12 portrait tiles | 352.9KB | 172.2KB | **180.7KB (51%)** |
| 14 landscape tiles | 240.1KB | 224.2KB | 15.9KB (7%) |
| all 62 | 1440.8KB | 1092.4KB | **348.4KB (24%)** |

Best single case, a 1920x2560 photograph: 69.8KB to 20.0KB. Four landscape tiles came out 100 to
200 bytes *larger*, which is one extra encoding generation showing up as noise.

**No visual change at all**, and that is verified rather than asserted: `object-cover` centres its
crop and so does `fit: cover`, so the pre-crop is the same picture the browser was already
producing. Compared pixel for pixel against a centred browser-side crop, RMSE came out at 1.6 to
1.7 on a 0-255 scale, which is WebP re-encoding noise.

**960x540, not 768x432.** The widest 16:9 tile on the site is the grid's 480 CSS px, which a 2x
screen needs 960 device pixels to fill. The first attempt at 768 would have served a soft tile in
order to fix a heavy one.

**The featured card is excluded** and keeps the uncropped `hero`: on desktop it is `aspect-auto` at
half the viewport width, not a 16:9 tile. Since `visible[0]` is the only card that can ever be
featured, `blogListingData` gives index 0 the hero and everything else the crop, rather than
serialising two images for all 62. When a filter is active there is no featured card and that one
renders as a tile with an uncropped image, which costs a few kilobytes on exactly one card.

`cardWide` is deliberately **not** in `mediaFrom`'s fallback order, so a cropped tile can never
stand in for an in-article or hero image. It also carries a `generateImageName`, because a source
that is already 16:9 makes `card` (768 wide) come out 768x432 too and the two would fight over one
filename.

#### The backfill, and the approach that had to be thrown away

230 media predate the size, and the obvious move is to hand each file back to Payload's own upload
pipeline so it regenerates everything. **Tried on one document first, which is the only reason this
is a footnote instead of an incident.** Payload treated the incoming file as a name collision and
renamed *everything*: `88Sn9tiZS.webp` became `88Sn9tiZS-1.webp` along with all four variants, and
the stored original was deleted. The bytes did not survive either, 68572 in and 66808 out, so it
would also have added a lossy generation to every image in the library.

That document was repaired: files renamed back and `filename` plus every `sizes.*` entry restored
to match the pre-change dump, verified field by field. The pixels lost to the one extra encode are
not recoverable, but the mirror holds a copy one generation *cleaner* than what was stored
(58596 bytes against 68572, our own import having made it bigger), so nothing of value went.

`scripts/backfill-image-sizes.ts` instead produces the crop with sharp and registers it with
`payload.update`, which does accept writes to the generated `sizes` group. That was probed on one
document before anything relied on it. No file is renamed and no original is re-encoded. 218
written, 12 too small to bother, 0 failures. `DRY=1` to preview, `ONLY=<id>` for one document,
`FORCE=1` to redo.

#### Worth a decision: two tiles are badly centred, today

Looking at all 17 portrait crops as a contact sheet, two are poor, and **both are poor on the live
site already** for the reason above:

- one lifting photograph has the man's **head cropped off** above the frame
- an infographic of organ icons loses its top and bottom rows, so the grid reads as broken

`fit: cover` with sharp's `attention` strategy would keep faces in frame, and Payload's focal point
(already enabled) would fix them one by one. Both change how images are cropped across the site,
which is a visual decision rather than a defect fix, so it is not taken here.

### The SEO panel now shows what it will produce, and noindex actually works (2026-07-28)

The client asked a second time why the SEO fields are blank, which settles it: explaining the
fallback in a field description does not work, because an empty box reads as an oversight no matter
how well it is captioned.

**The fields stay empty on purpose and that has not changed.** They are overrides. Writing the
title and excerpt into them would give an editor two places to keep in step, and editing the
excerpt would silently stop affecting search results. What was missing was any sign of the result.

**"Podgląd w wyszukiwarce"** now sits at the top of the Metadane group: a live search-result
snippet built from the same fallbacks the public site uses, plus which field each line came from,
a character count, and a warning past roughly where Google truncates. Under the two text fields,
a one-line hint prints the value a blank field will inherit and disappears once anything is typed.
`admin.placeholder` in Payload is a static string, so it cannot show the document's own title.

The fallbacks were checked against `src/app/[locale]/blog/[slug]/page.tsx` rather than assumed:
`meta.title || localised.title` and `meta.description || localised.excerpt`. The preview would be
worse than useless if it disagreed with the page.

**And it turned up a real bug.** `meta.noIndex` was a **dead checkbox**: nothing anywhere read it,
so an editor could tick "Ukryj przed wyszukiwarkami" and the post carried on being indexed. A
control that lies about what it does is worse than no control. It is now honoured in
`pageMetadata` (as `index: false, follow: true`, since the point is to unlist the page rather than
strand what it links to) and in `src/app/sitemap.ts`, because listing a noindex URL in a sitemap
hands crawlers two contradictory instructions.

Verified live: ticking it put `<meta name="robots" content="noindex, follow">` in the head and
dropped the post from the sitemap; unticking restored both.

**Scope, stated plainly:** this covers blog posts. **No route reads the `pages` collection** yet,
so a Page document's Metadane group, `noIndex` included, is not read by anything. The Centrum
pages are static routes carrying their own metadata.

**Not verified visually:** there is no admin account on this install, so the three components have
never been seen rendered. That is why they are read-only and why the hints go through
`admin.components.afterInput` rather than replacing the inputs: a component that only reads cannot
break saving, validation or versioning.

### Blur placeholders were a fifth of the listing's HTML (2026-07-28)

`/blog` filters client-side, so **every** post's data is serialised into the page. A
`blurDataURL` is a base64 data URI of a few hundred characters, and 61 of them were shipping to
paint ten cards: **28.1KB of the raw HTML and 20.7KB gzipped, 39% of the document**. Base64 is
close to incompressible, so gzip does not rescue it, and unlike an image it sits on the critical
path.

`withFirstPaintPlaceholders` in `src/lib/blog-listing.ts` keeps them only for cards the first
paint actually shows: the featured card, which is the LCP candidate, plus the grid rows that
render on the server. Deeper pages keep more, because more of the grid is server-rendered.

| | raw | gzipped |
|---|---|---|
| `/blog` before | 183.7KB | 53.1KB |
| `/blog` after | 159.2KB | **36.3KB** |

Everything below the fold is lazily loaded into a container that already carries a tinted
background, and by the time it scrolls into view the browser has had the network to itself. A
filtered listing can pull a later card into view with no placeholder; it fades in without a blur
rather than breaking.

Category archives were measured and left alone: four cards and 3KB of placeholders, all near the
top of the page, so there is nothing to win.

**Counting note:** each placeholder appears **twice** in the HTML, once in the serialised props
and once as the rendered SVG blur filter. 13 placeheld images on page two read as 26 occurrences.

### Three image optimisations that were measured and rejected (2026-07-28)

Worth recording so nobody spends the afternoon on them again. All three were plausible and all
three are dead.

**AVIF encoder effort buys nothing.** Next encodes AVIF at `quality: requested - 20, effort: 3`
(so `q=75` is really quality 55), and sharp supports effort up to 9. Effort does not change
quality, only how hard the encoder searches, so it looked like free bytes. Measured on a 1440px
encode: effort 3 gives 123053 B, effort 9 gives **124805 B**, slightly *larger*, and encode time
goes from 200ms to 6.6s.

**Feeding the optimizer the original instead of the `hero` variant is worse.** One image
suggested a 7.7% saving at 960px, which turned out not to be representative. Across all 150
in-article images at their real slot widths: hero source 5.58MB, original source 5.66MB, so
**1.4% larger**, smaller in only 12 of 150. The visual difference between the two is a mean RMSE
of 1.84 on a 0-255 scale, which is nothing.

**There are no duplicate-width variants on disk.** `withoutEnlargement` produces variants named
at the source's own width, which looks like it should leave `hero` and `content` as byte-identical
copies of a small original. Checked all 998 files in `media/`: **zero** duplicates. Payload does
not write a variant that would not be a resize.

### The width ladder had no rung for the widths we actually render (2026-07-28)

The client asked whether a browser is still dragging down a 3000px file. It is not, and has not
been: `sizes` tells the browser the rendered box and it picks from `srcset`, so the 720px slot on
a post pulled **48.6KB** at 1x while the stored 2560px original (310KB) was never requested.

But the measurement turned up a real leak next to it. Next's default width ladder is
640/750/828/1080/1200/1920/2048/3840 and **none of those match this site's own display sizes**, so
browsers were rounding **up** to the next rung and paying for pixels nobody sees. A 720px slot on
a 2x screen needs 1440 wide, the nearest candidate was 1920, and it downloaded **202.7KB** where
the 1200 rung is 96.8KB.

`imageSizes` in `next.config.ts` now carries the exact 1x and 2x widths of the ladder in
`src/lib/image-display.ts`: **480 and 1376** for 1x, **960 and 1440** for 2x. Measured on that
same image, 1440 delivers **122.4KB instead of 202.7KB**.

Three widths were deliberately left out. **2752** (1376 at 2x) because uploads are capped at
2560, so the optimizer would clamp the request straight back down and return identical bytes.
**720 and 1024** at 1x because 750 and 1080 already cover them to within 5%, which does not earn
another candidate in every `srcset` on the site.

They belong in `imageSizes` and not `deviceSizes` because Next filters candidates for `vw`-based
images against `deviceSizes[0]`, and dropping that floor from 640 to 480 would pull tiny widths
into every card grid. Both lists are merged for fixed-px `sizes` like ours, so nothing is lost.

Measured across **all 150 in-article images**, not a sample:

| | before | after | saved |
|---|---|---|---|
| 1x screen | 3212.7KB | 2858.5KB | **354.3KB (11%)**, 70 images changed |
| 2x screen | 6288.9KB | 5609.9KB | **679.0KB (11%)**, 74 images changed |

The cost is three more candidates per `srcset`: **+1541 bytes raw per post page, +106 gzipped**.
Nothing about the images themselves changes, so there is no visual difference to check.

An earlier sample of 14 posts showed only 6% and none of the 720px slots, which is why the
distribution was worked out from the database instead: 70 images land on 480, 37 on 720, 32 on
1024, and 11 keep their own width. The 37 on 720 are where the 40% saving lands.

**Not done, because it trades sharpness:** at the 1440 rung, quality 70 gives 96.3KB against
122.4KB at the default 75, another 21%. AVIF at 70 is usually indistinguishable on photographs,
but the client's complaint that started this work was images looking soft, so cutting quality is
their call to make and not one to slip in quietly.

### Image width syncs between Polish and English (2026-07-28)

A translation renders a picture at the width the Polish version chose, so the two languages
cannot end up disagreeing about how big a photograph is. **Unless the translation puts a
different file in that slot**, in which case that file keeps its own size, which is the client's
own rule and the sensible one.

Matching is **by media id, not by position**, so reordering paragraphs in a translation does not
shuffle the sizes. Where the same file appears twice in one article at different widths, the
entries pair up in document order rather than the first choice winning both times.

Polish is the source of truth in one direction only. Changing a size on a translation never
affects the Polish page, which matches the rest of the design: a translation starts as a copy of
the Polish body and text is what an editor changes.

Verified both ways: setting the Polish image to `Duża` made the English page render at 1024px
while its own field still said `auto`, and `scripts/smoke-image-display.ts` covers the rules with
12 checks, including the different-file case, the repeated-file case, and that no choice ever
upscales.

### Image width is now an editor's choice, and the paragraph gaps never worked (2026-07-28)

**A display width per image, chosen in the panel.** The upload node carries a `Szerokość na
stronie` select (`UploadFeature` with a per-collection field), so an editor picks Mała 480,
Średnia 720, Duża 1024 or Pełna szerokość. Nothing is ever stretched past the file's own
resolution, so picking a size larger than the file changes nothing.

**"Automatycznie" is the default and works it out from the file.** It takes the largest step that
fits inside **half** the file's width, because doubling the displayed width is what a 2x screen
needs to look sharp. The tablecloth photograph the client flagged is 1024x702 and was rendering
at 1024px, so on a retina display it had one device pixel per two it needed. It now renders at
480px and is crisp. Across all 150 in-article images: **106 are now sharp at 2x**, 70 land on
480px, 37 on 720px, 32 on 1024px, and 11 keep their own width because even 480 would upscale
them. The remaining 44 cannot be fixed at any size; the pixels are not in the files.

**The paragraph spacing rule had never applied.** `.blog-prose > * + *` requires direct children,
and Payload's `RichText` wraps the body in its own `.payload-richtext` div, so every article's
paragraphs were grandchildren and the 1.5rem gap matched nothing. Articles rendered as one
unbroken block of text. This is worth flagging because it was mistaken for a content problem:
the "15 posts with no subheadings look like a wall of text" note is partly this bug.

Images also get 3rem above and below, as descendant selectors so the wrapper cannot break them
again, which fixes the photograph sitting flush against the text on both sides.

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

**Editing it is one click from the post.** A panel at the top of every blog post in the admin
says whether an English version exists and whether it is live, with a button that opens the
translation or starts a new one. Nobody has to find the right document among sixty.
`src/components/admin/EnglishVersionPanel.tsx`, wired as a `ui` field on Posts.

**A translation starts as a copy of the Polish body, images and all.** The first one written
here did not, and the article's photograph vanished from the English version: the Polish body has
an `upload` node after the fifth paragraph and the English one was nine paragraphs and nothing
else. A `beforeValidate` hook on the collection now copies the Polish content into a new
translation, so an editor overwrites text in place and never has to re-insert a picture. The
example was rebuilt the same way, by cloning the tree and swapping only the text blocks, and it
fails loudly if the number of paragraphs does not line up rather than quietly dropping one.

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

