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
| Eager images (homepage) | 15 | **3** |
| Image preloads (homepage) | 9 | **2** |
| Homepage HTML | 27.2 KB | 27.3 KB |

Lighthouse mobile, both builds served locally from `next start`, five runs each, interleaved,
median:

| | main | branch |
|---|---|---|
| Performance | 85 | **92** |
| LCP | 4.29 s | **3.39 s** |
| Speed Index | 2.00 s | **1.55 s** |
| TBT | 48 ms | 46 ms |
| FCP | 1.08 s | 1.08 s |

The jump from 87 to 92 is the hero video alone: the phone encode went from 736 KB to 372 KB, and
below that weight the **poster wins the LCP race instead of the video**, which is what finally makes
its `preload` and `fetchPriority` pair count for anything.

Run it yourself, no install needed:

```bash
NEXT_DIST_DIR=.next-build pnpm build
NEXT_DIST_DIR=.next-build pnpm start -p 3010
npx -y lighthouse@12 http://localhost:3010/ --only-categories=performance \
  --form-factor=mobile --screenEmulation.mobile --view \
  --chrome-flags="--headless=new --disable-extensions"
```

**Localhost understates network fixes and prices CPU fixes honestly.** A request costs almost
nothing over loopback, so anything that trades requests for main-thread work will look better here
than it is, and anything that trades the other way will look worse. Confirm on the demo host.

## The server is half the problem

`demo.n02b3rt.pl` runs behind Apache which advertises only `http/1.1` in its TLS ALPN. Brotli is
done (29% off the HTML, 19.9 KB against 27.9 KB gzip); HTTP/2 is not, and Lighthouse prices it at
1390 ms on its own. Neither is fixable in this
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
  **Every decorative mark carries `loading="lazy"`**, which is all it takes: only the header
  wordmark stays eager, because it is the one that paints above the fold. Nine image preloads
  became two.
- **Inlining an SVG sprite was tried and reverted, and the reason generalises.** It removed the
  same preloads, but 12 KB of inline SVG and twelve `<use>` instantiations cost **160 ms of
  document work** on a throttled mobile CPU (document bootup 507 ms to 667 ms) and held TBT at
  ~200 ms against ~50 ms, every run. Trading network requests for main-thread work is a bad trade
  on a phone, and `loading="lazy"` buys the same thing for nothing.
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

## What actually holds LCP back: hydration

Lighthouse breaks LCP into four phases. Measured on this branch:

| phase | `/` | `/fizjoterapia` |
|---|---|---|
| TTFB | 463 ms (12%) | 461 ms (10%) |
| Load Delay | 0 ms | 0 ms |
| Load Time | 0 ms | 241 ms (5%) |
| **Render Delay** | **3437 ms (88%)** | **3719 ms (84%)** |

**The LCP resource is downloaded and waiting; it cannot paint because the main thread is busy.**
Preloads, priorities and lazy loading all act on Load Delay and Load Time, which together are
5-12% of the problem. That is why this pass moved Speed Index by 23% and LCP by 5%.

Two consequences worth remembering before optimising anything here again:

- **Bytes on the critical path are not the constraint. Client JavaScript is.** Every page hydrates
  the same shell: `Header` (15.7 KB of source), `MegaMenu` (8.3 KB), `MobileNav` (5.8 KB) and
  `PromoBar` (5.1 KB), all `"use client"`, plus next-intl's 13.6 KB gzipped browser runtime.
- **Watch which element actually is the LCP, per page.** On the homepage it was the `<video>`, so
  the poster's `preload` and `fetchPriority` aimed at something the video painted over and could not
  help. Halving the phone encode handed the title back to the poster. `largest-contentful-paint-element`
  in the Lighthouse JSON names it; do not assume.
- **Links prefetch themselves into a flood.** The App Router prefetches every `<Link>` its observer
  sees, several times per route. The chrome carries `prefetch={false}`, which keeps the hover and
  touch prefetch and drops the viewport one. On HTTP/1.1 those requests share six connections with
  the LCP image.

## The first visitor pays for every image, once per width

`/_next/image` encodes on demand and caches per image, per width, per format. Measured against the
live host with a cold entry:

| width | AVIF | WebP |
|---|---|---|
| 960 | 0.48 s, 13.3 KB | 0.19 s, 18.7 KB |
| 1440 | 0.76 s, 22.4 KB | 0.27 s, 33.4 KB |
| 2048 | **1.47 s**, 34.6 KB | 0.46 s, 52.7 KB |

AVIF is 30% smaller and about three times slower to produce. Warm, it is clearly worth it. Cold,
the visitor watches a blur placeholder for up to a second and a half **per image**, which is what
"open it in incognito and it crawls" is.

Two things fix it and they are both outside the page code:

- **`pnpm warm:images <url>` after every deploy.** It reads the build, works out the variants a
  real device can pick (2611 of the 6566 the srcsets offer) and requests each in both formats.
  About 13 minutes at the default concurrency.
- **Build with `NEXT_CACHE_DIR=<path> pnpm build:deploy`.** The encode cache lives in
  `.next/cache/images`, and a deploy that builds from scratch throws it away, so every visitor
  starts paying again. The script carries it in and back out around the build and logs its size,
  which turns a silent regression into a line in the deploy log.

Do the second and the first is a one-off rather than a ritual.

## Still on the table

Taking next-intl out of the browser, which the numbers above make the only change that can move
LCP. `src/i18n/navigation.ts` is the knot: `createNavigation` returns a `Link` that is itself a
client component reading `useLocale()`, and 32 files import it, **including server components**, so
every link on every page is a client boundary. The prefix rule it needs is trivial (`pl`
unprefixed, `en` under `/en`, from `src/i18n/routing.ts`).

It is all-or-nothing: the 13.6 KB runtime only leaves once **every** `useTranslations` in a client
component is gone, which is 15 components plus `error.tsx` and `not-found.tsx`, and those two are
error boundaries that cannot take props from a server parent. `CLIENT_NAMESPACES` and
`check:messages` go with it, so the `i18n-messages` skill changes in the same commit. Not started.

## Related

[`map/infra.md`](./map/infra.md) · [`map/media.md`](./map/media.md) · skill `images-and-video`
