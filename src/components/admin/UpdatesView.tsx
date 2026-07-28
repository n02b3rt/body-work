import type { AdminViewServerProps } from 'payload'

import { isAdministrator } from '@/access/roles'
import {
  getPackageUpdatesReport,
  type PackageKind,
  type PackageUpdateRow,
  type PackageUpdateStatus,
} from '@/lib/package-updates'
import { formatDateTimePl } from '@/lib/format-date'
import { DefaultTemplate } from '@payloadcms/next/templates'
import { Gutter } from '@payloadcms/ui'
import { redirect } from 'next/navigation'
import React from 'react'

const statusLabel: Record<PackageUpdateStatus, string> = {
  'up-to-date': 'Aktualna',
  'update-available': 'Dostępna aktualizacja',
  unknown: 'Nie udało się sprawdzić',
}

const kindLabel: Record<PackageKind, string> = {
  runtime: 'Runtime',
  dev: 'Dev',
}

function statusClass(status: PackageUpdateStatus): string {
  if (status === 'update-available') return 'bw-updates__badge--update'
  if (status === 'up-to-date') return 'bw-updates__badge--ok'
  return 'bw-updates__badge--unknown'
}

function PackageTable({
  title,
  rows,
}: {
  title: string
  rows: PackageUpdateRow[]
}) {
  if (rows.length === 0) return null

  return (
    <section className="bw-updates__section">
      <h2 className="bw-updates__section-title">{title}</h2>
      <div className="bw-updates__table-wrap">
        <table className="bw-updates__table">
          <thead>
            <tr>
              <th scope="col">Pakiet</th>
              <th scope="col">Zadeklarowana</th>
              <th scope="col">Zainstalowana</th>
              <th scope="col">Najnowsza</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.name}
                className={
                  row.status === 'update-available'
                    ? 'bw-updates__row--update'
                    : undefined
                }
              >
                <td className="bw-updates__name">
                  <code>{row.name}</code>
                </td>
                <td>
                  <code>{row.declared}</code>
                </td>
                <td>
                  {row.installed ? (
                    <code>{row.installed}</code>
                  ) : (
                    <span className="bw-updates__muted">niedostępna</span>
                  )}
                </td>
                <td>
                  {row.latest ? (
                    <code>{row.latest}</code>
                  ) : (
                    <span className="bw-updates__muted">—</span>
                  )}
                </td>
                <td>
                  <span
                    className={`bw-updates__badge ${statusClass(row.status)}`}
                  >
                    {statusLabel[row.status]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

/**
 * Admin view: direct dependencies from package.json vs npm registry latest.
 * Administrator only. Informational — does not upgrade packages.
 */
export async function UpdatesView({
  initPageResult,
  params,
  searchParams,
}: AdminViewServerProps) {
  const {
    locale,
    permissions,
    req: {
      i18n,
      payload,
      payload: { config },
      user,
    },
    visibleEntities,
  } = initPageResult

  if (!user) {
    redirect(`${config.routes.admin}/login`)
  }

  const allowed = isAdministrator(user)

  let report: Awaited<ReturnType<typeof getPackageUpdatesReport>> | null = null
  let loadError: string | null = null

  if (allowed) {
    try {
      report = await getPackageUpdatesReport()
    } catch {
      loadError =
        'Nie udało się odczytać package.json lub sprawdzić wersji pakietów.'
    }
  }

  const runtimeRows = report?.rows.filter((r) => r.kind === 'runtime') ?? []
  const devRows = report?.rows.filter((r) => r.kind === 'dev') ?? []

  return (
    <DefaultTemplate
      i18n={i18n}
      locale={locale}
      params={params}
      payload={payload}
      permissions={permissions}
      req={initPageResult.req}
      searchParams={searchParams}
      user={user}
      visibleEntities={visibleEntities}
    >
      <Gutter>
        <div className="bw-updates">
          <p className="bw-updates__eyebrow">Kokpit</p>
          <h1 className="bw-updates__title">Aktualizacje</h1>
          <p className="bw-updates__lead">
            Lista bezpośrednich zależności z <code>package.json</code> oraz
            porównanie zainstalowanej wersji z najnowszą w rejestrze npm.
            Panel tylko informuje — pakietów nie aktualizuje (to wymaga
            świadomej decyzji i weryfikacji stacku).
          </p>

          {!allowed ? (
            <p className="bw-updates__denied">
              Ta zakładka jest dostępna tylko dla roli administrator.
            </p>
          ) : null}

          {loadError ? (
            <p className="bw-updates__error" role="alert">
              {loadError}
            </p>
          ) : null}

          {report ? (
            <>
              <div className="bw-updates__summary">
                <span>
                  <strong>{report.totals.packages}</strong> pakietów
                </span>
                <span className="bw-updates__summary-sep" aria-hidden>
                  ·
                </span>
                <span>
                  <strong>{report.totals.updates}</strong> z dostępną
                  aktualizacją
                </span>
                {report.totals.unknown > 0 ? (
                  <>
                    <span className="bw-updates__summary-sep" aria-hidden>
                      ·
                    </span>
                    <span>
                      <strong>{report.totals.unknown}</strong> bez wyniku
                    </span>
                  </>
                ) : null}
                <span className="bw-updates__summary-sep" aria-hidden>
                  ·
                </span>
                <span className="bw-updates__checked">
                  sprawdzono: {formatDateTimePl(report.checkedAt)}
                </span>
              </div>

              <PackageTable title={kindLabel.runtime} rows={runtimeRows} />
              <PackageTable title={kindLabel.dev} rows={devRows} />
            </>
          ) : null}
        </div>
      </Gutter>
    </DefaultTemplate>
  )
}
