> Read when: building or changing any Centrum page or one of the shared section blocks.

# Public site

Every Centrum page (28 of 32 content pages per the tracker; 33 `page.tsx` files in total, counting blog and utility routes) plus the shared section blocks that compose them.
App Router, Polish by default, English via a locale prefix.

## Routes

`src/app/[locale]/` holds one folder per route segment. Top level: `fizjoterapia/`, `dietetyka/`,
`trening-personalny/`, `trening-grupowy/`, `masaz/`, `bodylab/`, `cennik/`, `kontakt/`,
`instrukcja/`, `regulamin/`, `polityka-prywatnosci/`, `newsletter/`, `blog/`.

Most of those carry sub-routes (specialists, individual services, pricing pages). Per-route status,
components used and QA state: [`../migration-tracker.md`](../migration-tracker.md).

## Section components

`src/components/centrum/`, 37 files. Reuse before you add.

| Role | Files |
|---|---|
| Chrome | `Header.tsx`, `MegaMenu.tsx`, `MobileNav.tsx`, `Footer.tsx`, `PromoBar.tsx` |
| Heroes | `Hero.tsx`, `PageHero.tsx`, `FullBleedImage.tsx`, `FullBleedVideo.tsx` |
| Content blocks | `TextMedia.tsx`, `StatementSection.tsx`, `CenteredBand.tsx`, `PhotoTextCard.tsx`, `ServiceGrid.tsx`, `MediaCardCta.tsx`, `MeetUsCta.tsx` |
| Interactive | `Accordion.tsx`, `TestimonialCarousel.tsx`, `NewsCarousel.tsx`, `CarouselArrows.tsx` |
| Long-form | `LegalDocument.tsx` (terms and privacy) |
| Contact | `ContactDetails.tsx`, `PartnerLogos.tsx` |
| Sub-tree navs | `nav-items.ts` plus `SectionNav.tsx`, `BodylabNav`, `DieteticsNav`, `GroupTrainingNav`, `PersonalTrainingNav`, `PhysiotherapyNav` |

Primitives live one level up in `src/components/ui/`: `Container` (the 1440px width cap),
`Button`, `SectionHeading`, and `use-scroll-carousel.ts` (the scroll-snap carousel behind
`NewsCarousel`, `TestimonialCarousel` and the builder's `CarouselView`).

## Error and notice pages

`[locale]/not-found.tsx`, `[locale]/error.tsx`, `[locale]/[...rest]/`, `src/app/global-error.tsx`.
All four share `centrum/NoticeLayout.tsx` (big statement, body, actions), which also backs the
newsletter confirmation screen.

## Gotchas

- **The catch-all `[...rest]` and the client-component 404 are both load-bearing.** `[...rest]` serves
  published CMS pages and 404s otherwise. Read the note in `../migration-tracker.md` before touching either.
- **There is deliberately no `src/app/layout.tsx`.** `[locale]` and `(payload)` each own their own
  `<html>`, which is what lets Payload render its document shell.
- **Outbound links go through `src/lib/external-links.ts`.** Read the `GALLERY_URL` note: the
  reference links four buttons at a `/galeria` page that does not exist.
- **A custom breakpoint does not automatically beat a smaller built-in one.** `sm:grid-cols-2` beats
  `wide:grid-cols-3` above 1060px. Details in [`../architecture.md`](../architecture.md) gotchas.

## Related

Skill `centrum-fidelity` (how closely to match the reference, and when you may deviate) ·
[`../sites.md`](../sites.md) · [`../scraped-site-map.md`](../scraped-site-map.md) ·
[`../migration-tracker.md`](../migration-tracker.md)
