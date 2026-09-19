/**
 * Which of the app's sites a request host belongs to, the one rule `src/proxy.ts` routes by.
 *
 * Shared with `robots.ts` and `sitemap.ts` because the proxy never sees those: its matcher skips
 * anything with a file extension, so `/robots.txt` and `/sitemap.xml` reach the same route handler
 * on every host. Without this the hub answered with Centrum's sitemap, listing another host's URLs,
 * which a crawler discards.
 */
export type Site = "dashboard" | "centrum" | "hub";

export const DEFAULT_DASHBOARD_HOST = "dash.localhost";
export const DEFAULT_CENTRUM_HOST = "centrum.localhost";

/** `Centrum.Example.pl:3000` → `centrum.example.pl`. */
export function hostnameOf(host: string | null | undefined) {
  return (host ?? "").split(":")[0].trim().toLowerCase();
}

export function siteForHost(
  host: string | null | undefined,
  env: { dashboardHost?: string; centrumHost?: string } = {},
): Site {
  const name = hostnameOf(host);
  if (name === (env.dashboardHost || DEFAULT_DASHBOARD_HOST).toLowerCase()) return "dashboard";
  if (name === (env.centrumHost || DEFAULT_CENTRUM_HOST).toLowerCase()) return "centrum";
  // Every other host is the hub, exactly as in the proxy.
  return "hub";
}

/** `siteForHost` with the hosts read from the environment, as the proxy reads them. */
export function siteForRequestHost(host: string | null | undefined): Site {
  return siteForHost(host, {
    dashboardHost: process.env.DASHBOARD_HOST,
    centrumHost: process.env.CENTRUM_HOST,
  });
}
