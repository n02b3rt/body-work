import { getPayload } from "payload";
import { getTranslations } from "next-intl/server";
import config from "@payload-config";
import { Container } from "@/components/ui/Container";
import { PostCard, type PostCardData } from "@/components/centrum/PostCard";
import { buttonClasses } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { mediaFrom } from "@/lib/media";

type BlogTeasersProps = {
  /** Category slug: `fizjoterapia`, `trening`, `masaz` or `dietetyka`. */
  category: string;
  limit?: number;
};

/**
 * Three recent posts from one category, for the foot of a service page.
 *
 * **An addition, not a reproduction.** The reference never links a service page to an
 * article, so 43 pieces about physiotherapy sat with nothing pointing at them from
 * `/fizjoterapia`. Links between pages on the same subject are among the cheapest ranking
 * signals available, and they give a visitor reading about a service somewhere to go next.
 *
 * Renders nothing when the category has no posts, so a page never shows an empty heading.
 */
export async function BlogTeasers({ category, limit = 3 }: BlogTeasersProps) {
  const t = await getTranslations("Blog");
  const payload = await getPayload({ config });

  const categories = await payload.find({
    collection: "categories",
    where: { slug: { equals: category } },
    limit: 1,
    depth: 0,
  });

  const found = categories.docs[0];
  if (!found) return null;

  const posts = await payload.find({
    collection: "posts",
    depth: 1,
    limit,
    sort: "-publishedAt",
    where: {
      and: [{ categories: { in: [found.id] } }, { _status: { not_equals: "draft" } }],
    },
  });

  if (posts.docs.length === 0) return null;

  /**
   * "Więcej o …" governs the locative in Polish, and ICU has no declension, so the four category
   * slugs carry an explicit form: the plain title rendered "WIĘCEJ O FIZJOTERAPIA" on all five
   * service pages that show this block.
   *
   * Keyed by slug rather than title because the slug is what routes here and cannot change under
   * an editor's rename. A category added later falls back to its title, which is no worse than
   * what every category got before, until somebody adds its form. English declines nothing, so
   * `messages/en.json` deliberately has no such group and always takes the fallback.
   */
  const locativeKey = `categoryLocative.${category}`;
  const categoryLabel = t.has(locativeKey) ? t(locativeKey) : found.title.toLowerCase();

  const cards: PostCardData[] = posts.docs.map((post) => ({
    slug: post.slug ?? String(post.id),
    title: post.title,
    readingMinutes: post.readingMinutes,
    authorName: post.author && typeof post.author === "object" ? post.author.name : null,
    // A 16:9 tile, so the pre-cropped size rather than the full-height original.
    image: mediaFrom(post.featuredImage, "cardWide", post.title),
  }));

  return (
    <section className="border-t border-brand-navy-soft bg-background">
      <Container className="py-12 wide:py-16">
        <h2 className="text-h-menu text-brand-navy">{t("fromTheBlog")}</h2>

        <div className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((post) => (
            <PostCard
              key={post.slug}
              post={post}
              minutesLabel={(minutes) => t("readingTime", { minutes })}
            />
          ))}
        </div>

        <div className="pt-14">
          <Link href={`/blog/kategoria/${category}`} className={buttonClasses("outline")}>
            {t("moreIn", { category: categoryLabel })}
          </Link>
        </div>
      </Container>
    </section>
  );
}
