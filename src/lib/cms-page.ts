import { getPayload } from "payload";
import config from "@payload-config";
import type { Page } from "@/payload-types";

/**
 * Reading pages built in the admin page builder.
 *
 * Pages are a nested tree, so a page's public path is its breadcrumb trail
 * (`/uslugi/masaz`), not its slug alone. Slugs are unique collection-wide, so a
 * lookup can go by slug and then verify the trail, which is one indexed query
 * instead of a query against a nested array.
 */

export type CmsPage = Page;

/** `/uslugi/masaz` from the catch-all's segments, ignoring empty and stray parts. */
export function pathFromSegments(segments: string[] | undefined): string {
  const clean = (segments ?? []).filter((segment) => segment.length > 0);
  return clean.length > 0 ? `/${clean.join("/")}` : "/";
}

/** The path a page is published at, taken from the breadcrumbs the tree maintains. */
export function pagePath(page: Pick<Page, "breadcrumbs" | "slug">): string {
  const trail = page.breadcrumbs;
  const url = Array.isArray(trail) ? trail[trail.length - 1]?.url : undefined;
  if (typeof url === "string" && url.length > 0) return url;
  return `/${page.slug ?? ""}`;
}

/**
 * The published page at `path`, or null.
 *
 * `_status` is filtered explicitly: with drafts enabled the collection's own
 * table holds the draft too, so leaving it out would publish unfinished pages.
 *
 * `depth: 3` because population counts relationship hops, not field nesting: an
 * upload inside a section's elements is one hop, a `savedComponent` is one and
 * its own pictures are two. Three leaves room for a composition that embeds
 * another one. Below that, photographs render as bare ids.
 */
export async function findPublishedPage(path: string): Promise<CmsPage | null> {
  const segments = path.split("/").filter(Boolean);
  const slug = segments[segments.length - 1];
  if (!slug) return null;

  try {
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: "pages",
      depth: 3,
      limit: 1,
      where: {
        and: [{ slug: { equals: slug } }, { _status: { not_equals: "draft" } }],
      },
    });

    const page = result.docs[0];
    if (!page) return null;
    return pagePath(page) === path ? page : null;
  } catch {
    // A database that is briefly unreachable should render the 404 the catch-all
    // already renders, not a 500.
    return null;
  }
}

/** Every published page, for `generateStaticParams` and the sitemap. */
export async function listPublishedPages(): Promise<
  { path: string; updatedAt: string; noIndex: boolean }[]
> {
  try {
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: "pages",
      depth: 0,
      limit: 500,
      where: { _status: { not_equals: "draft" } },
    });

    return result.docs.map((doc) => ({
      path: pagePath(doc),
      updatedAt: doc.updatedAt,
      noIndex: doc.meta?.noIndex === true,
    }));
  } catch {
    return [];
  }
}
