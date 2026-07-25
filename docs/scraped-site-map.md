# Scraped site map — Centrum reference mirror

> What `scripts/scrape/scraped/` contains and which live URL each folder mirrors. Written in English. Regenerate the mirror with `scripts/scrape/run_scrape.bat`; this describes its shape as of 2026-07-25 — re-verify against the live mirror if something looks off after a re-scrape.

## What this is

`scripts/scrape/scraped/` is a local, gitignored mirror of `https://bodywork.testowe.eu/` — the client-supplied Centrum design reference, itself built in a page-builder tool rather than hand-authored (PRD §6.2). It is **reference only**: never imported or served by the Next.js app. Read it to understand copy/structure, then hand-build the equivalent as native React/Tailwind — don't embed or copy its HTML.

## How to browse it

```bat
scripts\scrape\serve_mirror.bat
```
then open `http://localhost:8765/<slug>/`. Do **not** open the HTML files via `file://` — fonts and `/assets/...` paths break.

## Folder structure

| Path | What it is |
|---|---|
| `index.html` | Homepage HTML (raw, unrewritten) |
| `<slug>/index.html` | One folder per page, named after its URL slug |
| `<slug>/media/` | Images used on that page |
| `assets/{css,js,fonts,images,vendor}/` | Site-wide static assets |
| `content/<hash>/` | Page-builder content fragments (the reference site is built in a page-builder, not hand-authored HTML — PRD §6.2) |
| `content/_autors/`, `content/_news/`, `content/_products/` | Builder collections for authors, news items, and WooCommerce products |
| `_shared/assets/`, `_shared/content/` | Assets/content reused across multiple pages |
| `_meta/manifest.json` | Scraper's own resume/progress log (which URLs were fetched) — not page content |
| `_meta/errors.log` | Pages/assets the scraper failed to fetch — check after a fresh scrape |

## URL → folder map

Source of truth for the full URL list: `scripts/scrape/sitemap.xml` (40 PL URLs as of 2026-07-25 — **no `/en/...` URLs exist**, see [`i18n.md`](./i18n.md)).

| Live URL (under `bodywork.testowe.eu`) | Local folder | Notes |
|---|---|---|
| `/` | `index.html` (+ `home/`) | Homepage: hero video, News carousel, philosophy sections, 6 service tiles, team, testimonials, contact/CTA, newsletter, partners, footer, sticky promo-bar |
| `/trening-personalny/` | `trening-personalny/` | + `trening-indywidualny/`, `trening-w-parze/`, `ocena-funkcjonalna/`, `trenerzy/` |
| `/fizjoterapia/` | `fizjoterapia/` | + `terapia-manualna/`, `rehabilitacja-ruchowa/`, `zdrowy-brzuch/`, `specjalisci/` |
| `/trening-grupowy/` | `trening-grupowy/` | + `zajecia-grupowe/`, `plan-zdrowej-zmiany/`, `medicover/`; `grafik-zajec/` is an outbound link to eFitness, not a content page |
| `/dietetyka/` | `dietetyka/` | + 2 dietitian profiles: `iwona-stachowiak/`, `magdalena-hajduk-warchol/` |
| `/bodylab/` | `bodylab/` | + `technologia-vald/`, `analiza-skadu-ciala/` |
| `/cennik/` | `cennik/` | Pricing table |
| `/masaz/` | `masaz/` | |
| `/blog/` | `blog/` | + one folder per post (62 posts mirrored as of 2026-07-25) |
| `/kontakt/` | `kontakt/` | |
| `/polityka-prywatnosci/`, `/regulamin/`, `/cookies/` | matching folders | Legal pages — build as HTML pages, not PDFs (PRD §4/§8.4) |
| `/instrukcja/`, `/test/`, `/podziekowanie/` | matching folders | Utility/thank-you pages — confirm with the client whether these carry over (PRD §13 Phase 0: "which pages carry over, disappear, or merge") |
| `/zakupy/<product>/` | `zakupy/<product>/` | 9 WooCommerce product pages (masaż variants, ocena funkcjonalna, plan zdrowej zmiany, fizjoterapia, zdrowy brzuch). These map to the future shop data model (`CourseEditions`/`Products`, PRD §10.2), not to hand-built Centrum content routes — don't build them as static pages. |

