import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { SITE_URL } from "@/lib/metadata";
import { siteForRequestHost } from "@/lib/site-host";
import { HUB_URL } from "./[locale]/hub/urls";

/**
 * Per host, because the proxy never sees `/robots.txt` (its matcher skips file extensions) and
 * the hub used to answer with Centrum's file, pointing crawlers at another host's sitemap.
 */
export default async function robots(): Promise<MetadataRoute.Robots> {
  const site = siteForRequestHost((await headers()).get("host"));

  // The dashboard is Payload's login screen: nothing there belongs in an index.
  if (site === "dashboard") {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

  const origin = site === "hub" ? HUB_URL : SITE_URL;
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // The admin panel already 404s on public hosts (see `src/proxy.ts`), and
        // Payload's REST/GraphQL surface has no business in an index.
        disallow: ["/admin", "/api/"],
      },
    ],
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}
