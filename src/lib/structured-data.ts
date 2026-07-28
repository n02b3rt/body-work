import { SITE_NAME, SITE_URL, localePath } from "./metadata";

/**
 * JSON-LD builders. The site had none at all, which was the largest gap the SEO audit turned
 * up. Without `LocalBusiness` a physiotherapy centre in Poznań is invisible to the local
 * pack, and without `BlogPosting` an article cannot appear as a rich result.
 *
 * Everything here returns a plain object. Render it with
 * `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(x) }} />`,
 * which is the documented way to emit JSON-LD in the App Router. The payload is ours rather
 * than user input, so there is nothing to inject.
 */

type Thing = Record<string, unknown>;

function absolute(url: string) {
  return url.startsWith("http") ? url : `${SITE_URL}${url}`;
}

/**
 * The homepage's own graph: the site as a `WebSite`, and what the centre offers as an `ItemList`
 * of `Service` entries pointing at the section pages.
 *
 * Both hang off the sitewide `HealthAndBeautyBusiness` by `@id` rather than repeating its address
 * and hours, which is what stops a crawler reading them as two different businesses.
 *
 * **No `potentialAction`/`SearchAction`.** The sitelinks searchbox needs a URL that accepts a query
 * string, and this site's only search is the blog's client-side filter. Declaring one would be a
 * claim that does not hold.
 */
export function homepageJsonLd(
  locale: string,
  services: { label: string; href: string }[],
): Thing {
  const businessId = `${SITE_URL}/#business`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        inLanguage: locale === "pl" ? "pl-PL" : "en-GB",
        publisher: { "@id": businessId },
      },
      {
        "@type": "ItemList",
        "@id": `${SITE_URL}${localePath(locale, "/")}#services`,
        name: SITE_NAME,
        itemListElement: services.map((service, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "Service",
            name: service.label,
            // Section pages are internal; the academy is a separate host.
            url: service.href.startsWith("http")
              ? service.href
              : `${SITE_URL}${localePath(locale, service.href)}`,
            provider: { "@id": businessId },
          },
        })),
      },
    ],
  };
}

/**
 * The business itself. Values mirror the footer's own strings so there is one source of
 * truth: change the address in `messages/*.json` and this follows.
 *
 * `MedicalBusiness` would be narrower, but the centre also sells personal training and
 * dietetics, so `HealthAndBeautyBusiness` is the honest fit. Both inherit `LocalBusiness`.
 */
export function localBusinessJsonLd(t: {
  streetAddress: string;
  postalCodeAndCity: string;
  phone: string;
  email: string;
}): Thing {
  const parts = t.postalCodeAndCity.split(" ");
  const postalCode = parts[0] ?? "";
  const city = parts.slice(1).join(" ");

  return {
    "@context": "https://schema.org",
    "@type": "HealthAndBeautyBusiness",
    "@id": `${SITE_URL}/#business`,
    name: SITE_NAME,
    url: SITE_URL,
    telephone: `+48${t.phone.replace(/\s/g, "")}`,
    email: t.email,
    image: `${SITE_URL}/images/home/friendly-space.webp`,
    address: {
      "@type": "PostalAddress",
      streetAddress: t.streetAddress,
      postalCode,
      addressLocality: city,
      addressCountry: "PL",
    },
    // Straight from the footer: Mon to Fri 7:00 to 22:00, Sat 10:00 to 14:00, Sun closed.
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "07:00",
        closes: "22:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Saturday"],
        opens: "10:00",
        closes: "14:00",
      },
    ],
  };
}

/** The publisher block every `BlogPosting` has to point at. */
function publisher(): Thing {
  return {
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: { "@type": "ImageObject", url: `${SITE_URL}/images/home/friendly-space.webp` },
  };
}

export function blogPostingJsonLd(post: {
  locale: string;
  slug: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  publishedAt?: string | null;
  updatedAt?: string | null;
  authorName?: string | null;
  categoryNames?: string[];
  readingMinutes?: number | null;
}): Thing {
  const url = `${SITE_URL}${localePath(post.locale, `/blog/${post.slug}`)}`;

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    headline: post.title,
    ...(post.description ? { description: post.description } : {}),
    ...(post.imageUrl ? { image: [absolute(post.imageUrl)] } : {}),
    ...(post.publishedAt ? { datePublished: post.publishedAt } : {}),
    // Falls back to the publication date. Omitting `dateModified` makes Search Console
    // complain, and claiming a modification that never happened would be worse.
    ...(post.updatedAt || post.publishedAt
      ? { dateModified: post.updatedAt ?? post.publishedAt }
      : {}),
    ...(post.authorName ? { author: { "@type": "Person", name: post.authorName } } : {}),
    ...(post.categoryNames?.length ? { articleSection: post.categoryNames } : {}),
    ...(post.readingMinutes ? { timeRequired: `PT${post.readingMinutes}M` } : {}),
    inLanguage: post.locale === "pl" ? "pl-PL" : "en",
    isPartOf: {
      "@type": "Blog",
      name: `${SITE_NAME} Blog`,
      url: `${SITE_URL}${localePath(post.locale, "/blog")}`,
    },
    publisher: publisher(),
  };
}

/** Breadcrumbs put a readable trail in the search result instead of a bare URL. */
export function breadcrumbJsonLd(items: { name: string; path: string }[], locale: string): Thing {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${localePath(locale, item.path)}`,
    })),
  };
}
