import type { Metadata } from "next";
import { routing } from "@/i18n/routing";

/** Public origin. Absolute URLs are required for Open Graph, a relative `og:image` is
 * ignored by every crawler. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000").replace(
  /\/$/,
  "",
);

export const SITE_NAME = "BODYWORK Centrum";

/**
 * Falls back to a real brand photo rather than a generated card: this is the "friendly space" shot
 * the homepage leads with, cropped to the 1200x630 every platform documents.
 *
 * **JPEG, not the WebP original.** Facebook, LinkedIn and X all state 1200x630, and some scrapers
 * still refuse WebP outright; an unrendered card costs more than 96KB does. Regenerate with the
 * one-liner in `docs/migration-tracker.md` if the source photo ever changes.
 */
const DEFAULT_OG_IMAGE = "/images/og-default.jpg";
const DEFAULT_OG_WIDTH = 1200;
const DEFAULT_OG_HEIGHT = 630;

/** Builds the localised path for a route: `pl` is the default locale and carries no
 * prefix (`localePrefix: "as-needed"`). */
export function localePath(locale: string, path: string) {
  const clean = path === "/" ? "" : path.replace(/\/$/, "");
  return locale === routing.defaultLocale ? clean || "/" : `/${locale}${clean || ""}`;
}

type PageMetadataArgs = {
  locale: string;
  /** Route without a locale prefix, e.g. `/cennik` or `/blog/plyometria`. */
  path: string;
  title: string;
  description?: string;
  /** Site-relative or absolute; converted to absolute for OG. */
  image?: string | null;
  /** Intrinsic size of `image`. Facebook and LinkedIn render a card more reliably when the
   *  dimensions are declared, instead of having to fetch the file to find them. */
  imageWidth?: number | null;
  imageHeight?: number | null;
  type?: "website" | "article";
  publishedTime?: string | null;
  modifiedTime?: string | null;
  /** Category name, emitted as `article:section`. */
  section?: string | null;
  authors?: string[];
  /**
   * Drop the `alternates.languages` pair. Set it where a locale's URL exists but serves the
   * other locale's text: claiming `hreflang="en"` over Polish prose tells search engines
   * there is a translation when there is not, and the two URLs then compete as duplicates.
   * The 62 imported posts are in exactly that position until somebody translates them.
   */
  singleLanguage?: boolean;
  /**
   * Keep the page out of search results, from the document's own `meta.noIndex`.
   *
   * The checkbox existed in the panel for a while and **nothing read it**: an editor could tick
   * "Ukryj przed wyszukiwarkami" and the page carried on being indexed. A control that lies about
   * what it does is worse than no control, so it is wired through here and honoured in
   * `src/app/sitemap.ts` as well, since listing a noindex URL in a sitemap sends crawlers
   * contradictory instructions.
   */
  noIndex?: boolean | null;
};

/**
 * One place that builds a page's metadata, so every route gets a distinct title plus the
 * Open Graph and Twitter tags. Before this, all 28 routes and all 62 posts shipped the
 * same `<title>` and no OG tags at all, see the audit in `docs/migration-tracker.md`.
 *
 * `alternates.languages` is filled for both locales so crawlers can pair the PL and EN
 * versions of a page instead of treating them as duplicates.
 */
export function pageMetadata({
  locale,
  path,
  title,
  description,
  image,
  imageWidth,
  imageHeight,
  type = "website",
  publishedTime,
  modifiedTime,
  section,
  authors,
  singleLanguage = false,
  noIndex = false,
}: PageMetadataArgs): Metadata {
  // `singleLanguage` means the text exists in one language only, so every locale's URL is
  // serving the same words. Pointing them all at the default locale's URL consolidates the
  // ranking signals there instead of leaving near-duplicates competing. Removing the
  // `hreflang` pair alone was not enough: /en/blog/<slug> still self-canonicalised.
  const canonicalLocale = singleLanguage ? routing.defaultLocale : locale;
  const url = `${SITE_URL}${localePath(canonicalLocale, path)}`;
  const pageUrl = `${SITE_URL}${localePath(locale, path)}`;
  const usingDefaultImage = !image;
  const ogImage = image
    ? image.startsWith("http")
      ? image
      : `${SITE_URL}${image}`
    : `${SITE_URL}${DEFAULT_OG_IMAGE}`;

  // Declaring the size lets a scraper lay the card out without fetching the file first, and the
  // default's dimensions are known, so there is no reason to leave them off.
  const ogWidth = usingDefaultImage ? DEFAULT_OG_WIDTH : imageWidth;
  const ogHeight = usingDefaultImage ? DEFAULT_OG_HEIGHT : imageHeight;

  const languages = Object.fromEntries(
    routing.locales.map((code) => [code, `${SITE_URL}${localePath(code, path)}`]),
  );

  return {
    title,
    ...(description ? { description } : {}),
    // `follow` stays on: the point is to keep this page out of the index, not to strand the
    // pages it links to.
    ...(noIndex ? { robots: { index: false, follow: true } } : {}),
    alternates: {
      canonical: url,
      ...(singleLanguage ? {} : { languages }),
      // Declared here rather than in the layout, because a page's `generateMetadata`
      // replaces the layout's whole `alternates` object instead of merging into it. Set
      // upstream, the feed link vanished from every route that declares a canonical.
      types: {
        "application/rss+xml": [{ url: `${SITE_URL}/feed.xml`, title: `${SITE_NAME} Blog` }],
      },
    },
    openGraph: {
      type,
      siteName: SITE_NAME,
      locale: locale === "pl" ? "pl_PL" : "en_GB",
      // og:url names the page being viewed; the canonical above names the one to index.
      url: pageUrl,
      title,
      ...(description ? { description } : {}),
      images: [
        {
          url: ogImage,
          ...(ogWidth ? { width: ogWidth } : {}),
          ...(ogHeight ? { height: ogHeight } : {}),
          ...(title ? { alt: title } : {}),
        },
      ],
      ...(publishedTime ? { publishedTime } : {}),
      ...(modifiedTime ? { modifiedTime } : {}),
      ...(section ? { section } : {}),
      ...(authors?.length ? { authors } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      ...(description ? { description } : {}),
      images: [ogImage],
    },
  };
}
