> Read when: building or changing the hub landing page.

# Hub

The `body-work.pl` landing page: routes visitors to Centrum / Akademia / Alfabet Ruchu, a 1:1 of the client's
`home-trojpodzial` page with better RWD. Bilingual (PL default + `/en`), no
Payload content, no other routes.

## Route

`src/app/[locale]/hub/page.tsx` + `layout.tsx` + `urls.ts` (the hub, Centrum, Akademia and Alfabet
Ruchu origins). A **real** segment, not a route group: `src/proxy.ts` invisibly rewrites the hub
host's `/` and `/en` to `/hub` and `/en/hub`. Any other path on that host 404s. Full reasoning: the
Gotcha in [`../../sites.md`](../../sites.md).

`hub/layout.tsx` is a sibling root layout to `(centrum)/layout.tsx`. No `NextIntlClientProvider`, no
`getThemeCss()`: every hub component is a server component, so no messages reach the browser and
rendering never boots Payload.

## Components

`src/components/hub/`, all server components, in page order: `Header` (wordmark, locale link),
`ThreeWaySplit` (the navy three-column band, plus the visually hidden page `<h1>`), `Illustration`
(the full-width drawing, the LCP image), `Contact` (the "O nas" paragraphs and "KONTAKT"), `Footer`
(legal links bar and the navy footer).

## Content and images

- ⚠ **A 1:1 of `https://body-work.com.pl/pl/home-trojpodzial/`.** Every sentence is the client's own,
  copied verbatim into the `Hub` namespace; only the RWD is ours (fixed type instead of the
  reference's `vw` sizes, stacked columns below `md`). Don't add or paraphrase copy. EN is a faithful
  translation. Reception phone and email come from `Footer`, Centrum's own.
- Colours are the reference's own (`#003b5e` navy, `#cbd0d6` rules), as arbitrary values in the
  components, not theme tokens.
- The drawing: `public/images/hub/illustration.webp`, lossless WebP of the reference's
  `WEB_SLIDER_WEB-1.png`, shown whole at its own ratio instead of the reference's viewport-height
  crop. Blur placeholder and `og/hub.jpg` come from the usual scripts, see [`../media.md`](../media.md).

## SEO and GEO

| Piece | Path |
|---|---|
| Metadata (canonical, hreflang + `x-default`, OG, Twitter) | `hub/page.tsx` `generateMetadata` |
| JSON-LD `@graph`: Organization, WebSite, WebPage, Centrum, Akademia, Alfabet Ruchu (FAQPage when given questions) | `src/lib/hub-jsonld.ts` |
| `robots.txt` and `sitemap.xml` per host | `src/app/robots.ts`, `src/app/sitemap.ts`, via `src/lib/site-host.ts` |
| `/llms.txt`, hub host only | `src/app/llms.txt/route.ts` |

## Gotchas

- ⚠ **`/robots.txt`, `/sitemap.xml` and `/llms.txt` never pass through the proxy** (its matcher skips
  file extensions), so each checks the host itself with `siteForRequestHost`.
- ⚠ **next-intl does not rewrite an already-prefixed path.** `/en/hub` came back as `NextResponse.next()`,
  which served Centrum's `/en` on the hub host; the proxy now rewrites it explicitly.
- **Akademia's URL is hardcoded** in `urls.ts` until Akademia has a host of its own.

## Related

[`index.md`](./index.md) · [`../../sites.md`](../../sites.md) · [`../seo.md`](../seo.md)
