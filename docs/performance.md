> Read when: a page feels slow, a Lighthouse score drops, or `pnpm check:perf` fails.

# Performance

What a visitor downloads, why it is that much, and which numbers are allowed to move.

## Measure the build, not a browser

`pnpm check:perf` (`scripts/perf-budget.mjs`) reads the prerendered HTML out of the build and
gzips every chunk it references. That is exact, covers all 141 pages at once, and moves only when
the code moves. Lighthouse measures one URL through a browser over a network that is never twice
the same, so it is the confirmation, not the instrument.

The ratchet lives in `scripts/perf-budget.json`: the worst page on each axis. Budgets come down,
never up. `--update` rewrites them, and doing that is a decision that belongs in the commit message.

A running dev server owns `.next` and will delete a production build out of it. Build elsewhere:

```bash
NEXT_DIST_DIR=.next-build pnpm build
NEXT_DIST_DIR=.next-build pnpm check:perf
```

## Baseline, 3 August 2026

Measured on `demo.n02b3rt.pl` and reproduced from the build. Worst page of 141:

| | |
|---|---|
| JS | 224.6 KB gzip across 16 files (737 KB raw) |
| CSS | 10.3 KB gzip |
| HTML | 86.8 KB gzip, blog listing page 7 |
| Eager images | 15 |
| Preloads | 13 |

Lighthouse mobile scored **72**, with LCP 4.2 s and TBT 540 ms.

**The LCP problem was queueing, not weight.** The hero poster is a 7.3 KB AVIF that the image cache
answers with a HIT. It arrived at 4.2 s because 16 JS and CSS files, 2 fonts and 8 icon SVGs were
ahead of it, and the server speaks HTTP/1.1, so the browser had 6 connections to share between them.

## After the shared-shell pass, same day

| | Before | After |
|---|---|---|
| Worst page, JS | 224.6 KB | **217.9 KB** |
| CSS | 10.3 KB | **9.1 KB** |
| Eager images | 15 | **1** |
| Preloads | 13 | **5** |
| Homepage HTML | 27.2 KB | 33.2 KB |

The homepage document grew because the icon sprite is inline, and that is the trade: five fewer
round trips before the LCP image against 6 KB gzip carried in a response already on its way. It is
the right trade on HTTP/1.1 and a narrower one once the server speaks HTTP/2.

**Not yet measured against a browser.** The Lighthouse re-run belongs after the next deploy, in
incognito: the original report warns that Chrome extensions polluted it.

## The server is half the problem

`demo.n02b3rt.pl` runs behind Apache which advertises only `http/1.1` in its TLS ALPN and does not
carry `mod_brotli`. Lighthouse prices the first at 1390 ms on its own. Neither is fixable in this
repo. The configuration and how to verify it: [`runbooks/apache-http2-brotli.md`](./runbooks/apache-http2-brotli.md).

Check what the server is actually doing before blaming the bundle:

```bash
echo | openssl s_client -alpn h2,http/1.1 -connect demo.n02b3rt.pl:443 \
  -servername demo.n02b3rt.pl 2>/dev/null | grep -i ALPN
curl -sS -D - -o /dev/null -H 'Accept-Encoding: br' https://demo.n02b3rt.pl/ | grep -i content-encoding
```

## Rules that keep the numbers down

- **An eager `<img>` costs more than its bytes.** React 19 turns every image rendered in the initial
  shell without `loading="lazy"` into a `<link rel="preload">` in `<head>`, ahead of the LCP image.
  Decorative marks belong in the icon sprite, or carry `loading="lazy"`, but never neither.
- **`priority` no longer does what its name says.** Next 16 deprecated it in favour of `preload`
  and stopped emitting `fetchPriority="high"` with it, so pages carrying `priority` shipped a
  preload link and not one high-priority image. The LCP element wants **both** `preload` and
  `fetchPriority="high"`. An image that is only sometimes the LCP element, because the layout
  reorders it by viewport, wants `fetchPriority` **without** `preload`: see `BlogList`.
- **Above-the-fold icons go in the sprite, the rest stay lazy files.** `IconSprite` renders the
  five marks that paint immediately, once per document, and `Icon` references a symbol; colour
  variants are `currentColor`, not more symbols. **Inlining is not free**: whatever the sprite
  holds is paid twice per page, once in the HTML and once escaped into the RSC payload, and it
  is paid on every page view where a file would have been cached. `logo-mark.svg` earns its
  place outside for that reason. Eight icon files and eight preloads became one lazy file.
- **Blur placeholders are for what paints first.** Each one is a ~1.4 KB SVG data URI in a `style`
  attribute, and the RSC payload carries a second copy. Below the fold, on an image that is already
  lazy, it buys nothing.
- **A client component drags its props into the HTML.** Everything crossing a `"use client"`
  boundary is serialised into the inline RSC payload, so a wrapper that only needs to be
  interactive should be as small and as deep in the tree as it can be.
- **Gzip the thing before you decide it is heavy.** Two of this pass's planned wins died on the
  measurement: dropping below-the-fold blur placeholders saves 437 bytes, not the 25 KB the raw
  HTML implied, and a modern `browserslist` target moved the bundle by 100 bytes because Turbopack
  already emits modern output. `pnpm check:perf` reports gzip for exactly this reason.

## Still on the table

`next-intl` costs about 44 KB raw in the browser, and the reason is `src/i18n/navigation.ts`:
`createNavigation` returns a `Link` that is itself a client component reading `useLocale()`, and 32
files import it, **including server components**. Every link on every page is therefore a client
boundary. Replacing it with a wrapper over `next/link` that computes the `as-needed` prefix itself
(`pl` unprefixed, `en` under `/en`, from `src/i18n/routing.ts`) is what would let
`NextIntlClientProvider`, `CLIENT_NAMESPACES` and `check:messages` go. Not started.

## Related

[`map/infra.md`](./map/infra.md) · [`map/media.md`](./map/media.md) · skill `images-and-video`
