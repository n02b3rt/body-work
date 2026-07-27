import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/centrum/PageHero";
import { BlogList } from "@/components/centrum/BlogList";
import { localePath, pageMetadata } from "@/lib/metadata";
import { BLOG_PAGE_SIZE, blogListingData } from "@/lib/blog-listing";

/**
 * Page one of the listing.
 *
 * It used to read `?page` from `searchParams`, and that is what kept it dynamic: a route
 * reading search params cannot be prerendered, so this was the last blog page still answering
 * with `Cache-Control: no-store`. The page number lives in the path now, see the sibling
 * `strona/[page]` route, which makes every step of the listing static.
 */

type PageProps = { params: Promise<{ locale: string }> };

export const revalidate = 3600;

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Blog" });

  // Without its own description the listing fell through to the layout's site-wide one, so it
  // described the centre rather than the blog.
  return pageMetadata({
    locale,
    path: "/blog",
    title: t("title"),
    description: t("metaDescription"),
  });
}

export default async function BlogPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Blog");
  const { cards, categories, gridCount } = await blogListingData();

  const initialCount = Math.min(BLOG_PAGE_SIZE, gridCount);
  const nextPageHref =
    initialCount < gridCount ? `${localePath(locale, "/blog/strona/2")}` : null;

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
