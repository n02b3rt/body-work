'use client'

import {
  PackageCheckToolbar,
  PackageTable,
  fetchPackageReport,
  kindLabel,
} from '@/components/admin/package-report-ui'
import {
  nextCheckAtIso,
  type PackageUpdatesReport,
} from '@/lib/package-updates-shared'
import { formatDateTimePl } from '@/lib/format-date'
import { Link } from '@payloadcms/ui'
import React, { useState } from 'react'

type Props = {
  initialReport: PackageUpdatesReport
}

/**
 * Zarządzanie → Biblioteki: full direct-dependency inventory with npm/site/repo links.
 */
export function LibrariesPanel({ initialReport }: Props) {
  const [report, setReport] = useState(initialReport)
  const [error, setError] = useState<string | null>(null)
  const [checking, setChecking] = useState(false)

  const runtimeRows = report.rows.filter((r) => r.kind === 'runtime')
  const devRows = report.rows.filter((r) => r.kind === 'dev')
  const nextCheck = nextCheckAtIso(report.checkedAt)

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
          report.totals.updates > 0 ? (
            <>
              <span className="bw-updates__summary-sep" aria-hidden>
                ·
              </span>
              <Link className="bw-updates__ext-link" href="/admin/updates">
                Tylko aktualizacje ({report.totals.updates})
              </Link>
            </>
          ) : null
        }
      />

      {error ? (
        <p className="bw-updates__error" role="alert">
          {error}
        </p>
      ) : null}

      <PackageTable title={kindLabel.runtime} rows={runtimeRows} mode="libraries" />
      <PackageTable title={kindLabel.dev} rows={devRows} mode="libraries" />
    </>
  )
}
