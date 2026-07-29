'use client'

import {
  PackageCheckToolbar,
  PackageTable,
  fetchPackageReport,
  kindLabel,
} from '@/components/admin/package-report-ui'
import { AiSuggestButton } from '@/components/admin/ai/AiSuggestButton'
import { callAdminAi, isAiClientError } from '@/lib/ai/client'
import {
  nextCheckAtIso,
  type PackageUpdatesReport,
} from '@/lib/package-updates-shared'
import { formatDateTimePl } from '@/lib/format-date'
import { Link } from '@payloadcms/ui'
import React, { useEffect, useState } from 'react'

type Props = {
  initialReport: PackageUpdatesReport
}

/**
 * Zarządzanie → Biblioteki: full direct-dependency inventory with npm/site/repo links
 * and optional Polish AI blurbs.
 */
export function LibrariesPanel({ initialReport }: Props) {
  const [report, setReport] = useState(initialReport)
  const [blurbs, setBlurbs] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [checking, setChecking] = useState(false)
  const [aiBusy, setAiBusy] = useState(false)

  const runtimeRows = report.rows.filter((r) => r.kind === 'runtime')
  const devRows = report.rows.filter((r) => r.kind === 'dev')
  const nextCheck = nextCheckAtIso(report.checkedAt)
  const missingBlurbs = report.rows.filter((r) => !blurbs[r.name]).length

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      await Promise.resolve()
      if (cancelled) return
      const result = await callAdminAi<{ blurbs: Record<string, string> }>({
        task: 'library-blurbs-get',
      })
      if (cancelled || isAiClientError(result)) return
      setBlurbs(result.data.blurbs || {})
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  async function checkNow() {
    if (checking) return
    setError(null)
    setChecking(true)
    try {
      const result = await fetchPackageReport(true)
      if (result.error || !result.report) {
        throw new Error(result.error || 'Nie udało się sprawdzić wersji pakietów.')
      }
      setReport(result.report)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Nie udało się sprawdzić wersji pakietów.',
      )
    } finally {
      setChecking(false)
    }
  }

  async function generateBlurbs() {
    if (aiBusy) return
    setAiBusy(true)
    setError(null)
    const result = await callAdminAi<{
      blurbs: Record<string, string>
      generated: string[]
    }>({
      task: 'library-blurbs',
      onlyMissing: true,
      limit: 12,
      packages: report.rows.map((r) => ({
        name: r.name,
        kind: r.kind,
        npmDescription: r.description,
      })),
    })
    setAiBusy(false)
    if (isAiClientError(result)) {
      setError(result.error)
      return
    }
    setBlurbs(result.data.blurbs)
  }

  return (
    <>
      <PackageCheckToolbar
        packages={report.totals.packages}
        updates={report.totals.updates}
        unknown={report.totals.unknown}
        checkedAtLabel={formatDateTimePl(report.checkedAt)}
        nextCheckLabel={formatDateTimePl(nextCheck)}
        checking={checking}
        onCheck={() => {
          void checkNow()
        }}
        extra={
          <>
            {report.totals.updates > 0 ? (
              <>
                <span className="bw-updates__summary-sep" aria-hidden>
                  ·
                </span>
                <Link className="bw-updates__ext-link" href="/admin/updates">
                  Tylko aktualizacje ({report.totals.updates})
                </Link>
              </>
            ) : null}
            <span className="bw-updates__summary-sep" aria-hidden>
              ·
            </span>
            <AiSuggestButton
              label={
                missingBlurbs > 0
                  ? `Opisy PL (AI), brakuje ${missingBlurbs}`
                  : 'Odśwież opisy PL (AI)'
              }
              busy={aiBusy}
              onClick={() => {
                void generateBlurbs()
              }}
            />
          </>
        }
      />

      {error ? (
        <p className="bw-updates__error" role="alert">
          {error}
        </p>
      ) : null}

      <PackageTable
        title={kindLabel.runtime}
        rows={runtimeRows}
        mode="libraries"
        blurbs={blurbs}
      />
      <PackageTable
        title={kindLabel.dev}
        rows={devRows}
        mode="libraries"
        blurbs={blurbs}
      />
    </>
  )
}
