import { getPayload } from "payload";
import config from "@payload-config";
import type { BlogCard, BlogCategory } from "@/components/centrum/BlogList";
import { mediaFrom } from "@/lib/media";
import { routing } from "@/i18n/routing";
import { publishedTranslations } from "@/lib/post-translation";

export { BLOG_PAGE_SIZE } from "@/lib/blog-page-size";

/**
 * Everything both listing routes need, in one query pass.
 *
 * Ordering is done here rather than left to the query: Postgres sorts NULLs *first* on a DESC
 * order, so `-publishedAt` alone floats an undated post to the top, which is exactly what
 * happened to the one post the reference leaves undated.
 */
export async function blogListingData(locale: string = routing.defaultLocale) {
  const payload = await getPayload({ config });

  const [posts, categoryDocs] = await Promise.all([
    payload.find({
      collection: "posts",
      depth: 1,
      limit: 200,
      sort: "-publishedAt",
      // Drafts stay out of the public listing; Payload's draft versions are separate docs.
      where: { _status: { not_equals: "draft" } },
    }),
    payload.find({ collection: "categories", limit: 50, sort: "title" }),
  ]);

  // On English, a post exists only if it has a published translation. Anything else would put
  // Polish cards on an English listing, which docs/i18n.md rules out.
  const translations =
    locale === routing.defaultLocale ? null : await publishedTranslations();

  const visible = translations
    ? posts.docs.filter((post) => translations.has(post.id))
    : posts.docs;

  const ordered = [...visible].sort((a, b) => {
    const left = a.publishedAt ? Date.parse(a.publishedAt) : Number.NEGATIVE_INFINITY;
    const right = b.publishedAt ? Date.parse(b.publishedAt) : Number.NEGATIVE_INFINITY;
    return right - left;
  });

  const cards: BlogCard[] = ordered.map((post) => {
    const translation = translations?.get(post.id);
    return {
    slug: post.slug ?? String(post.id),
    title: translation?.title ?? post.title,
    excerpt: translation?.excerpt ?? post.excerpt,
    readingMinutes: post.readingMinutes,
    authorName: post.author && typeof post.author === "object" ? post.author.name : null,
    categoryIds: (post.categories ?? [])
      .map((item) => (typeof item === "object" ? String(item.id) : String(item)))
      .filter(Boolean),
    // `hero` rather than `card`: the newest post renders at half the viewport width, and a
    // larger source costs nothing in transfer because `sizes` decides the width served.
    image: mediaFrom(post.featuredImage, "hero", translation?.title ?? post.title),
    };
  });

  const categories: BlogCategory[] = categoryDocs.docs.map((item) => ({
    id: String(item.id),
    title: item.title,
  }));

  return {
    cards,
    categories,
    /** The featured card takes the newest post, so the grid holds one fewer. */
    gridCount: Math.max(0, cards.length - 1),
  };
}

/**
 * Drops the blur placeholder from cards the first paint will not show.
 *
 * The listing filters client-side, so **every** post's data is serialised into the page, and a
 * `blurDataURL` is a base64 data URI of a few hundred characters. Measured on `/blog`: 61
 * placeholders, 28.1KB of the raw HTML and **20.7KB gzipped, 39% of the document**, to paint ten
 * cards. Base64 is close to incompressible, so gzip does not rescue it, and unlike an image this
 * sits on the critical path.
 *
 * The ones that survive are the ones that earn it: the featured card is the LCP candidate and the
 * first grid rows are what a visitor sees before scrolling. Everything below that is lazily
 * loaded into a container that already has a tinted background, and by the time it scrolls into
 * view the browser has had the network to itself.
 *
 * A filtered or searched listing can pull a later card into view with no placeholder. That card
 * fades in without a blur rather than breaking, which is the right trade for a fifth of the page.
 */
export function withFirstPaintPlaceholders(cards: BlogCard[], painted: number): BlogCard[] {
  return cards.map((card, index) => {
    if (index < painted || !card.image?.blurDataURL) return card;

    const { blurDataURL: _dropped, ...image } = card.image;
    return { ...card, image };
  });
}
