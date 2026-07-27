/**
 * Ready-made palettes for the "Schemat kolorów" global.
 * Keys are token paths from `theme-tokens.ts` (`<group>.<token>`).
 */

import { THEME_TOKENS, type ThemeTokenPath } from './theme-tokens'

export type ThemePreset = {
  id: string
  label: string
  description: string
  /** Swatches shown on the preset card (in order). */
  swatches: string[]
  colors: Partial<Record<ThemeTokenPath, string>>
}

/** Defaults from the token definitions: the "BodyWork" base palette. */
const defaultColors = THEME_TOKENS.reduce<Record<string, string>>((acc, token) => {
  acc[token.path] = token.defaultValue
  return acc
}, {})

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'bodywork',
    label: 'BodyWork (domyślny)',
    description: 'Morska zieleń z ciepłym akcentem: spokojny, medyczny charakter.',
    swatches: ['#0f766e', '#f59e0b', '#1e293b', '#f8fafc'],
    colors: defaultColors as Partial<Record<ThemeTokenPath, string>>,
  },
  {
    id: 'sand',
    label: 'Piaskowy',
    description: 'Ciepłe beże i terakota: miękki, gabinetowy klimat.',
    swatches: ['#b45309', '#0f766e', '#78350f', '#fefaf5'],
    colors: {
      'brand.primary': '#b45309',
      'brand.primaryHover': '#92400e',
      'brand.secondary': '#78350f',
      'brand.secondaryHover': '#5c2a0b',
      'brand.accent': '#0f766e',
      'text.heading': '#3f2711',
      'text.body': '#57402c',
      'text.muted': '#8a7460',
      'text.inverted': '#fffbf5',
      'text.link': '#b45309',
      'text.linkHover': '#92400e',
      'surface.page': '#fffbf5',
      'surface.surface': '#fdf5ea',
      'surface.surfaceAlt': '#f8ead8',
      'surface.border': '#eddcc6',
      'surface.overlay': '#3f2711',
      'state.success': '#15803d',
      'state.warning': '#c2410c',
      'state.error': '#b91c1c',
      'state.info': '#0369a1',
    },
  },
  {
    id: 'midnight',
    label: 'Nocny',
    description: 'Ciemne tła z jasnym tekstem: mocny kontrast dla sekcji premium.',
    swatches: ['#22d3ee', '#a78bfa', '#0f172a', '#1e293b'],
    colors: {
      'brand.primary': '#22d3ee',
      'brand.primaryHover': '#06b6d4',
      'brand.secondary': '#a78bfa',
      'brand.secondaryHover': '#8b5cf6',
      'brand.accent': '#f472b6',
      'text.heading': '#f8fafc',
      'text.body': '#cbd5e1',
      'text.muted': '#94a3b8',
      'text.inverted': '#0f172a',
      'text.link': '#22d3ee',
      'text.linkHover': '#67e8f9',
      'surface.page': '#0f172a',
      'surface.surface': '#1e293b',
      'surface.surfaceAlt': '#334155',
      'surface.border': '#475569',
      'surface.overlay': '#020617',
      'state.success': '#34d399',
      'state.warning': '#fbbf24',
      'state.error': '#f87171',
      'state.info': '#60a5fa',
    },
  },
  {
    id: 'rose',
    label: 'Różany',
    description: 'Stonowany róż i śliwka: dietetyka, masaż, strefa relaksu.',
    swatches: ['#be185d', '#7e22ce', '#4c0519', '#fff5f7'],
    colors: {
      'brand.primary': '#be185d',
      'brand.primaryHover': '#9d174d',
      'brand.secondary': '#7e22ce',
      'brand.secondaryHover': '#6b21a8',
      'brand.accent': '#f97316',
      'text.heading': '#4c0519',
      'text.body': '#5f2436',
      'text.muted': '#9a6b7c',
      'text.inverted': '#fff5f7',
      'text.link': '#be185d',
      'text.linkHover': '#9d174d',
      'surface.page': '#fff5f7',
      'surface.surface': '#fdeef2',
      'surface.surfaceAlt': '#fbdde6',
      'surface.border': '#f3cbd8',
      'surface.overlay': '#4c0519',
      'state.success': '#15803d',
      'state.warning': '#d97706',
      'state.error': '#be123c',
      'state.info': '#0369a1',
    },
  },
]

export function findThemePreset(id: string): ThemePreset | undefined {
  return THEME_PRESETS.find((preset) => preset.id === id)
}
