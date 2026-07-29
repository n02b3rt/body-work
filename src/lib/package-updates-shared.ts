/**
 * Client-safe types and pure helpers for the package-updates feature.
 * Keep Node APIs (`fs`, `path`) out of this file — client panels import it.
 */

export type PackageKind = 'runtime' | 'dev'

export type PackageUpdateStatus =
  | 'up-to-date'
  | 'update-available'
  | 'unknown'

export type PackageLinks = {
  /** Always present: https://www.npmjs.com/package/<name> */
  npm: string
  homepage: string | null
  repository: string | null
}

export type PackageUpdateRow = {
  name: string
  kind: PackageKind
  declared: string
  installed: string | null
  latest: string | null
  status: PackageUpdateStatus
  description: string | null
  links: PackageLinks
}

export type PackageUpdatesReport = {
  /** Bump when the on-disk JSON shape changes so old caches are discarded. */
  cacheVersion: number
  checkedAt: string
  rows: PackageUpdateRow[]
  totals: {
    packages: number
    updates: number
    unknown: number
  }
}

/** Auto-refresh interval and cache freshness window. */
export const PACKAGE_UPDATES_CACHE_TTL_MS = 24 * 60 * 60 * 1000

/** Invalidate `.data/package-updates.json` when row/report shape changes. */
export const PACKAGE_UPDATES_CACHE_VERSION = 2

/**
 * Compare two version strings as major.minor.patch (prerelease suffix ignored for the
 * numeric parts; a prerelease is lower than the same numbers without one).
 * Returns negative if a < b, 0 if equal, positive if a > b. Nulls sort as unknown.
 */
export function compareVersions(a: string, b: string): number {
  const pa = parseVersion(a)
  const pb = parseVersion(b)
  const len = Math.max(pa.parts.length, pb.parts.length)
  for (let i = 0; i < len; i++) {
    const da = pa.parts[i] ?? 0
    const db = pb.parts[i] ?? 0
    if (da !== db) return da - db
  }
  if (pa.prerelease && !pb.prerelease) return -1
  if (!pa.prerelease && pb.prerelease) return 1
  if (pa.prerelease && pb.prerelease) {
    return pa.prerelease.localeCompare(pb.prerelease)
  }
  return 0
}

function parseVersion(raw: string): { parts: number[]; prerelease: string | null } {
  const cleaned = raw.trim().replace(/^v/i, '')
  const [core, ...preParts] = cleaned.split('-')
  const parts = (core ?? '')
    .split('.')
    .map((segment) => {
      const n = parseInt(segment.replace(/[^\d].*$/, ''), 10)
      return Number.isFinite(n) ? n : 0
    })
  const prerelease = preParts.length > 0 ? preParts.join('-') : null
  return { parts, prerelease }
}

export function resolveStatus(
  installed: string | null,
  latest: string | null,
): PackageUpdateStatus {
  if (!installed || !latest) return 'unknown'
  try {
    return compareVersions(installed, latest) < 0 ? 'update-available' : 'up-to-date'
  } catch {
    return 'unknown'
  }
}

export function isReportStale(
  report: PackageUpdatesReport,
  nowMs: number = Date.now(),
): boolean {
  if (report.cacheVersion !== PACKAGE_UPDATES_CACHE_VERSION) return true
  const checked = new Date(report.checkedAt).getTime()
  if (!Number.isFinite(checked)) return true
  return nowMs - checked >= PACKAGE_UPDATES_CACHE_TTL_MS
}

export function nextCheckAtIso(checkedAt: string): string {
  return new Date(
    new Date(checkedAt).getTime() + PACKAGE_UPDATES_CACHE_TTL_MS,
  ).toISOString()
}

export function npmPackageUrl(name: string): string {
  return `https://www.npmjs.com/package/${name}`
}

/**
 * Turn npm `repository` (string or `{ url }`) into a browser-openable HTTPS URL.
 */
export function normalizeRepositoryUrl(input: unknown): string | null {
  let raw: string | null = null
  if (typeof input === 'string') {
    raw = input
  } else if (
    input &&
    typeof input === 'object' &&
    'url' in input &&
    typeof (input as { url: unknown }).url === 'string'
  ) {
    raw = (input as { url: string }).url
  }
  if (!raw) return null

  let s = raw.trim()
  if (!s) return null

  if (s.startsWith('git+')) s = s.slice(4)
  if (s.startsWith('git://')) s = `https://${s.slice(6)}`
  if (s.startsWith('github:')) s = `https://github.com/${s.slice(7)}`

  const ssh = s.match(/^git@([^:]+):(.+)$/i)
  if (ssh) {
    s = `https://${ssh[1]}/${ssh[2]}`
  }

  s = s.replace(/\.git$/i, '')
  s = s.replace(/\/$/, '')

  if (!/^https?:\/\//i.test(s)) return null
  return s
}

export function normalizeHomepageUrl(input: unknown): string | null {
  if (typeof input !== 'string') return null
  const s = input.trim()
  if (!s) return null
  if (/^https?:\/\//i.test(s)) return s
  if (s.startsWith('//')) return `https:${s}`
  // Bare domains occasionally appear in package metadata
  if (/^[\w.-]+\.[\w.-]+/.test(s)) return `https://${s}`
  return null
}

export function rowsWithUpdates(rows: PackageUpdateRow[]): PackageUpdateRow[] {
  return rows.filter((r) => r.status === 'update-available')
}
