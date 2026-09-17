'use client'

import { useDraggable, useDroppable } from '@dnd-kit/core'

import { elementLabel } from '@/lib/builder/elements/registry'
import type { NodeId } from '@/lib/builder/types'

import { TREE_DRAG_PREFIX, TREE_DROP_PREFIX } from './dnd-types'
import { useBuilderStore } from './store'

/**
 * The navigation tree: every node, nested, with a drag handle plus
 * duplicate/remove.
 *
 * Drag-and-drop, not up/down buttons: a *separate* draggable/droppable pair
 * from the canvas's own (`tree-drag:`/`tree-node:` vs. `canvas-drag:`/
 * `canvas-node:`), because dnd-kit ids must be unique and a tree row is a
 * different DOM element from its canvas counterpart — but both carry the
 * identical `{ nodeId }` / `{ kind: 'move', nodeId, nodeType }` data shape, so
 * `BuilderShell`'s `onDragMove`/`onDragEnd` need no idea which pane a drag
 * came from. The same before/after/inside indicator
 * (`store.dropIndicator`) that the canvas draws applies here too.
 */
function TreeNode({ id, depth }: { id: NodeId; depth: number }) {
  const node = useBuilderStore((state) => state.doc.nodes[id])
  const selectedId = useBuilderStore((state) => state.selectedId)
  const dropIndicator = useBuilderStore((state) => state.dropIndicator)
  const select = useBuilderStore((state) => state.select)
  const remove = useBuilderStore((state) => state.remove)
  const duplicate = useBuilderStore((state) => state.duplicate)

  const { setNodeRef: setDropRef } = useDroppable({
    id: `${TREE_DROP_PREFIX}${id}`,
    data: { nodeId: id },
  })
  const {
    setNodeRef: setDragRef,
    listeners: dragListeners,
    attributes: dragAttributes,
  } = useDraggable({
    id: `${TREE_DRAG_PREFIX}${id}`,
    data: node ? { kind: 'move', nodeId: id, nodeType: node.type } : undefined,
    disabled: node?.meta?.locked,
  })

  if (!node) return null

  const isSelected = selectedId === id
  const isDropTarget = dropIndicator?.nodeId === id
  const label = node.meta?.name || elementLabel(node.type)

  return (
    <div className={isSelected ? 'bw-tree-node bw-tree-node--selected' : 'bw-tree-node'}>
      <div
        className={[
          'bw-tree-node__row flex items-center gap-1 rounded px-1 py-1 hover:bg-surface-alt',
          isDropTarget && dropIndicator?.position === 'inside' ? 'bw-canvas-node--drop-target' : '',
          isDropTarget && dropIndicator?.position === 'before' ? 'bw-drop-line bw-drop-line--before' : '',
          isDropTarget && dropIndicator?.position === 'after' ? 'bw-drop-line bw-drop-line--after' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        ref={setDropRef}
        style={{ paddingLeft: `${depth * 14 + 4}px` }}
      >
        <button
          aria-label="Przeciągnij, aby zmienić kolejność"
          className="cursor-grab px-0.5 text-xs text-muted active:cursor-grabbing"
          ref={setDragRef}
          type="button"
          {...dragListeners}
          {...dragAttributes}
        >
          ⠿
        </button>
        <button
          className="flex-1 truncate text-left text-sm text-text-heading"
          onClick={() => select(id)}
          type="button"
        >
          {label}
        </button>
        <button
          aria-label="Duplikuj"
          className="px-1 text-xs text-muted hover:text-[var(--bw-editor-accent)]"
          onClick={() => duplicate(id)}
          type="button"
        >
          ⧉
        </button>
        <button
          aria-label="Usuń"
          className="px-1 text-xs text-muted hover:text-error"
          onClick={() => remove(id)}
          type="button"
        >
          ✕
        </button>
      </div>
      {node.children.map((childId) => (
        <TreeNode depth={depth + 1} id={childId} key={childId} />
      ))}
    </div>
  )
}

export function Tree() {
  const rootId = useBuilderStore((state) => state.doc.root)
  const rootChildren = useBuilderStore((state) => state.doc.nodes[state.doc.root]?.children ?? [])
  const isRootDropTarget = useBuilderStore((state) => state.dropIndicator?.nodeId === rootId)

  // A drop target for the tree's own empty space (an empty page, or the gap below the
  // last top-level section) — the tree-panel equivalent of the canvas's root drop zone.
  const { setNodeRef: setRootDropRef } = useDroppable({
    id: `${TREE_DROP_PREFIX}${rootId}`,
    data: { nodeId: rootId },
  })

  return (
    <div
      className={[
        'flex h-full flex-col gap-0.5 p-2',
        isRootDropTarget ? 'bw-canvas-node--drop-target' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      ref={setRootDropRef}
    >
      {rootChildren.length === 0 ? (
        <p className="p-3 text-sm text-muted">Brak sekcji.</p>
      ) : (
        rootChildren.map((id) => <TreeNode depth={0} id={id} key={id} />)
      )}
    </div>
  )
}
