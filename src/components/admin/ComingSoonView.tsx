import type { AdminViewServerProps } from 'payload'

import { findNavLabel, findNavPathLabels } from '@/admin/nav-tree'
import { DefaultTemplate } from '@payloadcms/next/templates'
import { Gutter } from '@payloadcms/ui'
import { redirect } from 'next/navigation'
import React from 'react'

function firstParam(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) return value[0]
  return value
}

/**
 * Placeholder root view for nav leaves that are not implemented yet.
 */
export function ComingSoonView({
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

  const sectionId = firstParam(searchParams?.section)
  const label = sectionId ? findNavLabel(sectionId) : null
  const pathLabels = sectionId ? findNavPathLabels(sectionId) : null
  const title = label ?? 'Sekcja w przygotowaniu'

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
        <div className="bw-coming-soon">
          <p className="bw-coming-soon__eyebrow">W przygotowaniu</p>
          <h1 className="bw-coming-soon__title">{title}</h1>
          <p className="bw-coming-soon__lead">
            Ta zakładka jest już w menu panelu, ale funkcjonalność pojawi się w
            kolejnych etapach. Na razie nic tu nie zapiszesz ani nie
            skonfigurujesz.
          </p>
          {pathLabels && pathLabels.length > 0 ? (
            <p className="bw-coming-soon__path">{pathLabels.join(' → ')}</p>
          ) : null}
        </div>
      </Gutter>
    </DefaultTemplate>
  )
}
