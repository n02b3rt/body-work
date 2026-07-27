'use client'

import { useAllFormFields } from '@payloadcms/ui'
import type React from 'react'
import { useMemo } from 'react'

import {
  normalizeHexColor,
  THEME_TOKENS,
  type ThemeTokenPath,
} from '@/lib/theme-tokens'

export type ThemeColorValues = Record<ThemeTokenPath, string>

/** Live palette from the currently edited form (defaults fill the gaps). */
export function useThemeColorValues(): ThemeColorValues {
  const [fields] = useAllFormFields()

  return useMemo(() => {
    return THEME_TOKENS.reduce((acc, token) => {
      acc[token.path] =
        normalizeHexColor(fields?.[token.path]?.value) ?? token.defaultValue
      return acc
    }, {} as ThemeColorValues)
  }, [fields])
}

/** Palette as inline `--bw-*` custom properties, for preview containers. */
export function themeCssVarStyle(colors: ThemeColorValues): React.CSSProperties {
  const style: Record<string, string> = {}
  THEME_TOKENS.forEach((token) => {
    style[token.cssVar] = colors[token.path]
  })
  return style as React.CSSProperties
}
