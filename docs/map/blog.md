> Read when: touching the blog listing, a post page, category archives, or the English version of a post.

# Blog

62 imported posts, a listing, per-category archives and English versions. Content is read through
Payload's Local API in Server Components; filtering and search happen client-side.

## Routes

`src/app/[locale]/blog/`

| Route | Folder |
|---|---|
| Listing | `blog/page.tsx` |
| Post | `blog/[slug]/` |
| Category archive | `blog/kategoria/[slug]/` (static, one per category, in the sitemap) |
| Paged listing | `blog/strona/[page]/` |

## Collections

`src/collections/Posts.ts`, `Categories.ts`, `Authors.ts`, `PostTranslations.ts`.

`Authors` is a collection rather than a `users` relationship because the 24 credited authors are
trainers and physiotherapists, not CMS accounts. English posts live in `PostTranslations` rather
than `localized: true`, because that migration hangs on an existing table.

## Components

`src/components/centrum/`: `BlogList.tsx` (listing, filtering, the featured card, the render window),
`PostCard.tsx` (shared by archives and the "read next" block), `PostBody.tsx`, `BlogTeasers.tsx`
(three matching posts at the foot of five service pages), `NewsCarousel.tsx`, `BlogIcons.tsx`.

Helpers: `src/lib/blog-listing.ts`, `blog-page-size.ts`, `post-translation.ts`.

## Scripts

| Script | Does |
|---|---|
| `scripts/content-health.ts` | read-only editorial worklist: posts without subheadings, images needing real alt text, missing categories |
| `scripts/fix-blog-from-reference.ts` | repairs thumbnail/excerpt/date, which the import took from the article body. `DRY=1` to preview, **not** `--dry` |
| `scripts/fix-image-alt-text.ts` | sets in-article alts to "post title: nearest heading" |
| `scripts/import-blog.ts` | the original import |
| `scripts/smoke-blog-write.ts` | write-path smoke test |

## Gotchas

- **No translation means the post 404s in EN.** By design, see [`../i18n.md`](../i18n.md). No
  half-translated skeletons.
- **The listing prints no dates anywhere**, on the client's instruction. Reading time and author stay.
  Post pages keep their dates.
- **`BlogList` keeps its own copy of the card**, because the listing grid carries divider borders that
  `PostCard` does not.
- **No hero image and no lead paragraph on a post page.** `featuredImage` is the post's first body
  image and `excerpt` is its opening paragraph, so rendering either above the article duplicated it.

## Performance

The listing is static (`revalidate = 3600`) and filters in the browser. Four pieces carry that, and
each looks removable until you know why it is there:

- `blogListingData()` in `src/lib/blog-listing.ts`: one query pass, drafts excluded, re-sorted in JS
- `withFirstPaintPlaceholders()`, same file: prunes `blurDataURL` below the fold
- `blog/strona/[page]/`: the page number is in the path, because `searchParams` would force dynamic rendering
- `BLOG_PAGE_SIZE` in its own import-free module, so the client bundle does not pull in Payload

**Read the `blog-content` skill before changing any of them.**

## Related

Skill `blog-content` · [`../i18n.md`](../i18n.md) · [`../migration-tracker.md`](../migration-tracker.md)
(the reference's actual blog inventory: image counts, categories, author portraits)
