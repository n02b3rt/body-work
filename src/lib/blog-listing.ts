import { getPayload } from "payload";
import config from "@payload-config";
import type { BlogCard, BlogCategory } from "@/components/centrum/BlogList";
import { mediaFrom } from "@/lib/media";

export { BLOG_PAGE_SIZE } from "@/lib/blog-page-size";

/**
 * Everything both listing routes need, in one query pass.
 *
 * Ordering is done here rather than left to the query: Postgres sorts NULLs *first* on a DESC
 * order, so `-publishedAt` alone floats an undated post to the top, which is exactly what
 * happened to the one post the reference leaves undated.
 */
export async function blogListingData() {
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

  const ordered = [...posts.docs].sort((a, b) => {
    const left = a.publishedAt ? Date.parse(a.publishedAt) : Number.NEGATIVE_INFINITY;
    const right = b.publishedAt ? Date.parse(b.publishedAt) : Number.NEGATIVE_INFINITY;
    return right - left;
  });

  const cards: BlogCard[] = ordered.map((post) => ({
    slug: post.slug ?? String(post.id),
    title: post.title,
    excerpt: post.excerpt,
    readingMinutes: post.readingMinutes,
    authorName: post.author && typeof post.author === "object" ? post.author.name : null,
    categoryIds: (post.categories ?? [])
      .map((item) => (typeof item === "object" ? String(item.id) : String(item)))
      .filter(Boolean),
    // `hero` rather than `card`: the newest post renders at half the viewport width, and a
    // larger source costs nothing in transfer because `sizes` decides the width served.
    image: mediaFrom(post.featuredImage, "hero", post.title),
  }));

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
