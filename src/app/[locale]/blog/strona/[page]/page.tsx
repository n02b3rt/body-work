import { notFound } from "next/navigation";
import { getPayload } from "payload";
import { getTranslations, setRequestLocale } from "next-intl/server";
import config from "@payload-config";
import { PageHero } from "@/components/centrum/PageHero";
import { BlogList } from "@/components/centrum/BlogList";
import { routing } from "@/i18n/routing";
import { localePath, pageMetadata } from "@/lib/metadata";
import { BLOG_PAGE_SIZE, blogListingData } from "@/lib/blog-listing";

/**
 * Page two onwards of the listing, at `/blog/strona/2`.
 *
 * The pagination used to live in `?page=N`, which kept `/blog` dynamic: a route that reads
 * `searchParams` cannot be prerendered, so the listing was the one blog page still answering
 * with `Cache-Control: no-store`. Moving the page number into the path makes every step of
 * the listing static and CDN-cacheable, and a crawler still walks the whole chain.
 *
 * Page one is `/blog` itself, so this route starts at two and 404s below that rather than
 * serving the same content under a second URL.
 */

type PageProps = { params: Promise<{ locale: string; page: string }> };

export const revalidate = 3600;

export async function generateStaticParams() {
  const payload = await getPayload({ config });
  const posts = await payload.count({
    collection: "posts",
    where: { _status: { not_equals: "draft" } },
  });

  // The featured card takes the newest post, so the grid holds one fewer.
  const pages = Math.ceil(Math.max(0, posts.totalDocs - 1) / BLOG_PAGE_SIZE);

  return routing.locales.flatMap((locale) =>
    Array.from({ length: Math.max(0, pages - 1) }, (_, index) => ({
      locale,
      page: String(index + 2),
    })),
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { locale, page } = await params;
  const t = await getTranslations({ locale, namespace: "Blog" });

  return pageMetadata({
    locale,
    path: `/blog/strona/${page}`,
    title: t("pageTitle", { page }),
    description: t("metaDescription"),
  });
}

export default async function BlogListingPage({ params }: PageProps) {
  const { locale, page } = await params;
  setRequestLocale(locale);

  const pageNumber = Number.parseInt(page, 10);
  if (!Number.isInteger(pageNumber) || pageNumber < 2) notFound();

  const t = await getTranslations("Blog");
  const { cards, categories, gridCount } = await blogListingData(locale);

  const initialCount = Math.min(pageNumber * BLOG_PAGE_SIZE, gridCount);
  // Past the end of the list there is nothing to show, so this is a 404 rather than an empty
  // page that a crawler would happily index.
  if (initialCount <= (pageNumber - 1) * BLOG_PAGE_SIZE && gridCount > 0) notFound();

  const nextPageHref =
    initialCount < gridCount
      ? localePath(locale, `/blog/strona/${pageNumber + 1}`)
      : null;

  return (
    <>
      <PageHero title={t("title")} titleSize="display" titleAlign="right" />
      <BlogList
        posts={cards}
        categories={categories}
        initialCount={initialCount}
        nextPageHref={nextPageHref}
      />
    </>
  );
}
