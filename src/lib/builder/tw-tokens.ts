/**
 * The finite scale of Tailwind utilities an editor can reach from the inspector.
 *
 * Tailwind's JIT scans source files, not database rows: a class saved inside a
 * `BuilderNode` is invisible to it unless something else also mentions that exact
 * class string in a file the scanner reads. `scripts/generate-tw-safelist.ts`
 * reads this file and emits `src/styles/builder-safelist.css` with `@source
 * inline(...)` covering every combination these tokens can produce, so the
 * inspector's controls and the generated CSS can never drift apart — the test in
 * `tests/builder-safelist.test.ts` enumerates every combination and checks each
 * is covered.
 *
 * A value outside this scale (an arbitrary pixel figure, a one-off hex) does not
 * go through Tailwind at all: it goes in `BuilderNode.css` and lands directly in
 * the `style` attribute, where it already wins over a class by CSS specificity.
 * That is the deliberate escape hatch, not a gap to close later.
 *
 * `ThemeTokenPath` values here have to match the `--color-*` custom properties
 * `src/app/globals.css` derives from `THEME_TOKEN_GROUPS`
 * (`src/lib/theme-tokens.ts`): the Tailwind utility suffix Tailwind v4 generates
 * from `--color-text-body` is `text-body`, not `text-color-body` or `body`.
 *
 * Relative import with its `.ts` extension, not the usual `@/…` alias: this
 * file feeds `scripts/generate-tw-safelist.ts`, which runs under plain `node`
 * with no Payload context (no database needed to regenerate CSS classes), and
 * plain `node` cannot resolve either aliases or an extensionless specifier.
 */

import { THEME_TOKENS, type ThemeTokenPath } from '../theme-tokens.ts'

export type ColorToken = {
  /** Tailwind utility suffix: `bg-<value>`, `text-<value>`, `border-<value>`. */
  value: string
  label: string
  /** Path into `resolveThemeColors()`'s output, for the a11y contrast checker. `null` for the two non-themed values. */
  themePath: ThemeTokenPath | null
}

const THEME_PATH_TO_UTILITY: Record<ThemeTokenPath, string> = {
  'brand.primary': 'brand',
  'brand.primaryHover': 'brand-hover',
  'brand.secondary': 'brand-alt',
  'brand.secondaryHover': 'brand-alt-hover',
  'brand.accent': 'accent',
  'text.heading': 'text-heading',
  'text.body': 'text-body',
  'text.muted': 'muted',
  'text.inverted': 'inverted',
  'text.link': 'link',
  'text.linkHover': 'link-hover',
  'surface.page': 'page',
  'surface.surface': 'surface',
  'surface.surfaceAlt': 'surface-alt',
  'surface.border': 'line',
  // `surface.overlay` has no `--color-*` utility of its own; it is only ever
  // applied as an rgba() wash by the elements that use it directly.
  'surface.overlay': '',
  'state.success': 'success',
  'state.warning': 'warning',
  'state.error': 'error',
  'state.info': 'info',
}

/** Every theme colour an inspector control can pick, in `THEME_TOKEN_GROUPS` order. */
export const COLOR_TOKENS: ColorToken[] = THEME_TOKENS.filter(
  (token) => THEME_PATH_TO_UTILITY[token.path],
).map((token) => ({
  value: THEME_PATH_TO_UTILITY[token.path],
  label: token.label,
  themePath: token.path,
}))

export const NONE_COLOR: ColorToken = { value: '', label: 'Brak', themePath: null }

export function findColorToken(value: string | null | undefined): ColorToken | undefined {
  return COLOR_TOKENS.find((token) => token.value === value)
}

/**
 * Curated, not Tailwind's full spacing scale (which runs from `0` to `96` in
 * 0.5 steps). An editor picking padding from a dropdown needs a handful of
 * meaningfully different options, not forty near-identical ones.
 */
export const SPACING_SCALE = [0, 1, 2, 3, 4, 6, 8, 10, 12, 16, 20, 24, 32] as const
export type SpacingValue = (typeof SPACING_SCALE)[number]

export const SPACING_PROPERTIES = [
  'p',
  'px',
  'py',
  'pt',
  'pr',
  'pb',
  'pl',
  'm',
  'mx',
  'my',
  'mt',
  'mb',
  'gap',
] as const
export type SpacingProperty = (typeof SPACING_PROPERTIES)[number]

export function spacingClass(property: SpacingProperty, value: SpacingValue): string {
  return `${property}-${value}`
}

/**
 * The general-purpose text scale (body copy, buttons, captions): Tailwind's own
 * default sizes, left untouched by this project's `@theme inline` block.
 */
export const TEXT_SIZES = ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl'] as const
export type TextSize = (typeof TEXT_SIZES)[number]

/**
 * The three general-purpose cuts of the reference site's own type scale
 * (`src/app/globals.css`, `--text-label`/`--text-btn`/`--text-body`) that are
 * genuinely reusable across elements. `--text-partner`/`--text-value*`/
 * `--text-statement` exist too, but the CSS comments naming them are explicit
 * that each is a one-off for a specific section of the reference site, not a
 * general option — they stay out of the builder's scale on purpose.
 */
export const BODY_TEXT_SIZES = ['label', 'btn', 'body'] as const
export type BodyTextSize = (typeof BODY_TEXT_SIZES)[number]

/**
 * The branded heading scale, copied from the reference site
 * (`src/app/globals.css`, `--text-h-*`). Kept separate from `TEXT_SIZES`
 * because a heading and a paragraph should never be offered the same options:
 * nothing on the reference site sizes a paragraph with `text-h-hero`.
 */
export const HEADING_SIZES = [
  'h-mobile',
  'h-tile',
  'h-menu',
  'h-sub',
  'h-hero',
  'h-section',
  'h-display',
] as const
export type HeadingSize = (typeof HEADING_SIZES)[number]

export const RADIUS_SCALE = ['none', 'sm', 'md', 'lg', 'xl', '2xl', 'full'] as const
export type RadiusValue = (typeof RADIUS_SCALE)[number]

export const SHADOW_SCALE = ['none', 'sm', 'md', 'lg', 'xl'] as const
export type ShadowValue = (typeof SHADOW_SCALE)[number]

export const BORDER_WIDTHS = [0, 1, 2, 4, 8] as const
export type BorderWidth = (typeof BORDER_WIDTHS)[number]

export const BORDER_STYLES = ['solid', 'dashed', 'dotted', 'none'] as const
export type BorderStyleValue = (typeof BORDER_STYLES)[number]

export const FLEX_DIRECTIONS = ['row', 'col'] as const
export type FlexDirection = (typeof FLEX_DIRECTIONS)[number]

export const ALIGN_ITEMS = ['start', 'center', 'end', 'stretch'] as const
export type AlignItems = (typeof ALIGN_ITEMS)[number]

export const JUSTIFY_CONTENT = ['start', 'center', 'end', 'between', 'around'] as const
export type JustifyContent = (typeof JUSTIFY_CONTENT)[number]

export const GRID_COLUMNS = [1, 2, 3, 4, 6, 12] as const
export type GridColumns = (typeof GRID_COLUMNS)[number]

export const WIDTH_SCALE = ['auto', 'full', '1/2', '1/3', '2/3', '1/4', '3/4'] as const
export type WidthValue = (typeof WIDTH_SCALE)[number]
