import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

function getDashboardHost(): string {
  return (process.env.DASHBOARD_HOST || 'dash.localhost').toLowerCase()
}

function hostnameOf(request: NextRequest): string {
  // Prefer Host header so dash.localhost works when resolved to 127.0.0.1
  const hostHeader = request.headers.get('host') || request.nextUrl.host
  return hostHeader.split(':')[0].toLowerCase()
}

function isDashboardHost(hostname: string): boolean {
  return hostname === getDashboardHost()
}

function isAdminPath(pathname: string): boolean {
  return pathname === '/admin' || pathname.startsWith('/admin/')
}

/**
 * Dashboard is only reachable on DASHBOARD_HOST.
 * Public hosts get a plain 404 for /admin — no redirect (would leak the dash hostname).
 */
export function proxy(request: NextRequest) {
  const hostname = hostnameOf(request)
  const { pathname } = request.nextUrl

  if (isDashboardHost(hostname)) {
    if (pathname === '/') {
      const url = request.nextUrl.clone()
      url.pathname = '/admin'
      return NextResponse.rewrite(url)
    }
    return NextResponse.next()
  }

  if (isAdminPath(pathname)) {
    return new NextResponse('Not Found', {
      status: 404,
      headers: { 'content-type': 'text/plain; charset=utf-8' },
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all paths except static assets that never need host checks.
     * Keep /admin and /api in scope so we can block or allow by host.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
