'use client'

import {
  PackageCheckToolbar,
  PackageTable,
  fetchPackageReport,
  kindLabel,
} from '@/components/admin/package-report-ui'
import {
  nextCheckAtIso,
  rowsWithUpdates,
  type PackageUpdatesReport,
} from '@/lib/package-updates-shared'
import { formatDateTimePl } from '@/lib/format-date'
import { Link } from '@payloadcms/ui'
import React, { useState } from 'react'

type Props = {
  initialReport: PackageUpdatesReport
}

/**
 * Kokpit → Aktualizacje: only packages with a newer npm release.
 */
export function UpdatesPanel({ initialReport }: Props) {
  const [report, setReport] = useState(initialReport)
  const [error, setError] = useState<string | null>(null)
  const [checking, setChecking] = useState(false)

  const updateRows = rowsWithUpdates(report.rows)
  const runtimeRows = updateRows.filter((r) => r.kind === 'runtime')
  const devRows = updateRows.filter((r) => r.kind === 'dev')
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
          <>
            <span className="bw-updates__summary-sep" aria-hidden>
              ·
            </span>
            <Link className="bw-updates__ext-link" href="/admin/libraries">
              Wszystkie biblioteki
            </Link>
          </>
        }
      />

      {error ? (
        <p className="bw-updates__error" role="alert">
          {error}
        </p>
      ) : null}

      {updateRows.length === 0 ? (
        <p className="bw-updates__empty">
          Brak dostępnych aktualizacji — wszystkie sprawdzone biblioteki są na
          najnowszej wersji (albo nie udało się ich porównać). Pełną listę z
          linkami znajdziesz w{' '}
          <Link className="bw-updates__ext-link" href="/admin/libraries">
            Zarządzanie → Biblioteki
          </Link>
          .
        </p>
      ) : (
        <>
          <PackageTable
            title={kindLabel.runtime}
            rows={runtimeRows}
            mode="updates"
          />
          <PackageTable title={kindLabel.dev} rows={devRows} mode="updates" />
        </>
      )}
    </>
  )
}
