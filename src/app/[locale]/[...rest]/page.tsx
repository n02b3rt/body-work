import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { RichText } from "@payloadcms/richtext-lexical/react";
import { Container } from "@/components/ui/Container";
import { PageSections } from "@/components/page-blocks/PageSections";
import { routing } from "@/i18n/routing";
import { findPublishedPage, listPublishedPages, pathFromSegments } from "@/lib/cms-page";
import { mediaPath } from "@/lib/media";
import { pageMetadata } from "@/lib/metadata";

/**
 * Two jobs, in this order: serve a page built in the admin page builder, and
 * otherwise hand the URL to `[locale]/not-found.tsx`.
 *
 * The 404 half is why this file existed first. Without it, Next resolves an
 * unmatched path against the **root** `not-found`, and this app deliberately has
 * no root layout (`[locale]` and `(payload)` each own their `<html>`), so
 * visitors got Next's unstyled built-in 404 instead of ours. A `notFound()`
 * raised from a page *inside* the segment does resolve to the segment's own
 * boundary, which is what this turns every bad URL into.
 *
 * The alternative is Next's `global-not-found`, still behind an experimental flag.
 *
 * Catch-all segments have the lowest routing priority, so a CMS page can never
 * shadow a hand-built route: `/cennik` stays the coded page even if someone
 * creates a CMS page with that slug.
 */

type PageProps = {
  params: Promise<{ locale: string; rest?: string[] }>;
};

export const revalidate = 3600;

export async function generateStaticParams() {
  const pages = await listPublishedPages();
  return pages.map((page) => ({
    locale: routing.defaultLocale,
    rest: page.path.split("/").filter(Boolean),
  }));
}

/**
 * CMS pages carry no localised fields, so they exist in Polish only. Per the
 * fallback rule in docs/i18n.md, that means they are absent from English rather
 * than served as Polish prose under an English URL.
 */
function isPolish(locale: string): boolean {
  return locale === routing.defaultLocale;
}

export async function generateMetadata({ params }: PageProps) {
  const { locale, rest } = await params;
  if (!isPolish(locale)) return {};

  const path = pathFromSegments(rest);
  const page = await findPublishedPage(path);
  if (!page) return {};

  const ogImage =
    page.meta?.image && typeof page.meta.image === "object"
      ? mediaPath(page.meta.image.url)
      : null;

  return {
    ...pageMetadata({
      locale,
      path,
      title: page.meta?.title || page.title,
      description: page.meta?.description || undefined,
      image: ogImage,
      singleLanguage: true,
    }),
    ...(page.meta?.noIndex ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function CatchAllPage({ params }: PageProps) {
  const { locale, rest } = await params;
  setRequestLocale(locale);

  if (!isPolish(locale)) notFound();

  const page = await findPublishedPage(pathFromSegments(rest));
  if (!page) notFound();

  const hasSections = Array.isArray(page.layout) && page.layout.length > 0;

  return (
    <main>
      <PageSections layout={page.layout} />

      {page.content ? (
        <Container as="section" className="py-12">
          <div className="blog-prose">
            {/* Typed off `RichText` itself rather than the `/lexical` subpath,
              * as `PostBody` does. */}
            <RichText data={page.content as Parameters<typeof RichText>[0]["data"]} />
          </div>
        </Container>
      ) : null}

      {/* A page with a title and nothing else is a real editing state, and an
        * empty <main> reads as a broken deploy rather than an unfinished page. */}
      {!hasSections && !page.content ? (
        <Container as="section" className="py-24">
          <h1 className="font-normal text-h-mobile text-brand-navy wide:text-h-section">
            {page.title}
          </h1>
        </Container>
      ) : null}
    </main>
  );
}
