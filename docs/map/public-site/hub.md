> Read when: building or changing the hub landing page.

# Hub

The `body-work.pl` landing page: one screen, routes visitors to Centrum / Akademia / Alfabet Ruchu.
Bilingual (PL default + `/en`), no Payload content, no other routes.

## Route

`src/app/[locale]/hub/page.tsx` + `layout.tsx`. A **real** segment, not a route group: Next.js
refuses two route groups whose `page.tsx` both resolve to `/`, so `src/proxy.ts` invisibly rewrites
the hub host's `/` (and `/en`) to `/hub` (`/en/hub`) before next-intl runs. Any other path on that
host 404s. Full reasoning: the Gotcha in [`../../sites.md`](../../sites.md), logged in
[`../../decisions.md`](../../decisions.md).

`hub/layout.tsx` is a sibling root layout to `(centrum)/layout.tsx`, not a child of it: its own
`<html>`, the shared brand font and colour tokens (`getThemeCss()`), none of Centrum's
`Header`/`Footer`/`PromoBar` or `LocalBusiness` structured data.

## Components

`src/components/hub/`, 3 files: `Header.tsx` (wordmark + locale switch only), `Footer.tsx` (contact,
reusing the `Footer` message namespace, plus a Facebook link), `ThreeWaySplit.tsx` (the three CTA
panels). All three build on the shared primitives, see [`index.md`](./index.md).

## Content

Copy lives in the `Hub` message namespace (`messages/pl.json` / `en.json`), the same pre-CMS pattern
Centrum used before its content started moving into Payload.

Link targets, all plain constants in `hub/page.tsx`, not `external-links.ts` (only one page needs
them): Centrum via `NEXT_PUBLIC_CENTRUM_URL`; Akademia via a hardcoded
`https://akademia.body-work.pl` (not live yet, same precedent as `centrum/Header.tsx`); Alfabet
Ruchu via `https://alfabetruchu.podia.com/` (real, external, confirmed from the client's own
`home-trojpodzial` reference page).

## Related

[`index.md`](./index.md) · [`../../sites.md`](../../sites.md) · [`../../decisions.md`](../../decisions.md)
