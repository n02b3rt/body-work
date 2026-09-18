> Read when: building or changing any page on either public site, or deciding where a new shared component belongs.

# Public site

Two sites share `src/app/[locale]/`, split by request host in `src/proxy.ts` (see the Gotcha in
[`../../sites.md`](../../sites.md) for why one is a route group and the other isn't):

| Site | File | Covers |
|---|---|---|
| Centrum | [`centrum.md`](./centrum.md) | 28 of 32 content pages, the 37 section components, error/notice pages |
| Hub | [`hub.md`](./hub.md) | the one landing page and its own minimal components |

## Shared primitives

`src/components/ui/`: `Container` (the 1440px width cap), `Button`, `SectionHeading`. Both sites use
these as-is; reuse before adding a new one, see [`../../conventions.md`](../../conventions.md).
`use-scroll-carousel.ts` sits alongside them but only Centrum and the builder read it: it is the
scroll-snap behaviour behind `NewsCarousel`, `TestimonialCarousel` and the builder's `CarouselView`.

## Shared gotchas

- **Neither site has a shared root layout above it.** `(centrum)/layout.tsx` and `hub/layout.tsx` are
  siblings directly under `[locale]/`, each owning its own `<html>`/`<body>` (Next's "multiple root
  layouts" pattern), same reason `(payload)` owns its own document shell instead of a top-level
  `src/app/layout.tsx`.
- **Outbound links.** Centrum's go through `src/lib/external-links.ts` (read the `GALLERY_URL` note:
  the reference links a `/galeria` page that doesn't exist). The hub's three cross-site links are
  plain constants in `hub/page.tsx` instead, since only one page needs them.

## Related

[`../../sites.md`](../../sites.md) · [`../../architecture.md`](../../architecture.md)
