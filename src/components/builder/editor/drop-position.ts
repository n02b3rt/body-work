/**
 * Where a drag sits relative to the node it is currently over: the top
 * quarter means "before it", the bottom quarter "after it", the middle half
 * "inside it" — but only when the target can actually contain the dragged
 * type; a leaf element (a heading, a button) only ever offers before/after,
 * split evenly at its midpoint, since nothing can go inside one.
 */

import type { DropPosition } from './dnd-types'

export function computeDropPosition(
  draggedRect: { top: number; height: number },
  targetRect: { top: number; height: number },
  canBeInside: boolean,
): DropPosition {
  const draggedCenterY = draggedRect.top + draggedRect.height / 2
  const relative = targetRect.height === 0 ? 0.5 : (draggedCenterY - targetRect.top) / targetRect.height

  if (canBeInside) {
    if (relative < 0.25) return 'before'
    if (relative > 0.75) return 'after'
    return 'inside'
  }

  return relative < 0.5 ? 'before' : 'after'
}
