import type { Metadata } from "next";
import { routing } from "@/i18n/routing";

/** Public origin. Absolute URLs are required for Open Graph — a relative `og:image` is
 * ignored by every crawler. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000").replace(
  /\/$/,
  "",
);

export const SITE_NAME = "BODYWORK Centrum";

/** Falls back to a real brand photo rather than a generated card: this is the "friendly
 * space" shot the homepage leads with. */
const DEFAULT_OG_IMAGE = "/images/home/friendly-space.webp";

/** Builds the localised path for a route — `pl` is the default locale and carries no
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
  type?: "website" | "article";
  publishedTime?: string | null;
  authors?: string[];
};

/**
 * One place that builds a page's metadata, so every route gets a distinct title plus the
 * Open Graph and Twitter tags. Before this, all 28 routes and all 62 posts shipped the
 * same `<title>` and no OG tags at all — see the audit in `docs/migration-tracker.md`.
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
  type = "website",
  publishedTime,
  authors,
}: PageMetadataArgs): Metadata {
  const url = `${SITE_URL}${localePath(locale, path)}`;
  const ogImage = image
    ? image.startsWith("http")
      ? image
      : `${SITE_URL}${image}`
    : `${SITE_URL}${DEFAULT_OG_IMAGE}`;

  const languages = Object.fromEntries(
    routing.locales.map((code) => [code, `${SITE_URL}${localePath(code, path)}`]),
  );

  return {
    title,
    ...(description ? { description } : {}),
    alternates: { canonical: url, languages },
    openGraph: {
      type,
      siteName: SITE_NAME,
      locale: locale === "pl" ? "pl_PL" : "en_GB",
      url,
      title,
      ...(description ? { description } : {}),
      images: [{ url: ogImage }],
      ...(publishedTime ? { publishedTime } : {}),
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
