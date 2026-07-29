/**
 * Column counts travel as a `data-cols` attribute, not a class.
 *
 * `src/styles/elements.css` holds the breakpoints, which are **container**
 * queries: the builder canvas emulates a phone by shrinking, and a media query
 * would keep reporting the desktop viewport.
 */

export function gridColumnsAttr(columns: unknown): string {
  const parsed = typeof columns === 'string' ? Number.parseInt(columns, 10) : Number(columns)
  if (!Number.isFinite(parsed)) return '3'
  return String(Math.min(Math.max(Math.round(parsed), 1), 4))
}
