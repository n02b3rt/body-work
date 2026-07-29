import type { AdminViewServerProps } from 'payload'

import { isAdministrator } from '@/access/roles'
import { LibrariesPanel } from '@/components/admin/LibrariesPanel'
import { getPackageUpdatesReport } from '@/lib/package-updates'
import { DefaultTemplate } from '@payloadcms/next/templates'
import { Gutter } from '@payloadcms/ui'
import { redirect } from 'next/navigation'
import React from 'react'

/**
 * Zarządzanie → Biblioteki: inventory of direct dependencies — installed
 * version + npm/site/GitHub icons. Uses the shared package report for
 * versions/links only; no update-check UI here.
 */
export async function LibrariesView({
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
      // Read shared cache (or build once) for versions + registry links only.
      // Scheduler / „Sprawdź teraz” live under Kokpit → Aktualizacje.
      report = await getPackageUpdatesReport({ force: false })
    } catch {
      loadError = 'Nie udało się odczytać listy pakietów z package.json.'
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
          <p className="bw-updates__eyebrow">Zarządzanie</p>
          <h1 className="bw-updates__title">Biblioteki</h1>
          <p className="bw-updates__lead">
            Zainstalowane zależności projektu.
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

          {report ? <LibrariesPanel initialReport={report} /> : null}
        </div>
      </Gutter>
    </DefaultTemplate>
  )
}
