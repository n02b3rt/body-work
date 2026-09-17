'use client'

/**
 * Stands in for the raw `json` field on `builder`: the panel is not where a
 * page's layout gets edited any more, `/edytor` is. This is a `ui` field
 * (`admin.components.Field`) rather than a link elsewhere in the document view,
 * so it sits exactly where the old `PageBuilder` field used to.
 */

import type { JSONFieldClientComponent } from 'payload'

import { useDocumentInfo, useFormFields } from '@payloadcms/ui'
import Link from 'next/link'
import React from 'react'

const EDITOR_SEGMENT: Record<string, string> = {
  pages: 'strony',
  posts: 'wpisy',
  'site-components': 'komponenty',
}

/** Replaces the field's own default JSON editor entirely, via `admin.components.Field`. */
export const OpenInBuilder: JSONFieldClientComponent = () => {
  const { collectionSlug } = useDocumentInfo()
  const slug = useFormFields(([fields]) => fields.slug?.value)

  const segment = collectionSlug ? EDITOR_SEGMENT[collectionSlug] : undefined
  const slugValue = typeof slug === 'string' && slug.length > 0 ? slug : null

  if (!segment) return null

  if (!slugValue) {
    return (
      <div className="field-type ui">
        <p style={{ color: 'var(--theme-elevation-500)' }}>
          Zapisz dokument, aby otworzyć go w kreatorze.
        </p>
      </div>
    )
  }

  return (
    <div className="field-type ui">
      <Link
        className="btn btn--style-primary btn--size-medium"
        href={`/edytor/${segment}/${slugValue}`}
      >
        Otwórz w kreatorze
      </Link>
    </div>
  )
}
