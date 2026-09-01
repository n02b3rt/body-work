'use client'

/**
 * The editor's client-side state: the document being edited, selection,
 * viewport, and undo/redo history.
 *
 * Zustand rather than the store this repo's other client state uses, because
 * the builder canvas re-renders on every keystroke of a text edit and every
 * pixel of a drag; a selector-based store means a component subscribed to one
 * node does not re-render when a sibling changes. Payload's own form state
 * (what the old builder rode on) does not offer that, which was a real
 * source of the old canvas's lag.
 */

import { create } from 'zustand'

import {
  canContain,
  defaultSectionProps,
  elementDefinition,
  MAX_TREE_DEPTH,
} from '@/lib/builder/elements/registry'
import {
  coerceBuilderDoc,
  type BuilderDoc,
  type BuilderNode,
  type Breakpoint,
  type ElementType,
  type NodeId,
} from '@/lib/builder/types'

import type { DropIndicator } from './dnd-types'

export type ViewportKey = 'desktop' | 'tablet' | 'mobile'

export const VIEWPORT_BREAKPOINT: Record<ViewportKey, Breakpoint> = {
  desktop: 'lg',
  tablet: 'md',
  mobile: 'base',
}

export const VIEWPORT_WIDTH: Record<ViewportKey, number> = {
  desktop: 1440,
  tablet: 834,
  mobile: 390,
}

