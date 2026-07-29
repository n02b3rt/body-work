/**
 * Shared value maps for component parameters (`site-components`).
 * The admin preview and any future frontend renderer must read the same maps,
 * so a "medium radius" looks identical in both places.
 */

export const RADIUS_VALUES = {
  none: '0',
  sm: '4px',
  md: '10px',
  lg: '20px',
  xl: '32px',
  full: '999px',
} as const

export const SHADOW_VALUES = {
  none: 'none',
  sm: '0 1px 2px rgb(0 0 0 / 0.08)',
  md: '0 8px 24px rgb(0 0 0 / 0.10)',
  lg: '0 20px 45px rgb(0 0 0 / 0.16)',
} as const

/** Spacing scale shared by paddings, margins and gaps set on an element. */
export const SPACE_VALUES = {
  none: '0',
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '2rem',
  xl: '3.5rem',
} as const

export const BUTTON_SIZE_VALUES = {
  sm: { padding: '0.4rem 0.85rem', fontSize: '0.85rem' },
  md: { padding: '0.6rem 1.25rem', fontSize: '0.95rem' },
  lg: { padding: '0.85rem 1.75rem', fontSize: '1.05rem' },
} as const

export const SECTION_HEIGHT_VALUES = {
  sm: '14rem',
  md: '20rem',
  lg: '28rem',
  screen: '100vh',
} as const

export const GAP_VALUES = {
  none: '0',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.75rem',
} as const

export const ASPECT_RATIO_VALUES = {
  '16-9': '16 / 9',
  '4-3': '4 / 3',
  '1-1': '1 / 1',
  '3-4': '3 / 4',
  '21-9': '21 / 9',
} as const

export type RadiusKey = keyof typeof RADIUS_VALUES
export type ShadowKey = keyof typeof SHADOW_VALUES
export type SpaceKey = keyof typeof SPACE_VALUES
export type ButtonSizeKey = keyof typeof BUTTON_SIZE_VALUES
export type SectionHeightKey = keyof typeof SECTION_HEIGHT_VALUES
export type GapKey = keyof typeof GAP_VALUES
export type AspectRatioKey = keyof typeof ASPECT_RATIO_VALUES

export function lookup<T extends Record<string, unknown>>(
  map: T,
  key: unknown,
  fallback: keyof T,
): T[keyof T] {
  if (typeof key === 'string' && key in map) return map[key as keyof T]
  return map[fallback]
}
