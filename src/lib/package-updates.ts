import { readFile } from 'fs/promises'
import path from 'path'

export type PackageKind = 'runtime' | 'dev'

export type PackageUpdateStatus =
  | 'up-to-date'
  | 'update-available'
  | 'unknown'

export type PackageUpdateRow = {
  name: string
  kind: PackageKind
  declared: string
  installed: string | null
  latest: string | null
  status: PackageUpdateStatus
}

export type PackageUpdatesReport = {
  checkedAt: string
  rows: PackageUpdateRow[]
  totals: {
    packages: number
    updates: number
    unknown: number
  }
}

type PackageJson = {
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
}

const REGISTRY_REVALIDATE_SECONDS = 3600
const FETCH_CONCURRENCY = 8
const FETCH_TIMEOUT_MS = 8_000

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
  // Same numeric core: release (no pre) > prerelease
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

function projectRoot(): string {
  return process.cwd()
}

async function readPackageJson(): Promise<PackageJson> {
  const filePath = path.join(projectRoot(), 'package.json')
  const raw = await readFile(filePath, 'utf8')
  return JSON.parse(raw) as PackageJson
}

async function readInstalledVersion(name: string): Promise<string | null> {
  try {
    const pkgPath = path.join(projectRoot(), 'node_modules', ...name.split('/'), 'package.json')
    const raw = await readFile(pkgPath, 'utf8')
    const pkg = JSON.parse(raw) as { version?: string }
    return typeof pkg.version === 'string' ? pkg.version : null
  } catch {
    return null
  }
}

async function fetchLatestVersion(name: string): Promise<string | null> {
  const url = `https://registry.npmjs.org/${encodeURIComponent(name)}/latest`
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
      next: { revalidate: REGISTRY_REVALIDATE_SECONDS },
    })
    if (!res.ok) return null
    const data = (await res.json()) as { version?: string }
    return typeof data.version === 'string' ? data.version : null
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

async function mapPool<T, R>(
  items: T[],
  concurrency: number,
  worker: (item: T) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length)
  let next = 0

  async function run(): Promise<void> {
    while (next < items.length) {
      const index = next
      next += 1
      results[index] = await worker(items[index]!)
    }
  }

  const runners = Array.from({ length: Math.min(concurrency, items.length) }, () => run())
  await Promise.all(runners)
  return results
}

function statusRank(status: PackageUpdateStatus): number {
  if (status === 'update-available') return 0
  if (status === 'unknown') return 1
  return 2
}

function sortRows(a: PackageUpdateRow, b: PackageUpdateRow): number {
  const byStatus = statusRank(a.status) - statusRank(b.status)
  if (byStatus !== 0) return byStatus
  return a.name.localeCompare(b.name)
}

/**
 * Build a report of direct dependencies vs the npm registry.
 * Informational only — never mutates packages.
 */
export async function getPackageUpdatesReport(): Promise<PackageUpdatesReport> {
  const pkg = await readPackageJson()
  const entries: { name: string; declared: string; kind: PackageKind }[] = []

  for (const [name, declared] of Object.entries(pkg.dependencies ?? {})) {
    entries.push({ name, declared, kind: 'runtime' })
  }
  for (const [name, declared] of Object.entries(pkg.devDependencies ?? {})) {
    entries.push({ name, declared, kind: 'dev' })
  }

  const rows = await mapPool(entries, FETCH_CONCURRENCY, async (entry) => {
    const [installed, latest] = await Promise.all([
      readInstalledVersion(entry.name),
      fetchLatestVersion(entry.name),
    ])
    return {
      name: entry.name,
      kind: entry.kind,
      declared: entry.declared,
      installed,
      latest,
      status: resolveStatus(installed, latest),
    } satisfies PackageUpdateRow
  })

  rows.sort(sortRows)

  return {
    checkedAt: new Date().toISOString(),
    rows,
    totals: {
      packages: rows.length,
      updates: rows.filter((r) => r.status === 'update-available').length,
      unknown: rows.filter((r) => r.status === 'unknown').length,
    },
  }
}