function newNodeId(): NodeId {
  const random = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}${Math.random()}`
  return `n_${random.replace(/[^a-f0-9]/gi, '').slice(0, 20)}`
}

/** Every node id reachable inside a subtree, root included: used to guard against dropping a node into its own descendant. */
function subtreeIds(doc: BuilderDoc, rootId: NodeId): Set<NodeId> {
  const ids = new Set<NodeId>()
  const walk = (id: NodeId) => {
    const node = doc.nodes[id]
    if (!node) return
    ids.add(id)
    node.children.forEach(walk)
  }
  walk(rootId)
  return ids
}

function depthOf(doc: BuilderDoc, id: NodeId): number {
  let depth = 0
  let current = id
  const parents = parentMap(doc)
  while (parents.has(current)) {
    current = parents.get(current)!
    depth += 1
  }
  return depth
}

function parentMap(doc: BuilderDoc): Map<NodeId, NodeId> {
  const parents = new Map<NodeId, NodeId>()
  for (const node of Object.values(doc.nodes)) {
    for (const childId of node.children) parents.set(childId, node.id)
  }
  return parents
}

export type BuilderStoreState = {
  doc: BuilderDoc
  documentTitle: string
  selectedId: NodeId | null
  hoveredId: NodeId | null
  /** Live during a drag only: where the dragged item would land if dropped now. Drives the insertion-line/highlight the canvas and tree draw, see `dnd-types.ts`. */
  dropIndicator: DropIndicator | null
  /** Set while a Layout/Style field is focused, so the canvas can flash the node it belongs to — "what am I editing", not a pixel-precise measurement overlay. `null` the rest of the time. */
  highlightNodeId: NodeId | null
  viewport: ViewportKey
  dirty: boolean
  saving: boolean
  lastSavedAt: number | null
  history: { past: BuilderDoc[]; future: BuilderDoc[] }

  setDoc: (doc: BuilderDoc, opts?: { markClean?: boolean }) => void
  select: (id: NodeId | null) => void
  hover: (id: NodeId | null) => void
  setDropIndicator: (indicator: DropIndicator | null) => void
  setHighlightNodeId: (id: NodeId | null) => void
  setViewport: (viewport: ViewportKey) => void

  insert: (type: ElementType, parentId: NodeId, index: number) => NodeId | null
  addSection: () => NodeId
  move: (nodeId: NodeId, newParentId: NodeId, index: number) => void
  remove: (nodeId: NodeId) => void
  duplicate: (nodeId: NodeId) => NodeId | null
  setProps: (nodeId: NodeId, props: Record<string, unknown>) => void
  setTw: (nodeId: NodeId, breakpoint: Breakpoint, classes: string[]) => void
  /** `null` in `patch` deletes that CSS property from the breakpoint's bucket rather than setting it to the literal string `"null"`. */
  setCss: (nodeId: NodeId, breakpoint: Breakpoint, patch: Record<string, string | null>) => void
  setMeta: (nodeId: NodeId, meta: Partial<NonNullable<BuilderNode['meta']>>) => void
  setA11y: (nodeId: NodeId, a11y: Partial<NonNullable<BuilderNode['a11y']>>) => void
  toggleHidden: (nodeId: NodeId, breakpoint: Breakpoint) => void

  undo: () => void
  redo: () => void

  markSaving: (saving: boolean) => void
  markSaved: () => void
}

const HISTORY_LIMIT = 50

function pushHistory(state: BuilderStoreState): Pick<BuilderStoreState, 'history'> {
  const past = [...state.history.past, state.doc].slice(-HISTORY_LIMIT)
  return { history: { past, future: [] } }
}

export const useBuilderStore = create<BuilderStoreState>((set, get) => ({
  doc: coerceBuilderDoc(null),
  documentTitle: '',
  selectedId: null,
  hoveredId: null,
  dropIndicator: null,
  highlightNodeId: null,
  viewport: 'desktop',
  dirty: false,
  saving: false,
  lastSavedAt: null,
  history: { past: [], future: [] },

  setDoc: (doc, opts) =>
    set({
      doc,
      dirty: !opts?.markClean,
      history: { past: [], future: [] },
    }),

  select: (id) => set({ selectedId: id }),
  hover: (id) => set({ hoveredId: id }),
  setDropIndicator: (indicator) => set({ dropIndicator: indicator }),
  setHighlightNodeId: (id) => set({ highlightNodeId: id }),
  setViewport: (viewport) => set({ viewport }),

  insert: (type, parentId, index) => {
    const state = get()
    const parent = state.doc.nodes[parentId]
    if (!parent) return null
    if (!canContain(parent.type, type)) return null
    if (depthOf(state.doc, parentId) + 1 > MAX_TREE_DEPTH) return null

    const definition = elementDefinition(type)
    const id = newNodeId()
    const node: BuilderNode = {
      id,
      type,
      children: [],
      props: definition ? { ...definition.defaultProps } : {},
      tw: definition ? { ...definition.defaultTw } : {},
    }

    const children = [...parent.children]
    children.splice(Math.max(0, Math.min(index, children.length)), 0, id)

    set({
      ...pushHistory(state),
      doc: {
        ...state.doc,
        nodes: {
          ...state.doc.nodes,
          [id]: node,
          [parentId]: { ...parent, children },
        },
      },
      selectedId: id,
      dirty: true,
    })
    return id
  },

  addSection: () => {
    const state = get()
    const root = state.doc.nodes[state.doc.root]
    const id = newNodeId()
    const node: BuilderNode = {
      id,
      type: 'section',
      children: [],
      props: defaultSectionProps(),
      tw: {},
    }
    set({
      ...pushHistory(state),
      doc: {
        ...state.doc,
        nodes: {
          ...state.doc.nodes,
          [id]: node,
          [state.doc.root]: { ...root, children: [...root.children, id] },
        },
      },
      selectedId: id,
      dirty: true,
    })
    return id
  },

  move: (nodeId, newParentId, index) => {
    const state = get()
    const node = state.doc.nodes[nodeId]
    const newParent = state.doc.nodes[newParentId]
    if (!node || !newParent) return
    if (nodeId === newParentId) return
    if (!canContain(newParent.type, node.type)) return
    // Cannot move a node into its own subtree: that would disconnect it from the root forever.
    if (subtreeIds(state.doc, nodeId).has(newParentId)) return

    const parents = parentMap(state.doc)
    const oldParentId = parents.get(nodeId)
    if (!oldParentId) return
    const oldParent = state.doc.nodes[oldParentId]

    const nodes = { ...state.doc.nodes }

    if (oldParentId === newParentId) {
      // `index` is computed against the *current* array (typically "right after this
      // sibling"), but removing `nodeId` first shifts everything that came after it
      // down by one. If `nodeId` started out earlier than the target position, that
      // shift applies to the target position too, or the node lands one slot too far.
      const originalIndex = oldParent.children.indexOf(nodeId)
      const children = oldParent.children.filter((id) => id !== nodeId)
      const adjustedIndex = originalIndex !== -1 && originalIndex < index ? index - 1 : index
      const clampedIndex = Math.max(0, Math.min(adjustedIndex, children.length))
      children.splice(clampedIndex, 0, nodeId)
      nodes[oldParentId] = { ...oldParent, children }
    } else {
      nodes[oldParentId] = { ...oldParent, children: oldParent.children.filter((id) => id !== nodeId) }
      const children = [...newParent.children]
      children.splice(Math.max(0, Math.min(index, children.length)), 0, nodeId)
      nodes[newParentId] = { ...newParent, children }
    }

    set({ ...pushHistory(state), doc: { ...state.doc, nodes }, dirty: true })
  },

  remove: (nodeId) => {
    const state = get()
    if (nodeId === state.doc.root) return
    const parents = parentMap(state.doc)
    const parentId = parents.get(nodeId)
    if (!parentId) return
    const parent = state.doc.nodes[parentId]

    const drop = subtreeIds(state.doc, nodeId)
    const nodes = { ...state.doc.nodes }
    drop.forEach((id) => delete nodes[id])
    nodes[parentId] = { ...parent, children: parent.children.filter((id) => id !== nodeId) }

    set({
      ...pushHistory(state),
      doc: { ...state.doc, nodes },
      selectedId: state.selectedId && drop.has(state.selectedId) ? null : state.selectedId,
      dirty: true,
    })
  },

  duplicate: (nodeId) => {
    const state = get()
    const parents = parentMap(state.doc)
    const parentId = parents.get(nodeId)
    if (!parentId) return null
    const parent = state.doc.nodes[parentId]

    const nodes = { ...state.doc.nodes }
    const idMap = new Map<NodeId, NodeId>()

    const cloneSubtree = (id: NodeId): NodeId => {
      const original = state.doc.nodes[id]
      const clonedId = newNodeId()
      idMap.set(id, clonedId)
      const clonedChildren = original.children.map(cloneSubtree)
      nodes[clonedId] = { ...original, id: clonedId, children: clonedChildren }
      return clonedId
    }

    const rootCloneId = cloneSubtree(nodeId)
    const index = parent.children.indexOf(nodeId)
    const children = [...parent.children]
    children.splice(index + 1, 0, rootCloneId)
    nodes[parentId] = { ...parent, children }

    set({ ...pushHistory(state), doc: { ...state.doc, nodes }, selectedId: rootCloneId, dirty: true })
    return rootCloneId
  },

  setProps: (nodeId, props) => {
    const state = get()
    const node = state.doc.nodes[nodeId]
    if (!node) return
    set({
      ...pushHistory(state),
      doc: {
        ...state.doc,
        nodes: { ...state.doc.nodes, [nodeId]: { ...node, props: { ...node.props, ...props } } },
      },
      dirty: true,
    })
  },

  setTw: (nodeId, breakpoint, classes) => {
    const state = get()
    const node = state.doc.nodes[nodeId]
    if (!node) return
    set({
      ...pushHistory(state),
      doc: {
        ...state.doc,
        nodes: {
          ...state.doc.nodes,
          [nodeId]: { ...node, tw: { ...node.tw, [breakpoint]: classes } },
        },
      },
      dirty: true,
    })
  },

  setCss: (nodeId, breakpoint, patch) => {
    const state = get()
    const node = state.doc.nodes[nodeId]
    if (!node) return
    const bucket = { ...(node.css?.[breakpoint] ?? {}) }
    for (const [prop, value] of Object.entries(patch)) {
      if (value === null) delete bucket[prop]
      else bucket[prop] = value
    }
    set({
      ...pushHistory(state),
      doc: {
        ...state.doc,
        nodes: { ...state.doc.nodes, [nodeId]: { ...node, css: { ...node.css, [breakpoint]: bucket } } },
      },
      dirty: true,
    })
  },

  setMeta: (nodeId, meta) => {
    const state = get()
    const node = state.doc.nodes[nodeId]
    if (!node) return
    set({
      doc: {
        ...state.doc,
        nodes: { ...state.doc.nodes, [nodeId]: { ...node, meta: { ...node.meta, ...meta } } },
      },
      dirty: true,
    })
  },

  setA11y: (nodeId, a11y) => {
    const state = get()
    const node = state.doc.nodes[nodeId]
    if (!node) return
    set({
      ...pushHistory(state),
      doc: {
        ...state.doc,
        nodes: { ...state.doc.nodes, [nodeId]: { ...node, a11y: { ...node.a11y, ...a11y } } },
      },
      dirty: true,
    })
  },

  toggleHidden: (nodeId, breakpoint) => {
    const state = get()
    const node = state.doc.nodes[nodeId]
    if (!node) return
    const current = node.meta?.hiddenOn ?? []
    const hiddenOn = current.includes(breakpoint)
      ? current.filter((b) => b !== breakpoint)
      : [...current, breakpoint]
    set({
      ...pushHistory(state),
      doc: {
        ...state.doc,
        nodes: { ...state.doc.nodes, [nodeId]: { ...node, meta: { ...node.meta, hiddenOn } } },
      },
      dirty: true,
    })
  },

  undo: () => {
    const state = get()
    const previous = state.history.past.at(-1)
    if (!previous) return
    set({
      doc: previous,
      history: {
        past: state.history.past.slice(0, -1),
        future: [state.doc, ...state.history.future].slice(0, HISTORY_LIMIT),
      },
      dirty: true,
    })
  },

  redo: () => {
    const state = get()
    const next = state.history.future[0]
    if (!next) return
    set({
      doc: next,
      history: {
        past: [...state.history.past, state.doc].slice(-HISTORY_LIMIT),
        future: state.history.future.slice(1),
      },
      dirty: true,
    })
  },

  markSaving: (saving) => set({ saving }),
  markSaved: () => set({ dirty: false, saving: false, lastSavedAt: Date.now() }),
}))
