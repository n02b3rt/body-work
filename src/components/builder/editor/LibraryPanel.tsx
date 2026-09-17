'use client'

import { useDraggable } from '@dnd-kit/core'

import { canContain, ELEMENT_CATEGORIES, ELEMENT_DEFINITIONS } from '@/lib/builder/elements/registry'

import type { BuilderDoc, BuilderNode } from '@/lib/builder/types'

import { LIBRARY_DRAG_PREFIX, type DragData } from './dnd-types'
import { LibraryIcon } from './library-icons'
import { useBuilderStore } from './store'

function findLastSection(doc: BuilderDoc): BuilderNode | undefined {
  const rootChildren = doc.nodes[doc.root]?.children ?? []
  const lastId = rootChildren.at(-1)
  return lastId ? doc.nodes[lastId] : undefined
}

/**
 * Draggable **and** click-to-insert: dragging is the fluid path, clicking is
 * the reliable one (keyboard-reachable, and a fallback for a pointer that
 * cannot land precisely). The old builder learned the same lesson — see
 * `docs/page-builder.md`'s note that a scrolling rail into a nested canvas is
 * where builders like this one usually break down.
 */
function LibraryItem({ type }: { type: (typeof ELEMENT_DEFINITIONS)[number]['type'] }) {
  const definition = ELEMENT_DEFINITIONS.find((d) => d.type === type)!
  const insertAtSelection = useBuilderStore((state) => state.selectedId)
  const insert = useBuilderStore((state) => state.insert)
  const addSection = useBuilderStore((state) => state.addSection)
  const doc = useBuilderStore((state) => state.doc)

  const data: DragData = { kind: 'insert', elementType: type }
  const { setNodeRef, listeners, attributes } = useDraggable({ id: `${LIBRARY_DRAG_PREFIX}${type}`, data })

  const handleClick = () => {
    // No selection: append to the last section. An empty page has no section at all yet —
    // create one first, the same fallback `BuilderShell`'s drag handler uses when a drop
    // lands on the empty canvas, so clicking and dragging behave identically here.
    const selected = insertAtSelection ? doc.nodes[insertAtSelection] : undefined
    let target = selected && canContain(selected.type, type) ? selected : findLastSection(doc)
    if (!target) {
      const newSectionId = addSection()
      target = useBuilderStore.getState().doc.nodes[newSectionId]
    }
    if (!target) return
    insert(type, target.id, target.children.length)
  }

  return (
    <button
      className="bw-library-item flex flex-col items-center gap-1 rounded-md border border-line bg-page p-3 text-center hover:border-[var(--bw-editor-accent)]"
      onClick={handleClick}
      ref={setNodeRef}
      title={definition.hint}
      type="button"
      {...listeners}
      {...attributes}
    >
      <LibraryIcon className="h-5 w-5 text-muted" name={definition.icon} />
      <span className="text-xs text-text-heading">{definition.label}</span>
    </button>
  )
}

export function LibraryPanel() {
  return (
    <div className="flex h-full min-h-0 flex-col gap-4 overflow-y-auto p-4">
      {ELEMENT_CATEGORIES.map((category) => {
        const items = ELEMENT_DEFINITIONS.filter((d) => d.category === category.slug)
        if (items.length === 0) return null
        return (
          <div key={category.slug}>
            <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
              {category.label}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {items.map((item) => (
                <LibraryItem key={item.type} type={item.type} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
