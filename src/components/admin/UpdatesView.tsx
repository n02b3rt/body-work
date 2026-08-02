import type { AdminViewServerProps } from 'payload'

import { isAdministrator } from '@/access/roles'
import { UpdatesPanel } from '@/components/admin/UpdatesPanel'
import {
  ensurePackageUpdatesScheduler,
  getPackageUpdatesReport,
} from '@/lib/package-updates'
import { DefaultTemplate } from '@payloadcms/next/templates'
import { Gutter } from '@payloadcms/ui'
import { redirect } from 'next/navigation'
import React from 'react'

/**
 * Admin view: direct dependencies from package.json vs npm registry latest.
 * Administrator only. Informational — does not upgrade packages.
 * Results are cached for 24h; a process-level timer re-checks automatically.
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
    ensurePackageUpdatesScheduler()
    try {
      report = await getPackageUpdatesReport({ force: false })
    } catch {
      loadError =
        'Nie udało się odczytać package.json lub sprawdzić wersji pakietów.'
    }
  }

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
            Pakiety z dostępną nowszą wersją.
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

          {report ? <UpdatesPanel initialReport={report} /> : null}
        </div>
      </Gutter>
    </DefaultTemplate>
  )
}
