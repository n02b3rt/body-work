/**
 * The shared `style` group every page-builder element carries, turned into
 * render-ready CSS.
 *
 * One resolver for both sides: the builder canvas and the public site render the
 * *same* components, so "medium radius, 24px padding, hidden on mobile" has to
 * mean one thing. Everything is tolerant of missing input, because a half-filled
 * form and an older document are both normal.
 *
 * Responsive hiding is a class, not a media query in JS: the canvas emulates a
 * phone by shrinking, and `src/styles/elements.css` reads that with container
 * queries.
 */

import type { CSSProperties } from 'react'

import { asRecord, color, num, str } from './component-values'
import { lookup, RADIUS_VALUES, SHADOW_VALUES, SPACE_VALUES } from './component-styles'
import { formatSlug } from './format-slug'

export type ResolvedElementStyle = {
  className: string
  id?: string
  style: CSSProperties
}

export type ElementAlign = 'center' | 'left' | 'right'

export function elementAlign(value: unknown): ElementAlign {
  if (value === 'center' || value === 'right') return value
  return 'left'
}

/** `align` as a flexbox main-axis value, for elements that lay children out in a row. */
export function elementJustify(value: unknown): 'center' | 'flex-end' | 'flex-start' {
  const align = elementAlign(value)
  if (align === 'center') return 'center'
  if (align === 'right') return 'flex-end'
  return 'flex-start'
}

export function space(value: unknown, fallback: keyof typeof SPACE_VALUES = 'md'): string {
  return lookup(SPACE_VALUES, value, fallback)
}

export function shadow(value: unknown): string {
  return lookup(SHADOW_VALUES, value, 'none')
}

export function radiusValue(value: unknown, fallback: keyof typeof RADIUS_VALUES = 'none') {
  return lookup(RADIUS_VALUES, value, fallback)
}

/** `0` reads as "no padding" and an empty field as "not set"; both render as nothing. */
function px(value: unknown): string | undefined {
  if (value === null || value === undefined || value === '') return undefined
  const parsed = num(Number(value), Number.NaN)
  if (!Number.isFinite(parsed)) return undefined
  return `${parsed}px`
}

function sides(value: unknown): string | undefined {
  const box = asRecord(value)
  const top = px(box.top) ?? '0'
  const right = px(box.right) ?? '0'
  const bottom = px(box.bottom) ?? '0'
  const left = px(box.left) ?? '0'
  if (top === '0' && right === '0' && bottom === '0' && left === '0') return undefined
  return `${top} ${right} ${bottom} ${left}`
}

function borderShorthand(value: unknown): string | undefined {
  const border = asRecord(value)
  const style = str(border.style, 'none')
  if (style === 'none') return undefined
  const width = px(border.width) ?? '1px'
  const stroke = color(border.color, null) ?? 'currentColor'
  return `${width} ${style} ${stroke}`
}

function widthStyle(style: Record<string, unknown>): Pick<CSSProperties, 'maxWidth' | 'width'> {
  const mode = str(style.width, 'auto')
  if (mode === 'full') return { width: '100%' }
  if (mode === 'custom') {
    const percent = num(Number(style.customWidth), 100)
    return { maxWidth: '100%', width: `${Math.min(Math.max(percent, 5), 100)}%` }
  }
  return {}
}

/**
 * The frame of a container that is not itself an element — a single column.
 *
 * A narrower set than `resolveElementStyle`: a column has no margins, width or
 * visibility of its own, because those belong to the row that lays it out.
 */
export function resolveContainerStyle(value: unknown): CSSProperties {
  const container = asRecord(value)
  return {
    background: color(container.background, null),
    border: borderShorthand(container.border),
    borderRadius:
      radiusValue(container.radius, 'none') === '0' ? undefined : radiusValue(container.radius),
    padding: sides(container.padding),
  }
}

/**
 * An element's own frame: spacing, colours, border, visibility.
 *
 * Returned rather than applied, because each element decides *where* the frame
 * goes — a hero puts it on the outer band, a heading on the text itself.
 */
export function resolveElementStyle(value: unknown): ResolvedElementStyle {
  const style = asRecord(value)
  const align = elementAlign(style.align)
  const hideOn = Array.isArray(style.hideOn) ? style.hideOn.map((entry) => String(entry)) : []

  const margin = asRecord(style.margin)
  const widthMode = str(style.width, 'auto')
  const centred = align === 'center' && widthMode !== 'full'
  const pushedRight = align === 'right' && widthMode !== 'full'

  const css: CSSProperties = {
    background: color(style.background, null),
    border: borderShorthand(style.border),
    borderRadius: radiusValue(style.radius, 'none') === '0' ? undefined : radiusValue(style.radius),
    boxShadow: shadow(style.shadow) === 'none' ? undefined : shadow(style.shadow),
    color: color(style.textColor, null),
    marginBottom: px(margin.bottom),
    marginLeft: centred || pushedRight ? 'auto' : undefined,
    marginRight: centred ? 'auto' : undefined,
    marginTop: px(margin.top),
    padding: sides(style.padding),
    textAlign: align,
    ...widthStyle(style),
  }

  const className = [
    'bw-el',
    hideOn.includes('mobile') ? 'bw-el-hide-mobile' : '',
    hideOn.includes('tablet') ? 'bw-el-hide-tablet' : '',
    hideOn.includes('desktop') ? 'bw-el-hide-desktop' : '',
    str(style.cssClass),
  ]
    .filter(Boolean)
    .join(' ')

  const anchor = formatSlug(str(style.anchorId))

  return {
    className,
    id: anchor.length > 0 ? anchor : undefined,
    style: css,
  }
}
