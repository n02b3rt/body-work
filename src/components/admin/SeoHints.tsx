'use client'

import { useFormFields } from '@payloadcms/ui'
import React from 'react'

/**
 * The value a blank SEO field will inherit, printed under the input.
 *
 * `admin.placeholder` in Payload is a static string, so it cannot show the document's own title.
 * These render *after* the input instead, which leaves Payload's own field handling completely
 * untouched: no value plumbing, no validation, nothing that can stop a document saving. See
 * `SeoPreview` for the fuller picture and for why the fields are deliberately left empty.
 */

function asText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

const style: React.CSSProperties = {
  display: 'block',
  marginTop: '.35rem',
  fontSize: '.8125rem',
  opacity: 0.75,
}

function Hint({ own, inherited, missing }: { own: string; inherited: string; missing: string }) {
  // Once they type something, the inherited value is no longer what ships, so saying anything
  // about it would be noise.
  if (own) return null

  return (
    <span style={style}>
      {inherited ? (
        <>
          Teraz pójdzie: <strong style={{ fontWeight: 600 }}>{inherited}</strong>
        </>
      ) : (
        missing
      )}
    </span>
  )
}

export const SeoTitleHint: React.FC = () => {
  const { own, inherited } = useFormFields(([state]) => ({
    own: asText(state?.['meta.title']?.value),
    inherited: asText(state?.title?.value),
  }))

  return <Hint own={own} inherited={inherited} missing="Uzupełnij tytuł dokumentu." />
}

export const SeoDescriptionHint: React.FC = () => {
  const { own, inherited } = useFormFields(([state]) => ({
    own: asText(state?.['meta.description']?.value),
    inherited: asText(state?.excerpt?.value),
  }))

  return (
    <Hint
      own={own}
      inherited={inherited}
      missing="Brak zajawki, więc wyszukiwarka wybierze fragment sama. Uzupełnij zajawkę albo to pole."
    />
  )
}