Blog posts aren't enumerated one-by-one here — list them with `ls scripts/scrape/scraped/blog/` or read `sitemap.xml`. They share one template; see [`migration-tracker.md`](./migration-tracker.md).

## Using real media assets

The raw HTML/CSS/JS mirror stays reference-only (per "What this is" above) — but each page's `<slug>/media/` folder is a flattened, conveniently-named set of every image *and video* that page actually uses, including shared assets like the logo, favicons, and social icons (confirmed on both `home/` and `cennik/`, so this generalizes). These are real BODYWORK assets — the client's own photos/video/logo — not template placeholders, and per the standing rule in `CLAUDE.md` they get used for real, not swapped for gradients:

1. Find the asset in `<slug>/media/` by the hash filename referenced in that page's `index.html` (`<img>`/`<source>`/`<video>` tags) — e.g. `884eC2Yfh.webp`. Ignore the `__<hash>`-suffixed duplicates in the same folder; they're byte-identical copies.
2. **Check for a `<video>` tag before assuming a section has no media** — the homepage hero's `<picture>` fallback had an empty `src` in the scrape (capture failure), which looks like "no image," but the real background was a `<video autoplay loop muted playsinline>` a few dozen lines later in the same section, sourced from a file that *did* copy correctly.
3. Copy the single best-quality version into `public/images/<page>/` or `public/videos/` with a descriptive filename, and commit it — unlike the mirror itself, these copies are real project assets, not regenerable reference output.
4. Photos: render with `next/image` (not a plain `<img>`), with a `sizes` attribute matching the component's actual rendered width at each breakpoint. Next.js's built-in optimizer (sharp) generates resized/format-converted (WebP/AVIF) variants on demand from that one source file — don't pre-generate multiple sizes yourself.
5. Video: Next.js has no built-in video optimization pipeline — it's served as a plain static file from `public/videos/`. The scraped hero video is ~8.2MB, uncompressed for web delivery; re-encoding it needs `ffmpeg`, which isn't installed on this machine — ask before installing it.
6. SVG logo/icons: a plain `<img>` (with an `eslint-disable-next-line @next/next/no-img-element` comment) is fine — they're vector, so `next/image`'s raster optimization doesn't apply.

## Brand colors — confirmed exact values, don't re-guess them

The reference is built with an atomic-CSS page-builder engine (ErgoCSS — see `assets/js/ergocss.js`) whose numbered utility classes (`bgc1`, `c2`, etc.) map to fixed hex values. Found by grepping `assets/css/auto.css` for `.bgc1{`/`.c1{` etc. (the file is minified to one line, so read it with `grep -oE`, not the file-reading tool):

| Class | Hex | Use on the reference |
|---|---|---|
| `c1` / `bgc1` | `#001e3d` | Navy — body text, buttons, mobile nav drawer bg |
| `c2` / `bgc2` | `#f9f7f0` | Cream — **the page background almost everywhere**; `bgcw` (pure white) has zero matches on the homepage, `<main>` itself carries `bgc2`. Don't assume alternating white/cream sections without checking. |
| `c3` / `bgc3` | `#2c8657` | Green — used only for the "Akademia szkoleniowa" CTA (header utility bar + mobile floating pill), not a general accent |

These are wired up in `src/app/globals.css` as `--brand-navy`, `--brand-surface`/`--background` (both cream), and `--brand-green`.

## Breakpoints — the reference uses several, don't collapse them into one

Its class prefixes are breakpoint prefixes. Which viewport range each maps to isn't guessable from the name — find it by locating the `@media` block that contains that prefix's rules in `assets/css/auto.css`:

