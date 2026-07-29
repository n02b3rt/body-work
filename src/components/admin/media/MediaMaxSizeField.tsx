'use client'

import type { TextFieldClientComponent } from 'payload'

import { FieldDescription, FieldError, FieldLabel, useField } from '@payloadcms/ui'
import React, { useMemo, useState } from 'react'

const PRESETS = [
  { label: '1920 px', value: '1920' },
  { label: '1280 px', value: '1280' },
  { label: '2560 px', value: '2560' },
  { label: 'Bez zmian', value: 'none' },
  { label: 'Własny…', value: 'custom' },
] as const

function isPreset(value: string): boolean {
  return PRESETS.some((p) => p.value === value && p.value !== 'custom')
}

/**
 * Max output size (longest edge in px): presets plus an optional custom pixel value.
 */
export const MediaMaxSizeField: TextFieldClientComponent = ({ field, path, readOnly }) => {
  const { setValue, showError, errorMessage, value } = useField<string>({ path })
  const stored = typeof value === 'string' && value.length > 0 ? value : '1920'
  const usingCustom = !isPreset(stored)
  const [mode, setMode] = useState<'preset' | 'custom'>(usingCustom ? 'custom' : 'preset')
  const [custom, setCustom] = useState(usingCustom ? stored : '2048')
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
              setValue(custom && custom !== 'none' ? custom : '2048')
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
            aria-label="Własny maks. rozmiar w px"
            className="bw-media-option__custom"
            disabled={readOnly}
            inputMode="numeric"
            min={1}
            onChange={(event) => {
              const raw = event.target.value.replace(/[^\d]/g, '')
              setCustom(raw)
              if (raw) setValue(raw)
            }}
            placeholder="px"
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
