/**
 * Turns a node's `tw` (per-breakpoint utility class lists) and `css` (the
 * arbitrary-value escape hatch) into what React actually takes: a
 * `className` string and a `style` object.
 *
 * Mobile-first, matching Tailwind's own convention: `base` classes apply
 * unprefixed, `md`/`lg` classes gain the matching responsive prefix so a
 * later breakpoint overrides an earlier one exactly the way plain Tailwind
 * markup would.
 */

import type { Breakpoint } from '@/lib/builder/types'

const PREFIX: Record<Breakpoint, string> = { base: '', md: 'md:', lg: 'lg:' }

export function classNameFromTw(tw: Partial<Record<Breakpoint, string[]>> | undefined): string {
  if (!tw) return ''
  const classes: string[] = []
  for (const breakpoint of ['base', 'md', 'lg'] as const) {
    for (const cls of tw[breakpoint] ?? []) classes.push(`${PREFIX[breakpoint]}${cls}`)
  }
  return classes.join(' ')
}

/** Matches this project's Tailwind v4 default `md`/`lg` breakpoints (`--breakpoint-*` is not overridden in `globals.css`). `base` has no media query: it is the unconditional rule mobile-first cascades from. */
const MIN_WIDTH: Record<Breakpoint, number | null> = { base: null, md: 768, lg: 1024 }

export function customStyleClassName(nodeId: string): string {
  return `bw-css-${nodeId}`
}

function camelToKebab(prop: string): string {
  return prop.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
}

/**
 * `node.css`'s per-breakpoint escape hatch, as real CSS text: a class rule per breakpoint that
 * has any properties, `md`/`lg` wrapped in their matching `min-width` media query. An inline
 * `style` attribute cannot vary by viewport (no media queries), so this generates an actual
 * (tiny, per-node) stylesheet instead — the same mobile-first cascade `classNameFromTw`'s
 * responsive class prefixes get from Tailwind's own generated CSS.
 *
 * Values are only ever produced by the inspector's own numeric-amount + fixed-unit-list
 * controls (`BoxModelEditor.tsx`), never free text, so building CSS text by direct
 * interpolation here does not admit injecting arbitrary rules or breaking out of the `<style>`
 * tag this feeds (`BuilderRender.tsx`).
 */
export function styleRuleFromCss(
  nodeId: string,
  css: Partial<Record<Breakpoint, Record<string, string>>> | undefined,
): string {
  if (!css) return ''
  const className = customStyleClassName(nodeId)
  const rules: string[] = []
  for (const breakpoint of ['base', 'md', 'lg'] as const) {
    const bucket = css[breakpoint]
    if (!bucket || Object.keys(bucket).length === 0) continue
    const body = Object.entries(bucket)
      .map(([prop, value]) => `${camelToKebab(prop)}:${value}`)
      .join(';')
    const rule = `.${className}{${body}}`
    const minWidth = MIN_WIDTH[breakpoint]
    rules.push(minWidth ? `@media (min-width:${minWidth}px){${rule}}` : rule)
  }
  return rules.join('')
}

const HIDDEN_CLASS: Record<Breakpoint, string> = {
  base: 'max-md:hidden',
  md: 'md:max-lg:hidden',
  lg: 'lg:hidden',
}

export function classNameFromHiddenOn(hiddenOn: Breakpoint[] | undefined): string {
  if (!hiddenOn || hiddenOn.length === 0) return ''
  return hiddenOn.map((breakpoint) => HIDDEN_CLASS[breakpoint]).join(' ')
}
