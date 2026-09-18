import { readdir, stat } from "fs/promises";
import path from "path";
import type { MetadataRoute } from "next";
import { getPayload } from "payload";
import config from "@payload-config";
import { routing } from "@/i18n/routing";
import { listPublishedPages } from "@/lib/cms-page";
import { SITE_URL, localePath } from "@/lib/metadata";

/**
 * Static routes are discovered by walking `src/app/[locale]` rather than kept in a list:
 * a hand-maintained list drifts the moment someone adds a page, and this sitemap exists
 * precisely because the original site had one and we didn't.
 *
 * Dynamic segments (`[slug]`) are skipped here and their real URLs come from the CMS.
 */

/** Real pages that still don't belong in a sitemap. `/newsletter` only ever renders the
 *  result of clicking a link in an email, and carries `robots: noindex` to match. `/hub` is
 *  Centrum's own sitemap picking up the hub site's landing page: its real canonical URL is a
 *  different host's `/`, reached only through `proxy.ts`'s host rewrite, see `docs/sites.md`. */
const EXCLUDED = new Set(["/newsletter", "/hub"]);

type StaticRoute = { route: string; lastModified: Date };

async function staticRoutes(): Promise<StaticRoute[]> {
  const root = path.join(process.cwd(), "src", "app", "[locale]");
  const found: StaticRoute[] = [];

  async function walk(dir: string, route: string) {
    const entries = await readdir(dir, { withFileTypes: true });
    if (entries.some((e) => e.isFile() && e.name === "page.tsx")) {
      // The route file's own mtime. Every static route used to report `new Date()`, so all 27
      // of them claimed to have changed on the current request, which is a freshness signal
      // no crawler should believe and several are documented as discounting.
      const mtime = await stat(path.join(dir, "page.tsx"))
        .then((info) => info.mtime)
        .catch(() => new Date());
      found.push({ route: route || "/", lastModified: mtime });
    }
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      // Dynamic segments have their real URLs come from the CMS instead: skip them.
      if (entry.name.startsWith("[")) continue;
      // Route groups don't add a URL segment, so recurse into them under the *same* route
      // rather than skipping them outright, or every route inside one (all of Centrum, once
      // it moved into `(centrum)/`) would silently vanish from the sitemap.
      if (entry.name.startsWith("(")) {
        await walk(path.join(dir, entry.name), route);
        continue;
      }
      await walk(path.join(dir, entry.name), `${route}/${entry.name}`);
    }
  }

  await walk(root, "");
  return found
    .filter((item) => !EXCLUDED.has(item.route))
    .sort((a, b) => a.route.localeCompare(b.route));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = await staticRoutes();

  // Pages built in the admin page builder. The filesystem walk cannot see them,
  // and a published page missing from the sitemap is the kind of gap this file
  // exists to close. `noIndex` pages are left out: listing a page we ask
  // crawlers to skip is a contradiction.
  const cmsPages = (await listPublishedPages()).filter((page) => !page.noIndex);

  let posts: { slug: string; updatedAt: string }[] = [];
  let categories: string[] = [];
  try {
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: "posts",
      limit: 500,
      depth: 0,
      where: { _status: { not_equals: "draft" } },
    });
    posts = result.docs
      // Listing a noindex URL here would hand crawlers two contradictory instructions.
      .filter((doc) => doc.slug && !doc.meta?.noIndex)
      .map((doc) => ({ slug: doc.slug as string, updatedAt: doc.updatedAt }));

    // Category archives are generated from the CMS too, so they belong here rather than in
    // the filesystem walk, which only sees static folders.
    const categoryResult = await payload.find({ collection: "categories", limit: 50, depth: 0 });
    categories = categoryResult.docs.map((doc) => doc.slug).filter(Boolean) as string[];
  } catch {
    // A sitemap that lists the static pages is far better than a build that fails
    // because the database happens to be unreachable.
  }

  const entry = (
    route: string,
    lastModified: Date,
    priority = 0.7,
    /** Posts are Polish on both locales, so listing an English alternate for them would
     *  repeat the `hreflang` mistake the post pages just had removed. */
    bilingual = true,
  ) => ({
    url: `${SITE_URL}${localePath(routing.defaultLocale, route)}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority,
    ...(bilingual
      ? {
          alternates: {
            languages: Object.fromEntries(
              routing.locales.map((locale) => [
                locale,
                `${SITE_URL}${localePath(locale, route)}`,
              ]),
            ),
          },
        }
      : {}),
  });

  const home = routes.find((item) => item.route === "/");
  // An archive is as fresh as the newest post it lists.
  const newest = posts.reduce<Date>(
    (latest, post) => (new Date(post.updatedAt) > latest ? new Date(post.updatedAt) : latest),
    new Date(0),
  );

  return [
    entry("/", home?.lastModified ?? new Date(), 1),
    ...routes
      .filter((item) => item.route !== "/")
      .map((item) => entry(item.route, item.lastModified)),
    // Polish only, like the pages themselves, so no `hreflang` pair.
    ...cmsPages.map((page) => entry(page.path, new Date(page.updatedAt), 0.6, false)),
    ...categories.map((slug) => entry(`/blog/kategoria/${slug}`, newest, 0.6, false)),
    ...posts.map((post) =>
      entry(`/blog/${post.slug}`, new Date(post.updatedAt), 0.5, false),
    ),
  ];
}