| Prefix | Range | Gates |
|---|---|---|
| `us:` | ≤ 639px | small-phone tweaks |
| `ul:` | ≤ 1059px | mobile/tablet type sizes |
| `ho:` | ≥ 1060px | **desktop type scale**, header row 2, desktop-vs-floating Akademia button |
| `ug:` | ≤ 1339px | hamburger-only header |
| `eo:` | ≥ 1340px | **full nav row** (links + social icons), mega-menu instead of the drawer |
| `xo:` | ≥ 1480px | roomier nav-link padding (`ph3` instead of `ph2`) |

Encoded here as `--breakpoint-nav: 1340px` and `--breakpoint-wide: 1060px` (plus an inline `min-[1480px]:` for the padding step). **The nav switch must not be lowered to Tailwind's `lg`/1024px**: the eight nav labels plus the brand slot, hamburger, icons and locale pill need ~1340px, and anything lower makes the nav overflow — which is exactly why it must be a separate breakpoint from the type-scale switch at 1060px.

## Type scale — verified, don't invent sizes outside it

Extracted from the reference's own `assets/css/auto.css` (its page-builder emits atomic classes like `f12s5`; breakpoint-prefixed variants like `ho:f12s5` live inside media queries, so grep for the **prefixed** form or you'll conclude the class doesn't exist). Encoded as `--text-*` tokens in `src/app/globals.css` — use those, not ad-hoc Tailwind tiers.

| Token | Reference class | Size / line-height | Used for |
|---|---|---|---|
| `text-label` | `f2.25` | 0.7934rem / 1.125rem | nav links, small caps labels, testimonial attribution |
| `text-btn` | `f2.5s2` | 0.8815rem / 1.125rem | button labels (+ `tracking-[0.1em]`, uppercase) |
| `text-body` | `f3.125s3` | 1.1019rem / 1.53125rem | **every body paragraph on the site** |
| `text-partner` | `f3` | 1.1278rem / 1.5rem | "NASI PARTNERZY" label, mobile nav items |
| `text-value` | `f4` | 1.4104rem / 2rem | footer contact values (mobile) |
| `text-value-lg` | `f6s4` | 2.1157rem / 2.5rem | footer contact values (desktop) |
| `text-h-menu` | `f6s3` | 2.1157rem / 2.25rem | mega-menu column headings |
| `text-h-tile` | `f7s3` | 2.4683rem / 2.5rem | service tile headings |
| `text-h-mobile` | `f7s4` | 2.4683rem / 2.75rem | every section heading below `lg` |
| `text-statement` | `f7s6` | 2.4683rem / 3.25rem | the oversized opening-statement paragraph |
| `text-h-sub` | `f9s5` | 3.1735rem / 3.5rem | "Poznaj opinie naszych klientów:" |
| `text-h-hero` | `f12s4` | 4.2313rem / 4rem | hero + newsletter headings |
| `text-h-section` | `f12s5` | 4.2313rem / 4.25rem | standard section heading, desktop |
| `text-h-display` | `f50` | 17.6305rem (clamped) | NEWS, KONTAKT |

Three things that are easy to get wrong and were wrong here before being checked:

1. **Headings are font-weight 400, not bold.** They carry no `fw*` class, so they inherit the body weight (Circular Pro Book / regular). Nav links are `fw3` (300).
2. **Headings have no letter-spacing.** Their markup shows `ls-0.025em`, but that class **is not defined** in the stylesheet — it's a no-op. Don't add `tracking-tight`.
3. **The scale is far more uniform than it looks.** Nearly every section heading is the same `f12s5` (~68px desktop / ~40px mobile) — including ones that look smaller in screenshots because their container is narrow. If a heading wraps where the reference keeps it on one line, widen the container rather than shrinking the type.

**An `X` prefix on a class means "disabled" in this page-builder** (`Xho:f50`, `Xmiw256px`, `Xmaw200`) — the class is emitted but never defined, so it does nothing. Don't read `Xho:f50` as "this heading is 282px".

