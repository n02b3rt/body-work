/**
 * Shared value maps for page-builder sections (`pages.layout`).
 *
 * Same contract as `component-styles.ts`: the admin canvas and the public
 * renderer both read these, so "wide section, large spacing" looks the same in
 * the builder as it does on the site.
 */

import { lookup } from './component-styles'
import { formatSlug } from './format-slug'

/** Max width of a section's content. `full` opts out of the container cap. */
export const SECTION_WIDTH_VALUES = {
  full: '100%',
  container: '1440px',
  narrow: '960px',
} as const

/** Vertical padding around a section. */
export const SECTION_SPACING_VALUES = {
  none: '0',
  sm: '1.5rem',
  md: '3rem',
  lg: '5rem',
} as const

export type SectionWidthKey = keyof typeof SECTION_WIDTH_VALUES
export type SectionSpacingKey = keyof typeof SECTION_SPACING_VALUES

export const SECTION_WIDTH_OPTIONS = [
  { label: 'Pełna szerokość', value: 'full' },
  { label: 'Standardowa (1440px)', value: 'container' },
  { label: 'Wąska (960px)', value: 'narrow' },
] as const

export const SECTION_SPACING_OPTIONS = [
  { label: 'Brak', value: 'none' },
  { label: 'Małe', value: 'sm' },
  { label: 'Średnie', value: 'md' },
  { label: 'Duże', value: 'lg' },
] as const

export function sectionWidth(value: unknown): string {
  return lookup(SECTION_WIDTH_VALUES, value, 'container')
}

export function sectionSpacing(value: unknown): string {
  return lookup(SECTION_SPACING_VALUES, value, 'md')
}

/**
 * An anchor is used as an `id`, so it has to survive being put in a URL
 * fragment. `formatSlug` rather than a local regex: it transliterates Polish, so
 * "Korzyści" becomes `korzysci` instead of `korzy-ci`, which is what an editor
 * typing a section name expects to link to. Returns undefined rather than a
 * broken id when nothing is left.
 */
export function sectionAnchor(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const cleaned = formatSlug(value)
  return cleaned.length > 0 ? cleaned : undefined
}
