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

## After building a page: verify it

Once a page/component is built in Next.js, open it side-by-side with the mirror (`localhost:8765/<slug>/`) or the live site and check layout, copy, and imagery match before marking it done in `migration-tracker.md`. The reference is a page-builder template, not final design (PRD §6.2) — note deliberate deviations there rather than silently diverging.
