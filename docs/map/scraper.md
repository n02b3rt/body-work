> Read when: you need the original content or design of a Centrum page, or the mirror needs regenerating.

# Scraper / Centrum reference

A Python toolkit that mirrors `bodywork.testowe.eu` locally, so the real content and layout stay
available without depending on the old site staying up. **Reference only: never imported, never
served by the Next.js app.**

## Files

| Piece | Path |
|---|---|
| Toolkit | `scripts/scrape/` (`scrape_site.py` and friends) |
| URL list | `scripts/scrape/sitemap.xml` |
| Output, gitignored, ~300 MB | `scripts/scrape/scraped/` |
| Regenerate | `scripts/scrape/run_scrape.bat` |
| Preview locally | `scripts/scrape/serve_mirror.bat` → `http://localhost:8765` |

## What is in the mirror

Per page: the HTML, its assets, and a `media/` folder with the real photos, video and logos. Those
are the assets to use when building the page, copied into `public/`. **Not placeholders.**

Which live URL maps to which folder, plus the verified brand colours, breakpoints and type scale:
[`../scraped-site-map.md`](../scraped-site-map.md). Those values were measured; do not re-guess them.

## Gotchas

- **The reference is itself a page-builder export**, not hand-authored, and not final design. Treat it
  as structural and visual reference, and hand-build the equivalent in React and Tailwind.
- **The reference is not authoritative where it is broken.** Dead links, unreadable type, stranded
  content: fix those, and log every deviation in the tracker. Full rule: skill `centrum-fidelity`.
- **It is Polish-only.** English copy has to be authored, never lifted.
- **Real fonts are commercial and not licensed for reuse.** See the typography note in the site map.

## Related

Skill `centrum-fidelity` · [`../scraped-site-map.md`](../scraped-site-map.md) ·
[`../migration-tracker.md`](../migration-tracker.md) · [`public-site/centrum.md`](./public-site/centrum.md)
