import { mkdir, readFile, writeFile } from 'fs/promises'
import path from 'path'

import {
  isReportStale,
  normalizeHomepageUrl,
  normalizeRepositoryUrl,
  npmPackageUrl,
  PACKAGE_UPDATES_CACHE_TTL_MS,
  PACKAGE_UPDATES_CACHE_VERSION,
  resolveStatus,
  type PackageKind,
  type PackageUpdateRow,
  type PackageUpdatesReport,
  type PackageUpdateStatus,
} from '@/lib/package-updates-shared'

export type {
  PackageKind,
  PackageLinks,
  PackageUpdateRow,
  PackageUpdatesReport,
  PackageUpdateStatus,
} from '@/lib/package-updates-shared'

export {
  compareVersions,
  isReportStale,
  nextCheckAtIso,
  normalizeHomepageUrl,
  normalizeRepositoryUrl,
  npmPackageUrl,
  PACKAGE_UPDATES_CACHE_TTL_MS,
  PACKAGE_UPDATES_CACHE_VERSION,
  resolveStatus,
  rowsWithUpdates,
} from '@/lib/package-updates-shared'

type PackageJson = {
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
}

const FETCH_CONCURRENCY = 8
const FETCH_TIMEOUT_MS = 8_000
const CACHE_RELATIVE_PATH = path.join('.data', 'package-updates.json')

type GlobalWithScheduler = typeof globalThis & {
  __bwPackageUpdatesSchedulerStarted?: boolean
  __bwPackageUpdatesInFlight?: Promise<PackageUpdatesReport> | null
}

function projectRoot(): string {
  return process.cwd()
}

function cacheFilePath(): string {
  return path.join(projectRoot(), CACHE_RELATIVE_PATH)
}

async function readCache(): Promise<PackageUpdatesReport | null> {
  try {
    const raw = await readFile(cacheFilePath(), 'utf8')
    const data = JSON.parse(raw) as PackageUpdatesReport
    if (
      !data ||
      data.cacheVersion !== PACKAGE_UPDATES_CACHE_VERSION ||
      typeof data.checkedAt !== 'string' ||
      !Array.isArray(data.rows)
    ) {
      return null
    }
    return data
  } catch {
    return null
  }
}

async function writeCache(report: PackageUpdatesReport): Promise<void> {
  const filePath = cacheFilePath()
  await mkdir(path.dirname(filePath), { recursive: true })
  await writeFile(filePath, JSON.stringify(report, null, 2), 'utf8')
}

async function readPackageJson(): Promise<PackageJson> {
  const filePath = path.join(projectRoot(), 'package.json')
  const raw = await readFile(filePath, 'utf8')
  return JSON.parse(raw) as PackageJson
}

async function readInstalledVersion(name: string): Promise<string | null> {
  try {
    const pkgPath = path.join(
      projectRoot(),
      'node_modules',
      ...name.split('/'),
      'package.json',
    )
    const raw = await readFile(pkgPath, 'utf8')
    const pkg = JSON.parse(raw) as { version?: string }
    return typeof pkg.version === 'string' ? pkg.version : null
  } catch {
    return null
  }
}

type NpmLatestMeta = {
  version: string | null
  homepage: string | null
  repository: string | null
  description: string | null
}

