'use client'

import type { TextFieldClientComponent } from 'payload'

import { FieldDescription, FieldError, FieldLabel, useField } from '@payloadcms/ui'
import React, { useMemo, useState } from 'react'

const PRESETS = [
  { label: '82 (zrównoważona)', value: 'balanced' },
  { label: '90 (wysoka)', value: 'high' },
  { label: '70 (mały plik)', value: 'small' },
  { label: 'Własna…', value: 'custom' },
] as const

const PRESET_VALUES = new Set(['balanced', 'high', 'small'])

function isPreset(value: string): boolean {
  return PRESET_VALUES.has(value)
}

/**
 * Image encode quality: named presets or a custom 1–100 value.
 */
export const MediaQualityField: TextFieldClientComponent = ({ field, path, readOnly }) => {
  const { setValue, showError, errorMessage, value } = useField<string>({ path })
  const stored = typeof value === 'string' && value.length > 0 ? value : 'balanced'
  const usingCustom = !isPreset(stored)
  const [mode, setMode] = useState<'preset' | 'custom'>(usingCustom ? 'custom' : 'preset')
  const [custom, setCustom] = useState(usingCustom ? stored : '85')
  const description = field?.admin?.description

  const selectValue = useMemo(() => {
    if (mode === 'custom') return 'custom'
    return isPreset(stored) ? stored : 'custom'
  }, [mode, stored])

  return (
    <div className="field-type select bw-media-option">
      <FieldLabel label={field?.label} path={path} required={field?.required} />
      <div className="bw-media-option__row">
        <select
          className="bw-media-option__select"
          disabled={readOnly}
          onChange={(event) => {
            const next = event.target.value
            if (next === 'custom') {
              setMode('custom')
              setValue(custom || '85')
              return
            }
            setMode('preset')
            setValue(next)
          }}
          value={selectValue}
        >
          {PRESETS.map((preset) => (
            <option key={preset.value} value={preset.value}>
              {preset.label}
            </option>
          ))}
        </select>
        {selectValue === 'custom' ? (
          <input
            aria-label="Własna jakość 1–100"
            className="bw-media-option__custom"
            disabled={readOnly}
            inputMode="numeric"
            max={100}
            min={1}
            onChange={(event) => {
              const raw = event.target.value.replace(/[^\d]/g, '')
              const clamped = raw ? String(Math.min(100, Math.max(1, Number(raw)))) : ''
              setCustom(clamped || raw)
              if (clamped) setValue(clamped)
            }}
            placeholder="1–100"
            type="number"
            value={custom}
          />
        ) : null}
      </div>
      {showError ? <FieldError message={errorMessage} path={path} showError /> : null}
      {description ? (
        <FieldDescription description={description} path={path} />
      ) : null}
    </div>
  )
}
