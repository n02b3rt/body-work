'use client'

import type { TextFieldClientComponent } from 'payload'

import { FieldDescription, FieldError, FieldLabel, useField } from '@payloadcms/ui'
import React from 'react'

import { normalizeHexColor } from '@/lib/theme-tokens'

/**
 * Colour input for theme tokens: native swatch picker + editable HEX text,
 * so editors can either pick visually or paste a brand value.
 */
export const ColorField: TextFieldClientComponent = ({ field, path, readOnly }) => {
  const { setValue, showError, errorMessage, value } = useField<string>({ path })

  const text = typeof value === 'string' ? value : ''
  const swatch = normalizeHexColor(text) ?? '#000000'
  const description = field?.admin?.description

  return (
    <div className="field-type text bw-color-field">
      <FieldLabel label={field?.label} path={path} required={field?.required} />
      <div className="bw-color-field__row">
        <input
          aria-label={`${typeof field?.label === 'string' ? field.label : 'Kolor'} — próbnik`}
          className="bw-color-field__swatch"
          disabled={readOnly}
          onChange={(event) => setValue(event.target.value.toLowerCase())}
          type="color"
          value={swatch}
        />
        <input
          className="bw-color-field__hex"
          disabled={readOnly}
          onBlur={(event) => {
            const normalized = normalizeHexColor(event.target.value)
            if (normalized) setValue(normalized)
          }}
          onChange={(event) => setValue(event.target.value)}
          placeholder="#0f766e"
          spellCheck={false}
          type="text"
          value={text}
        />
      </div>
      {showError ? <FieldError message={errorMessage} path={path} showError /> : null}
      {description ? (
        <FieldDescription description={description} path={path} />
      ) : null}
    </div>
  )
}
