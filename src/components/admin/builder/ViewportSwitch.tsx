'use client'

import React from 'react'

export const VIEWPORTS = {
  desktop: { label: 'Komputer', width: '100%' },
  tablet: { label: 'Tablet', width: '820px' },
  mobile: { label: 'Telefon', width: '390px' },
} as const

export type ViewportKey = keyof typeof VIEWPORTS

/**
 * Switches how wide the canvas is drawn.
 *
 * This is what makes "ukryj na telefonie" and the column stacking checkable
 * without leaving the panel: the element stylesheet's breakpoints are
 * **container** queries, so narrowing the canvas is genuinely the same signal a
 * narrow phone gives.
 */
export function ViewportSwitch({
  onChange,
  value,
}: {
  onChange: (value: ViewportKey) => void
  value: ViewportKey
}) {
  return (
    <div aria-label="Podgląd na urządzeniu" className="bw-builder__viewports" role="group">
      {(Object.keys(VIEWPORTS) as ViewportKey[]).map((key) => (
        <button
          aria-pressed={key === value}
          className="bw-builder__viewport-button"
          key={key}
          onClick={() => onChange(key)}
          type="button"
        >
          {VIEWPORTS[key].label}
        </button>
      ))}
    </div>
  )
}
