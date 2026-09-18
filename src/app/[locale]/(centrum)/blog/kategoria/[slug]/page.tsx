import { notFound } from "next/navigation";
import { getPayload } from "payload";
import { getTranslations, setRequestLocale } from "next-intl/server";
import config from "@payload-config";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/centrum/PageHero";
import { PostCard, type PostCardData } from "@/components/centrum/PostCard";
import { buttonClasses } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { mediaFrom } from "@/lib/media";
import { pageMetadata } from "@/lib/metadata";
import { breadcrumbJsonLd } from "@/lib/structured-data";

/**
 * Category archive, e.g. `/blog/kategoria/fizjoterapia`.
 *
 * **An addition, not a reproduction.** The reference filters categories client-side only, so
 * it has no indexable page per category. Forty-three articles about physiotherapy sitting
 * behind a `<select>` are invisible as a group; given one URL each, they read as a topical
 * cluster, which is exactly the shape search engines reward.
 *
 * The route is a folder rather than a second dynamic segment, so `/blog/[slug]` keeps
 * matching posts and only the two-segment form lands here.
 */

type ArchiveProps = { params: Promise<{ locale: string; slug: string }> };

export const revalidate = 3600;

async function findCategory(slug: string) {
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "categories",
    where: { slug: { equals: slug } },
    limit: 1,
  });
  return result.docs[0] ?? null;
}

export async function generateStaticParams() {
  const payload = await getPayload({ config });
  const categories = await payload.find({ collection: "categories", limit: 50, depth: 0 });

  return routing.locales.flatMap((locale) =>
    categories.docs
      .filter((doc) => doc.slug)
      .map((doc) => ({ locale, slug: doc.slug as string })),
  );
}

export async function generateMetadata({ params }: ArchiveProps) {
  const { locale, slug } = await params;
  const category = await findCategory(slug);
  if (!category) return {};

  const t = await getTranslations({ locale, namespace: "Blog" });

  return pageMetadata({
    locale,
    path: `/blog/kategoria/${slug}`,
    title: t("categoryTitle", { category: category.title }),
    description: t("categoryDescription", { category: category.title.toLowerCase() }),
    // The posts listed here are Polish whichever locale you arrive in.
    singleLanguage: true,
  });
}

export default async function CategoryArchive({ params }: ArchiveProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const category = await findCategory(slug);
  if (!category) notFound();

  const t = await getTranslations("Blog");
  const payload = await getPayload({ config });

  const posts = await payload.find({
    collection: "posts",
    depth: 1,
    limit: 200,
    sort: "-publishedAt",
    where: {
      and: [{ categories: { in: [category.id] } }, { _status: { not_equals: "draft" } }],
    },
  });

  const cards: PostCardData[] = posts.docs.map((post) => ({
    slug: post.slug ?? String(post.id),
    title: post.title,
    readingMinutes: post.readingMinutes,
    authorName: post.author && typeof post.author === "object" ? post.author.name : null,
    // A 16:9 tile, so the pre-cropped size rather than the full-height original.
    image: mediaFrom(post.featuredImage, "cardWide", post.title),
  }));

  const breadcrumbs = breadcrumbJsonLd(
    [
      { name: t("breadcrumbHome"), path: "/" },
      { name: t("title"), path: "/blog" },
      { name: category.title, path: `/blog/kategoria/${slug}` },
    ],
    locale,
  );

  return (
    <>
      <script
        type="application/ld+json"
        // Our own object, serialised by us. No user input reaches it.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />

      <PageHero title={category.title} titleSize="display" titleAlign="right" />

      <section className="border-t border-brand-navy-soft bg-background">
        <Container className="py-12 wide:py-16">
          <p className="max-w-[42rem] text-body text-brand-navy">
            {t("categoryCount", { count: cards.length, category: category.title.toLowerCase() })}
          </p>

          {cards.length > 0 ? (
            <div className="mt-12 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {cards.map((post) => (
                <PostCard
                  key={post.slug}
                  post={post}
                  minutesLabel={(minutes) => t("readingTime", { minutes })}
                />
              ))}
            </div>
          ) : null}

          <div className="pt-14">
            <Link href="/blog" className={buttonClasses("outline")}>
              {t("backToBlog")}
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
