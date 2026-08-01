> Read when: adding a route that needs metadata, touching structured data, the sitemap, robots or the feed.

# SEO

Every route builds its own title, canonical, hreflang pair, Open Graph and Twitter tags from one
helper. They used to be identical across the site; they are not any more.

| Piece | Path | Note |
|---|---|---|
| Metadata helper | `src/lib/metadata.ts` | one builder, called from each route's `generateMetadata` |
| Editable SEO fields | `src/fields/meta.ts` | shared field group on documents |
| Panel preview | `src/components/admin/SeoPreview.tsx`, `SeoHints.tsx` | shows what will actually be produced |
| Structured data | `src/lib/structured-data.ts` | `HealthAndBeautyBusiness` sitewide, `BlogPosting` and `BreadcrumbList` per post, `Service` on service pages |
| Sitemap | `src/app/sitemap.ts` | walks `src/app/[locale]` and pulls posts from Payload, so it cannot drift when a page is added |
| Robots | `src/app/robots.ts` | |
| RSS | `src/app/feed.xml/route.ts` | **outside** `[locale]`, so no locale prefix is negotiated onto it. Polish only, deliberately |

## Gotchas

- **JSON-LD is rendered via `dangerouslySetInnerHTML`.** That is the documented App Router way, not
  an oversight.
- **A new route needs its own `generateMetadata`.** The sitemap will find the route automatically;
  the title will not write itself.
- **Empty SEO fields on imported posts are deliberate**, not an import bug. See the note in
  [`../archive/migration-audits-2026-07.md`](../archive/migration-audits-2026-07.md).
- **`noindex` works through the meta fields**, verified. Do not add a second mechanism.

## Related

[`blog.md`](./blog.md) · [`admin-panel.md`](./admin-panel.md) · [`i18n.md`](./i18n.md) (hreflang pairs)
