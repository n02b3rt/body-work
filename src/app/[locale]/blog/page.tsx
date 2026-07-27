import { getPayload } from "payload";
import { getTranslations } from "next-intl/server";
import config from "@payload-config";
import { PageHero } from "@/components/centrum/PageHero";
import { BlogList, type BlogCard, type BlogCategory } from "@/components/centrum/BlogList";
import type { Media, Post } from "@/payload-types";

function mediaCard(image: Post["featuredImage"], fallbackAlt: string) {
  if (!image || typeof image !== "object") return null;
  const media = image as Media;
  // Prefer the generated `card` size over the original — see the imageSizes on the
  // Media collection. Falls back to the original if the size wasn't generated (e.g. an
  // upload smaller than the target width).
  const url = media.sizes?.card?.url ?? media.url;
  if (!url) return null;
  return { url, alt: media.alt || fallbackAlt };
}

/** Blog listing. Posts are read through Payload's Local API — in-process, no HTTP hop. */
export default async function BlogPage() {
  const t = await getTranslations("Blog");
  const payload = await getPayload({ config });

  const [posts, categories] = await Promise.all([
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

  const cards: BlogCard[] = posts.docs.map((post) => ({
    slug: post.slug ?? String(post.id),
    title: post.title,
    excerpt: post.excerpt,
    date: post.publishedAt,
    readingMinutes: post.readingMinutes,
    authorName: post.author && typeof post.author === "object" ? post.author.name : null,
    categoryIds: (post.categories ?? [])
      .map((item) => (typeof item === "object" ? String(item.id) : String(item)))
      .filter(Boolean),
    image: mediaCard(post.featuredImage, post.title),
  }));

  const categoryOptions: BlogCategory[] = categories.docs.map((item) => ({
    id: String(item.id),
    title: item.title,
  }));

  return (
    <>
      <PageHero title={t("title")} titleSize="display" titleAlign="right" />
      <BlogList posts={cards} categories={categoryOptions} />
    </>
  );
}
