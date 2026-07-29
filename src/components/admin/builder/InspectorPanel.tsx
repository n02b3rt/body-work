'use client'

import { RenderFields } from '@payloadcms/ui'
import type { ClientField, SanitizedFieldPermissions } from 'payload'
import React from 'react'

type Props = {
  fields: ClientField[]
  /** Form-state path of the row being edited, e.g. `layout.0.content.2`. */
  path: string
  readOnly: boolean
  /** Schema path Payload resolves custom field components against. */
  schemaPath: string
  subtitle?: string
  title: string
}

/**
 * The selected row's own fields, rendered by Payload.
 *
 * `RenderFields` is exactly what Payload's stock array and blocks rows use, so
 * the inspector gets rich text, upload pickers, relationship selectors,
 * conditions and validation without a single hand-written control — and every
 * value lands in the same form state the document submits.
 */
export function InspectorPanel({
  fields,
  path,
  readOnly,
  schemaPath,
  subtitle,
  title,
}: Props) {
  return (
    <aside className="bw-builder__inspector">
      <h4 className="bw-builder__panel-title">
        {title}
        {subtitle ? <span className="bw-builder__panel-sub">{subtitle}</span> : null}
      </h4>

      <div className="bw-builder__fields">
        <RenderFields
          fields={fields}
          margins="small"
          parentIndexPath=""
          parentPath={path}
          parentSchemaPath={schemaPath}
          permissions={true as SanitizedFieldPermissions}
          readOnly={readOnly}
        />
      </div>
    </aside>
  )
}
