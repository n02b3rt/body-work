/**
 * Small readers shared by the component previews. Form state is partial while
 * a document is being created, so every accessor tolerates missing values.
 */

import {
  ASPECT_RATIO_VALUES,
  BUTTON_SIZE_VALUES,
  GAP_VALUES,
  lookup,
  RADIUS_VALUES,
  SECTION_HEIGHT_VALUES,
} from '@/lib/component-styles'
import { resolveColorChoice } from '@/lib/theme-css'
import type { ThemeTokenPath } from '@/lib/theme-tokens'

export type ColorChoice = { token?: string | null; custom?: string | null } | null

export function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

export function asArray(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? value.map(asRecord) : []
}

export function str(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.length > 0 ? value : fallback
}

export function num(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

export function bool(value: unknown): boolean {
  return value === true
}

/** Colour parameter → CSS value (palette tokens stay as `var(--bw-*)`). */
export function color(
  value: unknown,
  fallback: ThemeTokenPath | null = null,
): string | undefined {
  return resolveColorChoice(asRecord(value) as ColorChoice, fallback)
}

export function radius(value: unknown, fallback: keyof typeof RADIUS_VALUES = 'md') {
  return lookup(RADIUS_VALUES, value, fallback)
}

export function gap(value: unknown, fallback: keyof typeof GAP_VALUES = 'md') {
  return lookup(GAP_VALUES, value, fallback)
}

export function aspect(
  value: unknown,
  fallback: keyof typeof ASPECT_RATIO_VALUES = '16-9',
) {
  return lookup(ASPECT_RATIO_VALUES, value, fallback)
}

export function sectionHeight(
  value: unknown,
  fallback: keyof typeof SECTION_HEIGHT_VALUES = 'lg',
) {
  // The admin panel is not full-bleed, so "screen" is capped for the preview.
  if (value === 'screen') return '30rem'
  return lookup(SECTION_HEIGHT_VALUES, value, fallback)
}

export function buttonSize(
  value: unknown,
  fallback: keyof typeof BUTTON_SIZE_VALUES = 'md',
) {
  return lookup(BUTTON_SIZE_VALUES, value, fallback)
}

export function textAlign(value: unknown): 'left' | 'center' | 'right' {
  if (value === 'center' || value === 'right') return value
  return 'left'
}

export function flexAlign(value: unknown): 'flex-start' | 'center' | 'flex-end' {
  if (value === 'center') return 'center'
  if (value === 'right') return 'flex-end'
  return 'flex-start'
}

export function columnCount(value: unknown, fallback = 3): number {
  const parsed = typeof value === 'string' ? Number.parseInt(value, 10) : value
  return typeof parsed === 'number' && parsed >= 1 && parsed <= 4 ? parsed : fallback
}
