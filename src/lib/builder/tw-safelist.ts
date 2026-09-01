/**
 * Enumerates every Tailwind utility class the builder can put in a
 * `BuilderNode.tw` bucket, in all three responsive forms.
 *
 * Why this has to exist at all: `classNameFromTw`
 * (`src/components/builder/render/class-names.ts`) builds a class name at
 * **runtime** by concatenating a responsive prefix onto a string stored in
 * the document (`md:${cls}`). Tailwind's scanner matches complete class
 * tokens in source *text*; a template-literal concatenation like that never
 * appears as literal text anywhere, so the prefixed forms are invisible to it
 * no matter how the unprefixed class is written. `scripts/generate-tw-safelist.ts`
 * turns this list into `@source inline(...)` directives
 * (`src/styles/builder-safelist.css`), and `tests/builder-tw-safelist.test.ts`
 * checks the two cannot drift apart.
 *
 * Two sources feed the list, deliberately kept separate:
 * - **The systematic scale** (`tw-tokens.ts`): every value an inspector
 *   control can offer, e.g. every `SPACING_PROPERTY` × `SPACING_SCALE` pair.
 * - **`EXTRA_BASE_CLASSES`**: literal defaults `registry.ts` ships on an
 *   element (`h-8`, `border-t`, ...) that fall outside that scale. Kept
 *   generous on purpose: an unused generated utility costs a few bytes of
 *   CSS, a missing one is a class that silently does nothing on the page.
 *
 * Imports the `.ts` extension explicitly, unlike the rest of this project's
 * `@/…`-aliased style: `scripts/generate-tw-safelist.ts` runs this under
 * plain `node`, not `payload run`, specifically so it needs no database and
 * can run in CI (see that script's own comment) — and plain `node` requires
 * the extension on a relative import.
 */

import {
  ALIGN_ITEMS,
  BODY_TEXT_SIZES,
  BORDER_STYLES,
  BORDER_WIDTHS,
  COLOR_TOKENS,
  FLEX_DIRECTIONS,
  GRID_COLUMNS,
  HEADING_SIZES,
  JUSTIFY_CONTENT,
  RADIUS_SCALE,
  SHADOW_SCALE,
  SPACING_PROPERTIES,
  SPACING_SCALE,
  TEXT_SIZES,
  WIDTH_SCALE,
} from './tw-tokens.ts'

/** Defaults `registry.ts` ships that are not themselves inspector-editable token values. */
export const EXTRA_BASE_CLASSES = [
  'flex',
  'flex-col',
  'flex-row',
  'flex-wrap',
  'grid',
  'block',
  'inline-flex',
  'h-8',
  'h-16',
  'min-h-8',
  'border-t',
  'divide-y',
  'divide-line',
  'uppercase',
  'tracking-wide',
  'underline',
  'font-bold',
  'italic',
  'overflow-hidden',
  'object-cover',
  'object-contain',
] as const

/** Every base (unprefixed) class the builder can produce, deduplicated. */
export function builderBaseClasses(): string[] {
  const classes = new Set<string>()

  for (const property of SPACING_PROPERTIES) {
    for (const value of SPACING_SCALE) classes.add(`${property}-${value}`)
  }
  for (const token of COLOR_TOKENS) {
    classes.add(`bg-${token.value}`)
    classes.add(`text-${token.value}`)
    classes.add(`border-${token.value}`)
  }
  for (const size of TEXT_SIZES) classes.add(`text-${size}`)
  for (const size of HEADING_SIZES) classes.add(`text-${size}`)
  for (const size of BODY_TEXT_SIZES) classes.add(`text-${size}`)
  for (const radius of RADIUS_SCALE) classes.add(radius === 'none' ? 'rounded-none' : `rounded-${radius}`)
  for (const shadow of SHADOW_SCALE) classes.add(shadow === 'none' ? 'shadow-none' : `shadow-${shadow}`)
  for (const width of BORDER_WIDTHS) classes.add(width === 0 ? 'border-0' : width === 1 ? 'border' : `border-${width}`)
  for (const style of BORDER_STYLES) classes.add(`border-${style}`)
  for (const direction of FLEX_DIRECTIONS) classes.add(`flex-${direction}`)
  for (const align of ALIGN_ITEMS) classes.add(`items-${align}`)
  for (const justify of JUSTIFY_CONTENT) classes.add(`justify-${justify}`)
  for (const cols of GRID_COLUMNS) classes.add(`grid-cols-${cols}`)
  for (const width of WIDTH_SCALE) classes.add(width === 'auto' ? 'w-auto' : width === 'full' ? 'w-full' : `w-${width}`)

  for (const cls of EXTRA_BASE_CLASSES) classes.add(cls)

  return [...classes].sort()
}

/** `builderBaseClasses()`, each in its bare, `md:` and `lg:` forms — what actually needs to exist as generated CSS. */
export function builderAllClasses(): string[] {
  const all = new Set<string>()
  for (const cls of builderBaseClasses()) {
    all.add(cls)
    all.add(`md:${cls}`)
    all.add(`lg:${cls}`)
  }
  return [...all].sort()
}
