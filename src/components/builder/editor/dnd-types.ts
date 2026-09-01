/**
 * The three drag sources this editor has, and what each carries.
 *
 * One `DndContext` (in `BuilderShell.tsx`) handles all of them: dragging a
 * fresh element in from the library, dragging an existing node on the canvas,
 * and dragging a row in the navigation tree. `onDragEnd`/`onDragMove` read
 * `active.data.current`/`over.data.current` to tell which happened — the
 * business logic never looks at the raw dnd-kit id string, only at this data,
 * which is why the canvas and the tree can register their own, differently
 * -prefixed ids for the *same* underlying node without either one needing to
 * know the other exists.
 */

import type { ElementType, NodeId } from '@/lib/builder/types'

export type DragData =
  | { kind: 'insert'; elementType: ElementType }
  | { kind: 'move'; nodeId: NodeId; nodeType: ElementType }

export type DropData = {
  nodeId: NodeId
}

export const CANVAS_DROP_PREFIX = 'canvas-node:'
export const CANVAS_DRAG_PREFIX = 'canvas-drag:'
export const TREE_DROP_PREFIX = 'tree-node:'
export const TREE_DRAG_PREFIX = 'tree-drag:'
export const LIBRARY_DRAG_PREFIX = 'library:'

/** Where a drag currently sits relative to the node it is hovering, computed live so the canvas/tree can draw an insertion indicator instead of only highlighting the whole target. */
export type DropPosition = 'after' | 'before' | 'inside'

export type DropIndicator = {
  nodeId: NodeId
  position: DropPosition
}
