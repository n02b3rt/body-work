import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import { siteForRequestHost } from "./lib/site-host";

const handleI18n = createMiddleware(routing);

/** Which site this request is for, see docs/sites.md. The Host header wins so `dash.localhost`
 * still works when it resolves to 127.0.0.1. */
function siteOf(request: NextRequest) {
  return siteForRequestHost(request.headers.get("host") || request.nextUrl.host);
}

function isAdminPath(pathname: string) {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

/** The page builder's full-screen editor, same host-only rule as `/admin`. */
function isBuilderPath(pathname: string) {
  return (
    pathname === "/edytor" ||
    pathname.startsWith("/edytor/") ||
    pathname === "/podglad" ||
    pathname.startsWith("/podglad/")
  );
}

function isApiPath(pathname: string) {
  return pathname === "/api" || pathname.startsWith("/api/");
}

/** Plain 404, not a redirect, so a gated host never leaks another host's shape. */
function notFound() {
  return new NextResponse("Not Found", {
    status: 404,
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}

/** The hub's one screen, on any host that isn't the dashboard or Centrum. */
function isHubHomePath(pathname: string) {
  return pathname === "/" || pathname === "/en" || pathname === "/en/";
}

/**
 * One proxy doing two jobs, because Next allows only one.
 *
 * Host gating runs first: the dashboard is reachable on `DASHBOARD_HOST` only, and
 * everything that isn't Payload's own surface is then handed to next-intl. Delegating
 * that last step is the part that matters, with `localePrefix: "as-needed"` it is the
 * i18n middleware that rewrites `/` to `/pl` and negotiates the locale, so skipping it
 * leaves the public site with no locale routing at all.
 */
export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Dashboard host: serve Payload, never the localised site.
  if (siteOf(request) === "dashboard") {
    if (pathname === "/") {
      const url = request.nextUrl.clone();
      url.pathname = "/admin";
      return NextResponse.rewrite(url);
    }

    // Vanity shortcuts: the browser keeps `/admin/c/…` and `/admin/g/…` while Payload
    // still sees its own `/admin/collections/…` and `/admin/globals/…`.
    const short = pathname.match(/^\/admin\/(c|g)(?:\/(.*))?$/);
    if (short) {
      const segment = short[1] === "c" ? "collections" : "globals";
      const rest = short[2] ?? "";
      const url = request.nextUrl.clone();
      url.pathname = rest ? `/admin/${segment}/${rest}` : `/admin/${segment}`;
      return NextResponse.rewrite(url);
    }

    return NextResponse.next();
  }

  // Public hosts get a plain 404 for the admin and the builder, not a redirect,
  // which would leak the dashboard hostname.
  if (isAdminPath(pathname) || isBuilderPath(pathname)) {
    return notFound();
  }

  // Payload's REST/GraphQL and its upload files must not be locale-rewritten.
  if (isApiPath(pathname)) {
    return NextResponse.next();
  }

  // Centrum host: its tree lives at `(centrum)/`, a route group, so every path is unchanged.
  if (siteOf(request) === "centrum") {
    return handleI18n(request);
  }

  // Every other host is the hub: one screen at `/`, invisibly rewritten to the real `hub`
  // segment (route groups can't share a path across hosts, see docs/decisions.md), same
  // trick as the dashboard's own `/` → `/admin` rewrite above. Anything else 404s, so this
  // host can never fall through to Centrum's full route tree.
  if (!isHubHomePath(pathname)) {
    return notFound();
  }
  const target = pathname === "/" ? "/hub" : "/en/hub";
  request.nextUrl.pathname = target;
  let response = handleI18n(request);
  // next-intl only rewrites a path that lacks a locale prefix. `/en/hub` already has one, so it
  // answers `NextResponse.next()`, which serves the *original* `/en`: Centrum's English homepage
  // on the hub host. Rewrite explicitly then, keeping its headers (the locale cookie).
  if (response.headers.get("x-middleware-next")) {
    const url = request.nextUrl.clone();
    url.pathname = target;
    const headers = new Headers(response.headers);
    headers.delete("x-middleware-next");
    response = NextResponse.rewrite(url, { headers });
  }
  // next-intl builds its `hreflang` alternates from the pathname it was handed, which here is
  // the rewritten `/hub`: an address that 404s on this host, so advertising it to crawlers is
  // worse than saying nothing. The page's own `generateMetadata` emits the real pair instead.
  response.headers.delete("link");
  return response;
}

export const config = {
  // `/admin` and `/api` stay in scope so they can be gated by host; Next internals and
  // anything with a file extension are skipped.
  matcher: ["/((?!_next|_vercel|.*\\..*).*)"],
};
