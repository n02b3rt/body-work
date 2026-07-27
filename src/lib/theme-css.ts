/**
 * Turns the "Schemat kolorów" global into CSS custom properties for the site.
 * Missing or malformed values fall back to the token defaults, so the public
 * site always renders with a complete palette.
 */

import {
  normalizeHexColor,
  THEME_TOKENS,
  type ThemeTokenPath,
} from './theme-tokens'

export type ThemeColorsSource = Record<string, unknown> | null | undefined

function readPath(doc: ThemeColorsSource, group: string, name: string): unknown {
  const groupValue = doc?.[group]
  if (!groupValue || typeof groupValue !== 'object') return undefined
  return (groupValue as Record<string, unknown>)[name]
}

/** Full palette keyed by token path, with defaults filled in. */
export function resolveThemeColors(
  doc: ThemeColorsSource,
): Record<ThemeTokenPath, string> {
  return THEME_TOKENS.reduce(
    (acc, token) => {
      acc[token.path] =
        normalizeHexColor(readPath(doc, token.group, token.name)) ?? token.defaultValue
      return acc
    },
    {} as Record<ThemeTokenPath, string>,
  )
}

/** `:root { --bw-*: … }` declarations for injection into the page head. */
export function buildThemeCss(doc: ThemeColorsSource): string {
  const colors = resolveThemeColors(doc)
  const declarations = THEME_TOKENS.map(
    (token) => `${token.cssVar}: ${colors[token.path]};`,
  ).join('\n  ')
  return `:root {\n  ${declarations}\n}`
}

/**
 * Resolves a component colour choice (palette token or custom hex) to a CSS
 * value. Palette tokens stay as `var(--bw-*)` so they follow the global theme.
 */
export function resolveColorChoice(
  choice: { token?: string | null; custom?: string | null } | null | undefined,
  fallback: ThemeTokenPath | null = null,
): string | undefined {
  const token = choice?.token
  if (token === 'custom') {
    const custom = normalizeHexColor(choice?.custom)
    if (custom) return custom
  }

  const path = token && token !== 'custom' ? token : fallback
  if (!path) return undefined

  const definition = THEME_TOKENS.find((entry) => entry.path === path)
  return definition ? `var(${definition.cssVar})` : undefined
}
