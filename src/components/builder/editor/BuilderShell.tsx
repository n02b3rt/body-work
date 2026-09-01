'use client'

import {
  DndContext,
  DragOverlay,
  useDroppable,
  type DragEndEvent,
  type DragMoveEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { useEffect, useState } from 'react'

import { elementLabel, canContain } from '@/lib/builder/elements/registry'
import { findParent, type BuilderDoc, type BuilderNode } from '@/lib/builder/types'
import type { BuilderCollection } from '@/lib/builder/document'
import { BuilderRender } from '@/components/builder/render/BuilderRender'
import { baseRenderCtx } from '@/components/builder/render/ctx'

import { CANVAS_DROP_PREFIX, type DragData, type DropData } from './dnd-types'
import { computeDropPosition } from './drop-position'
import { InspectorPanel } from '@/components/builder/inspector/InspectorPanel'
import { LibraryPanel } from './LibraryPanel'
import { Tree } from './Tree'
import { Toolbar } from './Toolbar'
import { useBuilderStore, VIEWPORT_WIDTH } from './store'
import { useResolvedMedia } from './use-resolved-media'

type BuilderShellProps = {
  collection: BuilderCollection
  documentId: number
  title: string
  initialDoc: BuilderDoc
}

/** Sidebar toggling between the element library and the inspector — one column, one job at a time, Elementor's own layout. */
function LeftPanel() {
  const [manualTab, setManualTab] = useState<'library' | 'inspector' | null>(null)
  const selectedId = useBuilderStore((state) => state.selectedId)
  // Selecting a node switches to the inspector; a manual click overrides that until the
  // next selection change resets it. Derived during render rather than an effect calling
  // setTab, which is exactly the pattern react-hooks/set-state-in-effect flags.
  const [lastAutoSwitchFor, setLastAutoSwitchFor] = useState<string | null>(null)
  const tab: 'library' | 'inspector' =
    selectedId && selectedId !== lastAutoSwitchFor ? 'inspector' : (manualTab ?? 'library')

  if (selectedId && selectedId !== lastAutoSwitchFor) {
    setLastAutoSwitchFor(selectedId)
    setManualTab(null)
  }

  const setTab = (next: 'library' | 'inspector') => setManualTab(next)

  return (
    <div className="flex min-h-0 flex-col border-r border-line bg-page">
      <div className="flex shrink-0 border-b border-line">
        <button
          className={`flex-1 py-2 text-sm ${tab === 'library' ? 'border-b-2 border-[var(--bw-editor-accent)] text-[var(--bw-editor-accent)]' : 'text-muted'}`}
          onClick={() => setTab('library')}
          type="button"
        >
          Biblioteka
        </button>
        <button
          className={`flex-1 py-2 text-sm ${tab === 'inspector' ? 'border-b-2 border-[var(--bw-editor-accent)] text-[var(--bw-editor-accent)]' : 'text-muted'}`}
          onClick={() => setTab('inspector')}
          type="button"
        >
          Ustawienia
        </button>
      </div>
      <div className="min-h-0 flex-1">{tab === 'library' ? <LibraryPanel /> : <InspectorPanel />}</div>
    </div>
  )
}

export function BuilderShell({ collection, documentId, title, initialDoc }: BuilderShellProps) {
  const setDoc = useBuilderStore((state) => state.setDoc)
  const doc = useBuilderStore((state) => state.doc)
  const viewport = useBuilderStore((state) => state.viewport)
  const select = useBuilderStore((state) => state.select)
  const remove = useBuilderStore((state) => state.remove)
  const duplicate = useBuilderStore((state) => state.duplicate)
  const undo = useBuilderStore((state) => state.undo)
  const redo = useBuilderStore((state) => state.redo)
  const insert = useBuilderStore((state) => state.insert)
  const move = useBuilderStore((state) => state.move)
  const addSection = useBuilderStore((state) => state.addSection)
  const setDropIndicator = useBuilderStore((state) => state.setDropIndicator)
  const selectedId = useBuilderStore((state) => state.selectedId)
  const [dragLabel, setDragLabel] = useState<string | null>(null)
  const media = useResolvedMedia(doc)

  // `@dnd-kit` gives each draggable/droppable an accessibility id from a module-level
  // counter (`useUniqueId`), not React's own `useId()`. In a Next.js server-rendered page
  // that counter's starting value on the server (shared across requests handled by the
  // same process) essentially never matches a fresh client bundle's, so the very first
  // paint mismatches on `aria-describedby` for every drag handle. There is no server-side
  // value worth rendering for an editor no visitor's browser reaches unauthenticated
  // anyway, so nothing inside `DndContext` renders until after mount: the server (and the
  // client's first paint, which must match it) both render this plain loading shell.
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setDoc(initialDoc, { markClean: true })
    setMounted(true)
    // Only on mount: the store owns every edit from here on, re-running this on
    // every `initialDoc` identity change would stomp in-progress edits.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null
      const typing = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
      if (typing) return

      const meta = event.metaKey || event.ctrlKey
      if (meta && event.key.toLowerCase() === 'z' && event.shiftKey) {
        event.preventDefault()
        redo()
      } else if (meta && event.key.toLowerCase() === 'z') {
        event.preventDefault()
        undo()
      } else if (meta && event.key.toLowerCase() === 'd' && selectedId) {
        event.preventDefault()
        duplicate(selectedId)
      } else if (event.key === 'Delete' || event.key === 'Backspace') {
        if (selectedId) {
          event.preventDefault()
          remove(selectedId)
        }
      } else if (event.key === 'Escape') {
        select(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedId, undo, redo, duplicate, remove, select])

  // A fallback drop target covering the whole canvas: `NodeRenderer` only registers a
  // droppable for actual nodes, so an empty page (no sections yet) or the blank padding
  // below the last section would otherwise have nowhere to catch a drop. Called
  // unconditionally, ahead of the `mounted` early return below (rules of hooks).
  const { isOver: isOverRoot, setNodeRef: setRootDropRef } = useDroppable({
    id: `${CANVAS_DROP_PREFIX}${doc.root}`,
    data: { nodeId: doc.root },
  })

  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current as DragData | undefined
    if (!data) return
    setDragLabel(data.kind === 'insert' ? elementLabel(data.elementType) : elementLabel(data.nodeType))
  }

  // Live during a drag: recomputes the before/after/inside indicator on every pointer
  // move so the canvas and tree can draw it, see `drop-position.ts` and `dnd-types.ts`.
  const handleDragMove = (event: DragMoveEvent) => {
    const { active, over } = event
    if (!over) {
      setDropIndicator(null)
      return
    }
    const activeData = active.data.current as DragData | undefined
    const overData = over.data.current as DropData | undefined
    const overNode = overData ? doc.nodes[overData.nodeId] : undefined
    if (!activeData || !overNode) {
      setDropIndicator(null)
      return
    }

    // Root has no siblings of its own: dropping "on" it always means "inside", the
    // section-per-drop fallback `handleDragEnd` applies when nothing else can catch it.
    if (overNode.type === 'root') {
      setDropIndicator({ nodeId: overNode.id, position: 'inside' })
      return
    }

    const draggedRect = active.rect.current.translated
    if (!draggedRect) {
      setDropIndicator(null)
      return
    }

    const draggedType = activeData.kind === 'insert' ? activeData.elementType : activeData.nodeType
    const canBeInside = canContain(overNode.type, draggedType)
    const position = computeDropPosition(draggedRect, over.rect, canBeInside)
    setDropIndicator({ nodeId: overNode.id, position })
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setDragLabel(null)
    const indicator = useBuilderStore.getState().dropIndicator
    setDropIndicator(null)

    const { active, over } = event
    if (!over || !indicator) return
    const activeData = active.data.current as DragData | undefined
    const overData = over.data.current as DropData | undefined
    if (!activeData || !overData) return

    const overNode = doc.nodes[overData.nodeId]
    if (!overNode) return

    const draggedType = activeData.kind === 'insert' ? activeData.elementType : activeData.nodeType

    let parent: BuilderNode | undefined
    let index: number

    if (indicator.position === 'inside') {
      parent = canContain(overNode.type, draggedType) ? overNode : undefined
      // The root only ever accepts a `section` (`canContain('root', …)`), so dropping
      // anything else here — the common case, an empty page's whole canvas is one big
      // root drop target — needs a section created to receive it, the way Elementor
      // creates a section under a dropped widget rather than rejecting the drop.
      if (!parent && overNode.type === 'root' && draggedType !== 'section') {
        const newSectionId = addSection()
        parent = useBuilderStore.getState().doc.nodes[newSectionId]
      }
      if (!parent) return
      index = parent.children.length
    } else {
      parent = findParent(doc, overNode.id)
      if (!parent) return
      const siblingIndex = parent.children.indexOf(overNode.id)
      if (siblingIndex === -1) return
      if (!canContain(parent.type, draggedType)) return
      index = indicator.position === 'before' ? siblingIndex : siblingIndex + 1
    }

    if (activeData.kind === 'insert') {
      insert(activeData.elementType, parent.id, index)
      return
    }

    if (activeData.nodeId === overNode.id) return
    move(activeData.nodeId, parent.id, index)
  }

  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center text-muted">
        Wczytywanie kreatora…
      </div>
    )
  }

  return (
    <DndContext
      onDragCancel={() => setDropIndicator(null)}
      onDragEnd={handleDragEnd}
      onDragMove={handleDragMove}
      onDragStart={handleDragStart}
    >
      <div className="grid h-screen grid-cols-[280px_1fr_280px] grid-rows-[auto_1fr]">
        <div className="col-span-3 shrink-0">
          <Toolbar collection={collection} documentId={documentId} title={title} />
        </div>
        <LeftPanel />
        <div
          className="min-h-0 overflow-y-auto bg-surface-alt p-6"
          onClick={() => select(null)}
          ref={setRootDropRef}
        >
          <div
            className={[
              'mx-auto bg-page shadow-sm transition-[max-width]',
              isOverRoot ? 'bw-canvas-node--drop-target' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            style={{ maxWidth: VIEWPORT_WIDTH[viewport] }}
          >
            <BuilderRender ctx={{ ...baseRenderCtx('canvas'), media }} doc={doc} />
          </div>
        </div>
        <aside className="flex min-h-0 flex-col border-l border-line bg-page">
          <h2 className="shrink-0 border-b border-line p-3 text-xs font-medium uppercase tracking-wide text-muted">
            Drzewko strony
          </h2>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <Tree />
          </div>
        </aside>
      </div>
      <DragOverlay>
        {dragLabel ? (
          <div className="rounded-md bg-[var(--bw-editor-accent)] px-3 py-1.5 text-sm text-white shadow-lg">
            {dragLabel}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
