'use client'

import type { UIFieldClientComponent } from 'payload'

import { useAllFormFields } from '@payloadcms/ui'
import React from 'react'

import { THEME_PRESETS, type ThemePreset } from '@/lib/theme-presets'
import { THEME_TOKENS } from '@/lib/theme-tokens'

import { useThemeColorValues } from './use-theme-colors'

/** Palette presets — one click fills every colour field in the global. */
export const ThemePresets: UIFieldClientComponent = () => {
  const [, dispatchFields] = useAllFormFields()
  const currentColors = useThemeColorValues()

  const activePresetId = React.useMemo(() => {
    const match = THEME_PRESETS.find((preset) =>
      THEME_TOKENS.every((token) => {
        const presetValue = preset.colors[token.path]
        if (!presetValue) return true
        return presetValue.toLowerCase() === currentColors[token.path]
      }),
    )
    return match?.id ?? null
  }, [currentColors])

  const applyPreset = (preset: ThemePreset) => {
    THEME_TOKENS.forEach((token) => {
      const value = preset.colors[token.path]
      if (!value) return
      dispatchFields({ type: 'UPDATE', path: token.path, value })
    })
  }

  return (
    <div className="bw-appearance-block">
      <div className="bw-appearance-block__head">
        <h3 className="bw-appearance-block__title">Gotowe palety</h3>
        <p className="bw-appearance-block__lead">
          Kliknij paletę, aby wypełnić wszystkie kolory motywu. Po zastosowaniu
          zapisz zmiany — dopiero wtedy trafią na stronę.
        </p>
      </div>
      <ul className="bw-preset-grid">
        {THEME_PRESETS.map((preset) => {
          const isActive = preset.id === activePresetId
          return (
            <li key={preset.id}>
              <button
                aria-pressed={isActive}
                className={`bw-preset${isActive ? ' is-active' : ''}`}
                onClick={() => applyPreset(preset)}
                type="button"
              >
                <span className="bw-preset__swatches">
                  {preset.swatches.map((color) => (
                    <span
                      className="bw-preset__swatch"
                      key={color}
                      style={{ background: color }}
                    />
                  ))}
                </span>
                <span className="bw-preset__label">
                  {preset.label}
                  {isActive ? <span className="bw-preset__badge">aktywna</span> : null}
                </span>
                <span className="bw-preset__desc">{preset.description}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
