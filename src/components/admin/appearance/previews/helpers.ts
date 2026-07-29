/**
 * Preview-side readers.
 *
 * The readers themselves live in `@/lib/component-values` so the public
 * renderer uses the identical maps; this module re-exports them and overrides
 * the one value the admin panel cannot render at full size.
 */

import { SECTION_HEIGHT_VALUES, lookup } from '@/lib/component-styles'

export {
  asArray,
  asRecord,
  aspect,
  bool,
  buttonSize,
  color,
  columnCount,
  flexAlign,
  gap,
  num,
  radius,
  str,
  textAlign,
  type ColorChoice,
} from '@/lib/component-values'

export function sectionHeight(
  value: unknown,
  fallback: keyof typeof SECTION_HEIGHT_VALUES = 'lg',
) {
  // The admin panel is not full-bleed, so "screen" is capped for the preview.
  if (value === 'screen') return '30rem'
  return lookup(SECTION_HEIGHT_VALUES, value, fallback)
}