That matters most for `f50`: on the display headings **every** size class is `X`-prefixed, so the size comes purely from the `dynamic-header` script, which fits the text to the container on one line (hence the inline `font-size: 255px` on the homepage's four-letter "News"). The size therefore depends on how long the text is. `SectionHeading`'s `display` size reproduces this in CSS — a query container plus `min(calc(100cqw / <chars> * 1.7), 17.6305rem)`. A fixed size cannot work here: at the cap, a 19-character page title renders ~282px and runs far past the viewport.

## Typography — real fonts are commercial, not yet licensed for reuse

The reference site's `@font-face` rules (`assets/css/auto.css`) name the real typefaces:
- **Circular Pro Book** (Lineto, paid) — main UI/body font
- **Minion Pro** (Adobe, paid) — accent/serif use

Both `.woff2` files exist in the scrape (`assets/fonts/circular-pro/`, `assets/fonts/minion-pro/`), but copying them into this project without confirming BODYWORK holds a webfont license that covers the new domain is a licensing question, not just a technical one — same category as "ask before touching the stack" in `CLAUDE.md`, just for a font instead of a package. Until that's resolved, `src/app/[locale]/layout.tsx` uses Plus Jakarta Sans (`next/font/google`) as a free geometric-sans stand-in — closer to Circular than the previous default (Geist), but not the real thing. Swap it for the licensed Circular Pro files (or a proper Adobe Fonts/Lineto web font link) once that's confirmed. Always load the `latin-ext` subset alongside `latin` for any font used here — Polish diacritics (ą ć ę ł ń ó ś ź ż) need it, and it's easy to silently miss.

## Standing elements — what repeats on every page, and what doesn't

Three things are shared across every reference page: the header, the footer, and a **promo bar**
that is easy to miss because it sits outside the page content.

The promo bar is an `<aside class="pf … z99">` (inline `z-index: 121`) pinned to the bottom-right
corner, holding a vertical stack of two dismissible pills. It is on **every** page, homepage
included — verified across 8 sampled pages. Reproduced as `src/components/centrum/PromoBar.tsx`,
mounted once in the locale layout.

| Pill | Colours | Label | Links to | Dismiss cookie |
|---|---|---|---|---|
| 1 | navy bg (`bgc1`), cream text | "BEZPŁATNE ZAJĘCIA GRUPOWE! ZAPISZ SIĘ JUŻ TERAZ." | `/trening-grupowy/` | `popup1_closed` |
| 2 | cream bg (`bgc2`), navy text | "NOWA EDYCJA PLANU ZDROWEJ ZMIANY / START: 11.05." | `/trening-grupowy/plan-zdrowej-zmiany/` | `popup2_closed` |

Its metrics, resolved from the ErgoCSS classes (the scale is 1 unit = 0.25rem): container
`bottom`/`right` `0.25rem` → `1.75rem` at ≥1060px (`ul:b1 ho:b7`), `min-height: 50vh`,
`pointer-events: none` with `pea` on each pill; pill `border-radius: 25rem` (`br100`),
`margin: 0.75rem` (`m3`), `min-height: 3.5rem` (`mih14`), `padding-inline: 1.75rem` (`ph7`),
`border-width: 1px`; label `f2.5s2` (= `text-btn`) uppercase with `letter-spacing: 0.1em` and
`padding-block: 1.375rem` (`pv5.5`). Dismissal sets a one-year cookie (`max-age=31536000`,
`path=/`) and removes that pill.

**The newsletter block is not global — check per page.** It looks like a standing footer element
but five pages don't have it, and we had wrongly added it to all five:

| Reference page | Newsletter block? |
|---|---|
| `/cennik/`, both `/dietetyka/<dietitian>/`, `/bodylab/technologia-vald/`, `/bodylab/analiza-skadu-ciala/` | **No** |
| every other built page | Yes |

## After building a page: verify it

Once a page/component is built in Next.js, open it side-by-side with the mirror (`localhost:8765/<slug>/`) or the live site and check layout, copy, and imagery match before marking it done in `migration-tracker.md`. The reference is a page-builder template, not final design (PRD §6.2) — note deliberate deviations there rather than silently diverging.
