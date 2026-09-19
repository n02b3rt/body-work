> Read when: adding a route that needs metadata, touching structured data, the sitemap, robots or the feed.

# SEO

Every route builds its own title, canonical, hreflang pair, Open Graph and Twitter tags from one
helper. They used to be identical across the site; they are not any more.

| Piece | Path | Note |
|---|---|---|
| Metadata helper | `src/lib/metadata.ts` | one builder, called from each route's `generateMetadata` |
| Editable SEO fields | `src/fields/meta.ts` | shared field group on documents |
| Panel preview | `src/components/admin/SeoPreview.tsx`, `SeoHints.tsx` | shows what will actually be produced |
| Structured data | `src/lib/structured-data.ts` | `HealthAndBeautyBusiness` sitewide, `BlogPosting` and `BreadcrumbList` per post, `Service` / `OfferCatalog` / `ItemList` of `Person` on service pages, `MedicalTherapy` on a therapy page (its `indication` list = the conditions that page names) |
| Open Graph cards | `scripts/generate-og-images.mjs`, `public/images/og/` | 1200x630 **JPEG** cut from each page's hero (some scrapers still refuse WebP). A route with none falls back to `og-default.jpg`; add a row to the script when a route starts declaring its own `image` |
| Prices read back out of the copy | `src/lib/pricing.ts` | the price list is one source of truth: amounts are parsed out of the rendered copy, never kept as a second list |
| Sitemap | `src/app/sitemap.ts` | walks `src/app/[locale]` and pulls posts from Payload, so it cannot drift when a page is added. On the hub host it lists only the hub's `/` and `/en` |
| Robots | `src/app/robots.ts` | per host: the hub points at its own sitemap, the dashboard disallows everything |
| Host → site | `src/lib/site-host.ts` | the proxy's routing rule, shared with the routes the proxy never sees |
| Hub structured data, `/llms.txt` | `src/lib/hub-jsonld.ts`, `src/app/llms.txt/route.ts` | Organization graph; see [`public-site/hub.md`](./public-site/hub.md) |
| RSS | `src/app/feed.xml/route.ts` | **outside** `[locale]`, so no locale prefix is negotiated onto it. Polish only, deliberately |

## Gotchas

- **`robots.txt`, `sitemap.xml` and `llms.txt` answer on every host.** The proxy skips file
  extensions, so each route reads the Host header itself, which makes them request-time.

- **JSON-LD is rendered via `dangerouslySetInnerHTML`.** That is the documented App Router way, not
  an oversight.
- **A new route needs its own `generateMetadata`.** The sitemap will find the route automatically;
  the title will not write itself.
- **Empty SEO fields on imported posts are deliberate**, not an import bug. See the note in
  [`../archive/migration-audits-2026-07.md`](../archive/migration-audits-2026-07.md).
- **`noindex` works through the meta fields**, verified. Do not add a second mechanism.

## Related

[`blog.md`](./blog.md) · [`admin-panel.md`](./admin-panel.md) · [`i18n.md`](./i18n.md) (hreflang pairs)