async function fetchLatestMeta(name: string): Promise<NpmLatestMeta> {
  const empty: NpmLatestMeta = {
    version: null,
    homepage: null,
    repository: null,
    description: null,
  }
  const url = `https://registry.npmjs.org/${encodeURIComponent(name)}/latest`
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
      // Own file cache owns freshness; never rely on Next fetch cache for this.
      cache: 'no-store',
    })
    if (!res.ok) return empty
    const data = (await res.json()) as {
      version?: string
      homepage?: unknown
      repository?: unknown
      description?: unknown
    }
    return {
      version: typeof data.version === 'string' ? data.version : null,
      homepage: normalizeHomepageUrl(data.homepage),
      repository: normalizeRepositoryUrl(data.repository),
      description:
        typeof data.description === 'string' && data.description.trim()
          ? data.description.trim()
          : null,
    }
  } catch {
    return empty
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

  const runners = Array.from(
    { length: Math.min(concurrency, items.length) },
    () => run(),
  )
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

/** Hit package.json + npm and build a fresh report (no cache). */
async function buildFreshReport(): Promise<PackageUpdatesReport> {
  const pkg = await readPackageJson()
  const entries: { name: string; declared: string; kind: PackageKind }[] = []

  for (const [name, declared] of Object.entries(pkg.dependencies ?? {})) {
    entries.push({ name, declared, kind: 'runtime' })
  }
  for (const [name, declared] of Object.entries(pkg.devDependencies ?? {})) {
    entries.push({ name, declared, kind: 'dev' })
  }

  const rows = await mapPool(entries, FETCH_CONCURRENCY, async (entry) => {
    const [installed, meta] = await Promise.all([
      readInstalledVersion(entry.name),
      fetchLatestMeta(entry.name),
    ])
    return {
      name: entry.name,
      kind: entry.kind,
      declared: entry.declared,
      installed,
      latest: meta.version,
      status: resolveStatus(installed, meta.version),
      description: meta.description,
      links: {
        npm: npmPackageUrl(entry.name),
        homepage: meta.homepage,
        repository: meta.repository,
      },
    } satisfies PackageUpdateRow
  })

  rows.sort(sortRows)

  return {
    cacheVersion: PACKAGE_UPDATES_CACHE_VERSION,
    checkedAt: new Date().toISOString(),
    rows,
    totals: {
      packages: rows.length,
      updates: rows.filter((r) => r.status === 'update-available').length,
      unknown: rows.filter((r) => r.status === 'unknown').length,
    },
  }
}

async function buildAndCacheReport(): Promise<PackageUpdatesReport> {
  const g = globalThis as GlobalWithScheduler
  if (g.__bwPackageUpdatesInFlight) {
    return g.__bwPackageUpdatesInFlight
  }

  g.__bwPackageUpdatesInFlight = (async () => {
    try {
      const report = await buildFreshReport()
      await writeCache(report)
      return report
    } finally {
      g.__bwPackageUpdatesInFlight = null
    }
  })()

  return g.__bwPackageUpdatesInFlight
}

/**
 * Starts a process-wide interval that re-checks npm every 24h while the Node
 * process is up. Safe to call repeatedly. Also refreshes immediately if the
 * on-disk cache is missing or stale.
 */
export function ensurePackageUpdatesScheduler(): void {
  const g = globalThis as GlobalWithScheduler
  if (g.__bwPackageUpdatesSchedulerStarted) return
  g.__bwPackageUpdatesSchedulerStarted = true

  // Fire-and-forget: seed cache on first boot / after restart when stale.
  void getPackageUpdatesReport({ force: false }).catch(() => {
    // Best-effort; UI/API can retry.
  })

  const timer = setInterval(() => {
    void getPackageUpdatesReport({ force: true }).catch(() => {
      // Keep the interval alive even if one cycle fails (network blip).
    })
  }, PACKAGE_UPDATES_CACHE_TTL_MS)

  // Do not keep a short-lived process (scripts/tests) from exiting solely for this timer.
  // Long-lived `next start` always has other handles, so the interval still fires.
  if (typeof timer.unref === 'function') {
    timer.unref()
  }
}

/**
 * Return a package-updates report.
 * - `force: false` (default): use disk cache when younger than 24h; otherwise refresh.
 * - `force: true`: always re-query npm and rewrite the cache (manual "Sprawdź teraz").
 */
export async function getPackageUpdatesReport(options?: {
  force?: boolean
}): Promise<PackageUpdatesReport> {
  ensurePackageUpdatesScheduler()

  const force = options?.force === true
  if (!force) {
    const cached = await readCache()
    if (cached && !isReportStale(cached)) {
      return cached
    }
  }

  return buildAndCacheReport()
}
