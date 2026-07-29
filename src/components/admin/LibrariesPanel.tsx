'use client'

import { PackageTable, kindLabel } from '@/components/admin/package-report-ui'
import type { PackageUpdatesReport } from '@/lib/package-updates-shared'
import React from 'react'

type Props = {
  initialReport: PackageUpdatesReport
}

/**
 * Zarządzanie → Biblioteki: inventory of direct dependencies — installed
 * version plus npm / site / GitHub icon links. No update-check UI.
 */
export function LibrariesPanel({ initialReport }: Props) {
  const runtimeRows = initialReport.rows.filter((r) => r.kind === 'runtime')
  const devRows = initialReport.rows.filter((r) => r.kind === 'dev')

  return (
    <>
      <PackageTable
        title={kindLabel.runtime}
        rows={runtimeRows}
        mode="libraries"
      />
      <PackageTable title={kindLabel.dev} rows={devRows} mode="libraries" />
    </>
  )
}
