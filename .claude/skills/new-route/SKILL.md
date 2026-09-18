---
name: new-route
description: The checklist for adding a page or route so it renders statically, ships metadata, and appears in the sitemap. Use whenever you create a new page.tsx or route.ts under src/app, split an existing route, or find that a page is rendering dynamically, is missing a title, or is absent from the sitemap.
---

## The shape

```tsx
type PageProps = { params: Promise<{ locale: string }> }

export const revalidate = 3600

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Something' })
  return pageMetadata({ locale, path: '/something', title: t('title'), description: t('metaDescription') })
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params
  setRequestLocale(locale)
  // …
}
```

`params` is a Promise in Next.js 16: await it. `setRequestLocale` before any `getTranslations` in the
body, or the request falls back to the default locale.

## What breaks static rendering

- **Reading `searchParams`.** A route that touches them cannot be prerendered and answers
  `Cache-Control: no-store`. Put the variable in the path instead, the way `blog/strona/[page]` did.
- Reading headers or cookies, and any uncached `fetch`. Payload's Local API through `getPayload()` is
  fine inside `revalidate`.

## Metadata

Always `pageMetadata` from `src/lib/metadata.ts`: it builds the canonical, the PL/EN `hreflang` pair,
Open Graph and Twitter tags together. **Without your own `description` the page inherits the
site-wide one**, which describes the centre rather than the page: that is a real defect, not a nit.

Link between locales with `localePath(locale, path)`, never a hand-built string.

## Structured data

Add the matching helper from `src/lib/structured-data.ts` and render it with
`dangerouslySetInnerHTML`, which is the documented App Router way here:

| Page | Helper |
|---|---|
| Service page | `serviceJsonLd` |
| Homepage | `homepageJsonLd` |
| Any page with a path worth showing | `breadcrumbJsonLd` |
| Post | `blogPostingJsonLd` |

## The sitemap needs nothing from you

`src/app/sitemap.ts` walks `src/app/[locale]` and pulls CMS pages and posts, so a new static route
appears on its own. Two consequences: **a page that should not be listed goes in `EXCLUDED`** (and
should carry `robots: noindex` to match, like `/newsletter`), and dynamic `[slug]` segments are
skipped there because their real URLs come from the CMS.

## Before you call it done

- Strings in `messages/pl.json` **and** `messages/en.json`. A client component reading a new namespace
  also needs `src/i18n/client-namespaces.ts`: see the `i18n-messages` skill.
- Images: `sizes` on every one, `priority` on the hero only. See the `images-and-video` skill.
- A Centrum page also needs its row in `docs/migration-tracker.md` and the `centrum-fidelity` skill.
- Add the route to `docs/map/public-site/centrum.md` or `hub.md` (whichever site it's on), then run `pnpm check:docs`.
