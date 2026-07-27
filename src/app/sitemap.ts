import { readdir } from "fs/promises";
import path from "path";
import type { MetadataRoute } from "next";
import { getPayload } from "payload";
import config from "@payload-config";
import { routing } from "@/i18n/routing";
import { SITE_URL, localePath } from "@/lib/metadata";

/**
 * Static routes are discovered by walking `src/app/[locale]` rather than kept in a list:
 * a hand-maintained list drifts the moment someone adds a page, and this sitemap exists
 * precisely because the original site had one and we didn't.
 *
 * Dynamic segments (`[slug]`) are skipped here and their real URLs come from the CMS.
 */

/** Real pages that still don't belong in a sitemap. `/newsletter` only ever renders the
 *  result of clicking a link in an email, and carries `robots: noindex` to match. */
const EXCLUDED = new Set(["/newsletter"]);

async function staticRoutes(): Promise<string[]> {
  const root = path.join(process.cwd(), "src", "app", "[locale]");
  const found: string[] = [];

  async function walk(dir: string, route: string) {
    const entries = await readdir(dir, { withFileTypes: true });
    if (entries.some((e) => e.isFile() && e.name === "page.tsx")) {
      found.push(route || "/");
    }
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      // Skip dynamic segments and route groups.
      if (entry.name.startsWith("[") || entry.name.startsWith("(")) continue;
      await walk(path.join(dir, entry.name), `${route}/${entry.name}`);
    }
  }

  await walk(root, "");
  return found.filter((route) => !EXCLUDED.has(route)).sort();
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = await staticRoutes();

  let posts: { slug: string; updatedAt: string }[] = [];
  try {
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: "posts",
      limit: 500,
      depth: 0,
      where: { _status: { not_equals: "draft" } },
    });
    posts = result.docs
      .filter((doc) => doc.slug)
      .map((doc) => ({ slug: doc.slug as string, updatedAt: doc.updatedAt }));
  } catch {
    // A sitemap that lists the static pages is far better than a build that fails
    // because the database happens to be unreachable.
  }

  const entry = (route: string, lastModified?: string, priority = 0.7) => ({
    url: `${SITE_URL}${localePath(routing.defaultLocale, route)}`,
    lastModified: lastModified ? new Date(lastModified) : new Date(),
    changeFrequency: "monthly" as const,
    priority,
    alternates: {
      languages: Object.fromEntries(
        routing.locales.map((locale) => [locale, `${SITE_URL}${localePath(locale, route)}`]),
      ),
    },
  });

  return [
    entry("/", undefined, 1),
    ...routes.filter((route) => route !== "/").map((route) => entry(route)),
    ...posts.map((post) => entry(`/blog/${post.slug}`, post.updatedAt, 0.5)),
  ];
}
