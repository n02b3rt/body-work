import { getPayload } from "payload";
import { getTranslations } from "next-intl/server";
import config from "@payload-config";
import { PageHero } from "@/components/centrum/PageHero";
import { BlogList, type BlogCard, type BlogCategory } from "@/components/centrum/BlogList";
import { mediaFrom } from "@/lib/media";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Blog" });
  return pageMetadata({ locale, path: "/blog", title: t("title") });
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

  // Newest first, with undated posts last. Postgres sorts NULLs *first* on a DESC order, so
  // relying on the query's `-publishedAt` alone would float a post with no date to the top —
  // which is exactly what happened to one imported post that the reference leaves undated.
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
    // `hero` rather than `card`: the newest post is rendered at half the viewport width.
    image: mediaFrom(post.featuredImage, "hero", post.title),
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
