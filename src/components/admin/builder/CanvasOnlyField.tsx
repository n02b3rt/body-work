'use client'

import React from 'react'

/**
 * Stands in for a nested `content` blocks field in the inspector.
 *
 * The rows are still in form state — this only replaces the *rendering*, so a
 * column's elements are edited on the canvas instead of appearing a second time
 * as a stock blocks list inside the inspector, where reordering them would fight
 * the canvas for the same rows.
 */
export function CanvasOnlyField() {
  return (
    <p className="bw-builder__hint bw-builder__hint--boxed">
      Zawartość układasz na kanwie kreatora.
    </p>
  )
}
