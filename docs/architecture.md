# Architecture — BodyWork Centrum

> Overview for humans and for the coding agent. Written in English. Keep it short and concrete; update it when the structure changes.

## Overview

Next.js rewrite of the BodyWork Centrum website (physiotherapy, dietetics, massage, personal & group training), built using a scraped mirror of the live site (`bodywork.testowe.eu`) as a content/design reference.

How it works in one paragraph: the Python toolkit in `scripts/scrape/` mirrors the live site's pages, assets, and media into `scripts/scrape/scraped/` (gitignored, regenerable) so the real content and layout are visible locally without depending on the old site staying up. The Next.js app in `src/app/` is the actual product being built, page by page, referencing that mirror for copy/structure but implemented natively in React/Tailwind rather than by embedding the scraped HTML.

## Main modules

| Module | Responsibility | Path |
|---|---|---|
| Next.js app | Pages, layouts, components, routing | `src/app/` |
| Scraper toolkit | Mirrors the live site for reference | `scripts/scrape/` |
| _(fill in as the project grows)_ | | |

## Data flow

Reference mirror (`scripts/scrape/scraped/`) → manually read for content/copy/structure → reimplemented as Next.js pages/components in `src/app/`. The mirror is not imported or served by the Next.js app at runtime; it's a local reference artifact only.

## Key decisions (lightweight ADR)

Record deliberate choices so nobody asks "why is it like this?" a month later.

| Date | Decision | Why |
|---|---|---|
| 2026-07-24 | Stack choice: Next.js 16 (App Router) + TypeScript + Tailwind CSS 4 | Modern React framework, good fit for a marketing/content site with room for future dynamic features (booking, CMS) |
| 2026-07-24 | Kept the existing Python scraper toolkit as `scripts/scrape/`, output gitignored | Preserves the working mirror tool as a content reference without bloating the repo (mirror is ~300MB) |

## Integrations / external dependencies

- **Live site reference:** `https://bodywork.testowe.eu` — source mirrored by `scripts/scrape/scrape_site.py`, listed via `scripts/scrape/sitemap.xml`.
- _(add real integrations — booking system, CMS, forms, analytics — as they're wired in)_
