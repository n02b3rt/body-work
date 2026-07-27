import { getPayload } from "payload";
import config from "@payload-config";
import { routing } from "@/i18n/routing";
import { SITE_NAME, SITE_URL, localePath } from "@/lib/metadata";

/**
 * RSS 2.0 feed for the blog, at `/feed.xml`.
 *
 * Polish only. The 62 posts are Polish on both locales until somebody translates them, so a
 * second English feed would carry the same text under a different language tag, which is the
 * same mistake as the `hreflang` pair that was removed from the post pages.
 *
 * Outside `[locale]` on purpose: `src/proxy.ts` hands everything that is not `/admin` or
 * `/api` to next-intl, and a feed does not want a locale prefix negotiated onto it. The
 * proxy's matcher already skips paths containing a dot, so `/feed.xml` passes straight
 * through.
 */

const FEED_LIMIT = 30;

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const locale = routing.defaultLocale;
  const blogUrl = `${SITE_URL}${localePath(locale, "/blog")}`;

  let items = "";
  let latest = new Date();

  try {
    const payload = await getPayload({ config });
    const posts = await payload.find({
      collection: "posts",
      depth: 1,
      limit: FEED_LIMIT,
      sort: "-publishedAt",
      where: { _status: { not_equals: "draft" } },
    });

    if (posts.docs[0]?.publishedAt) latest = new Date(posts.docs[0].publishedAt);

    items = posts.docs
      .map((post) => {
        const slug = post.slug ?? String(post.id);
        const url = `${SITE_URL}${localePath(locale, `/blog/${slug}`)}`;
        const author =
          post.author && typeof post.author === "object" ? post.author.name : undefined;
        const published = post.publishedAt ? new Date(post.publishedAt).toUTCString() : null;

        return [
          "    <item>",
          `      <title>${escapeXml(post.title)}</title>`,
          `      <link>${url}</link>`,
          `      <guid isPermaLink="true">${url}</guid>`,
          post.excerpt ? `      <description>${escapeXml(post.excerpt)}</description>` : "",
          published ? `      <pubDate>${published}</pubDate>` : "",
          author ? `      <dc:creator>${escapeXml(author)}</dc:creator>` : "",
          "    </item>",
        ]
          .filter(Boolean)
          .join("\n");
      })
      .join("\n");
  } catch {
    // A feed listing nothing beats a 500 when the database is briefly unreachable, which is
    // the same call `sitemap.ts` makes.
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escapeXml(`${SITE_NAME} Blog`)}</title>
    <link>${blogUrl}</link>
    <description>${escapeXml("Blog BODYWORK: trening, fizjoterapia, dietetyka i masaż.")}</description>
    <language>pl-PL</language>
    <lastBuildDate>${latest.toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "content-type": "application/rss+xml; charset=utf-8",
      // Cheap to build, but there is no reason to rebuild it per request.
      "cache-control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
