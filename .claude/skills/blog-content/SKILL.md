---
name: blog-content
description: How the blog listing stays static and cheap, and which of its decisions look like bugs but are load-bearing. Use whenever you touch the blog listing, a post page, category archives, pagination, the BlogList component, blog-listing.ts, or an English version of a post.
---

62 posts, filtered in the browser, rendered from a static page. Every choice below was measured;
undoing one silently costs either bytes or crawlable URLs.

## The five that will bite you

1. **Pagination lives in the path, not in `?page`.** A route that reads `searchParams` cannot be
   prerendered, and that alone kept the listing answering `Cache-Control: no-store`. Page one is
   `blog/page.tsx`, the rest are `blog/strona/[page]/`. `revalidate = 3600`. **Never reach for
   `searchParams` here.**

2. **Blur placeholders are pruned on purpose.** `withFirstPaintPlaceholders(cards, 1 + initialCount)`
   strips `blurDataURL` from every card the first paint will not show. Measured: 61 placeholders were
   28.1 KB of raw HTML and **20.7 KB gzipped, 39% of the document**, to paint ten cards. Base64 is
   effectively incompressible, so gzip does not rescue it. A filtered view can surface a card with no
   placeholder; it fades in without a blur, which is the right trade.

3. **The window is a rendering window, not server pagination.** All posts are serialised so filtering
   and search cost no round trip, but only `shown` cards enter the DOM. An `IntersectionObserver`
   grows it ahead of the scroll. Changing category or query resets the window to `BLOG_PAGE_SIZE`.

4. **`nextPageHref` is what makes the blog crawlable.** Without that link to the next server-rendered
   page, only 10 of 62 post URLs appeared anywhere in the HTML. It is also the no-JavaScript path.

5. **Ordering is redone in JavaScript.** Postgres sorts NULLs **first** on a `DESC` order, so
   `sort: "-publishedAt"` alone floats the one undated post to the top. `blogListingData` re-sorts
   with `NEGATIVE_INFINITY` for missing dates. Keep both.

## Images

- Card index 0 asks for **`hero`** (the featured card is `aspect-auto` at half the viewport, so a
  crop would show). Every other card asks for **`cardWide`**, the 16:9 tile.
- **`cardWide` is deliberately absent from the fallback chain** in `mediaFrom`, so a cropped tile can
  never stand in for an in-article or hero image.
- `priority` goes on the featured image only. Keep the `sizes` strings as they are; they were
  measured against the real grid.

## English

`blogListingData(locale)` filters to posts with a **published translation** when the locale is not
`pl`. A post without one **404s in EN**, by decision: no Polish cards on an English listing.

## Structural rules

- **`BLOG_PAGE_SIZE` lives in its own import-free module.** `BlogList` is a Client Component;
  importing it from `blog-listing.ts` would drag Payload into the browser bundle.
- **`mediaPath` strips the origin.** `serverURL` points at the dashboard host so the admin links
  correctly; the public site must not reference it, and `next/image` would reject it as an
  unconfigured remote host.
- **No date on the listing** (client's instruction), and **no hero image or lead paragraph on a post
  page**: `featuredImage` is the post's first body image and `excerpt` is its opening paragraph, so
  either one duplicates the article.

## Scripts

`content-health.ts` (read-only editorial worklist) · `fix-blog-from-reference.ts` (**`DRY=1`, not
`--dry`**) · `fix-image-alt-text.ts` · `smoke-blog-write.ts`. See the `payload-script` skill first.

Deeper: `docs/map/blog.md`, `docs/i18n.md`.
