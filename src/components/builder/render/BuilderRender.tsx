'use client'

/**
 * The one renderer that draws both the editor canvas and the public page.
 *
 * A client component so the canvas half can select, hover and edit text in
 * place; on the public site it renders from a Server Component parent with no
 * loss, since nothing here reads browser-only state on mount, it only reads
 * from `useBuilderStore` when `ctx.mode === 'canvas'` — the site passes
 * `mode: 'site'` and none of that runs.
 *
 * Missing element types render a visible placeholder rather than nothing, so
 * a gap in the library is obvious on the canvas instead of silently blank.
 */

import { useDraggable, useDroppable } from '@dnd-kit/core'
import React from 'react'

import type { BuilderDoc, BuilderNode, NodeId } from '@/lib/builder/types'
import { useBuilderStore } from '@/components/builder/editor/store'

import { Accordion } from './elements/Accordion'
import { Button as ButtonEl } from './elements/Button'
import { Container } from './elements/Container'
import { Cta } from './elements/Cta'
import { Divider } from './elements/Divider'
import { Features } from './elements/Features'
import { Gallery } from './elements/Gallery'
import { Heading } from './elements/Heading'
import { Hero } from './elements/Hero'
import { Icon } from './elements/Icon'
import { ImageEl } from './elements/ImageEl'
import { ListEl } from './elements/ListEl'
import { SavedComponent } from './elements/SavedComponent'
import { Section } from './elements/Section'
import { Spacer } from './elements/Spacer'
import { Text } from './elements/Text'
import { Video } from './elements/Video'
import type { RenderCtx } from './ctx'
import { classNameFromHiddenOn, classNameFromTw, customStyleClassName, styleRuleFromCss } from './class-names'
import { CANVAS_DRAG_PREFIX, CANVAS_DROP_PREFIX } from '@/components/builder/editor/dnd-types'

export type ElementProps = {
  node: BuilderNode
  ctx: RenderCtx
  /** Renders this node's own children in order; containers call it, leaves ignore it. */
  children: React.ReactNode
}

const RENDERERS: Record<string, React.ComponentType<ElementProps>> = {
  section: Section,
  container: Container,
  heading: Heading,
  text: Text,
  image: ImageEl,
  button: ButtonEl,
  icon: Icon,
  list: ListEl,
  divider: Divider,
  spacer: Spacer,
  gallery: Gallery,
  carousel: Gallery, // TODO: dedicated carousel renderer (Embla); gallery grid stands in for now.
  video: Video,
  accordion: Accordion,
  hero: Hero,
  cta: Cta,
  features: Features,
  savedComponent: SavedComponent,
}

function Placeholder({ node }: { node: BuilderNode }) {
  return (
    <div className="rounded-md border border-dashed border-error bg-error/10 p-4 text-sm text-error">
      Nieznany typ elementu: {node.type}
    </div>
  )
}

/**
 * One node, selection/hover chrome included when `ctx.mode === 'canvas'`.
 *
 * `doc` is an explicit prop, not read from the store: the public site has no
 * store, only server-fetched data, so node lookup has to work from a plain
 * object either way. The store is only consulted for *selection*, and only
 * meaningfully in canvas mode — the hook is still called unconditionally
 * (rules of hooks), it just returns `null` on the site.
 */
function NodeRenderer({ doc, id, ctx }: { doc: BuilderDoc; id: NodeId; ctx: RenderCtx }) {
  const node = doc.nodes[id]
  const selectedId = useBuilderStore((state) => (ctx.mode === 'canvas' ? state.selectedId : null))
  const hoveredId = useBuilderStore((state) => (ctx.mode === 'canvas' ? state.hoveredId : null))
  const dropIndicator = useBuilderStore((state) => (ctx.mode === 'canvas' ? state.dropIndicator : null))
  const highlightNodeId = useBuilderStore((state) => (ctx.mode === 'canvas' ? state.highlightNodeId : null))
  const select = useBuilderStore((state) => state.select)
  const hover = useBuilderStore((state) => state.hover)

  // Called unconditionally either way (rules of hooks); inert without a
  // DndContext ancestor, which is exactly the site's situation. Registration
  // only — the visual feedback comes from `dropIndicator`, computed once per
  // drag move in `BuilderShell`, not from this hook's own `isOver`, so a
  // canvas node and its tree-panel counterpart (a different droppable
  // altogether, see `Tree.tsx`) draw the same single indicator.
  const { setNodeRef: setDropRef } = useDroppable({
    id: `${CANVAS_DROP_PREFIX}${id}`,
    data: { nodeId: id },
  })
  const {
    setNodeRef: setDragRef,
    listeners: dragListeners,
    attributes: dragAttributes,
  } = useDraggable({
    id: `${CANVAS_DRAG_PREFIX}${id}`,
    data: node ? { kind: 'move', nodeId: id, nodeType: node.type } : undefined,
    disabled: node?.meta?.locked || id === doc.root,
  })

  if (!node) return null

  const Renderer = RENDERERS[node.type]
  const styleRule = styleRuleFromCss(id, node.css)
  const className = [
    classNameFromTw(node.tw),
    classNameFromHiddenOn(node.meta?.hiddenOn),
    styleRule ? customStyleClassName(id) : '',
  ]
    .filter(Boolean)
    .join(' ')

  const content = Renderer ? (
    <Renderer node={node} ctx={ctx}>
      {node.children.map((childId) => (
        <NodeRenderer doc={doc} ctx={ctx} id={childId} key={childId} />
      ))}
    </Renderer>
  ) : (
    <Placeholder node={node} />
  )

  if (ctx.mode !== 'canvas') {
    if (!className) return content
    return (
      <>
        {styleRule ? <style dangerouslySetInnerHTML={{ __html: styleRule }} /> : null}
        <div className={className} data-node-type={node.type}>
          {content}
        </div>
      </>
    )
  }

  const isSelected = selectedId === id
  const isHovered = hoveredId === id
  const isDropTarget = dropIndicator?.nodeId === id
  const isFieldHighlighted = highlightNodeId === id

  return (
    <>
      {styleRule ? <style dangerouslySetInnerHTML={{ __html: styleRule }} /> : null}
      <div
        className={[
          className,
          'bw-canvas-node',
          isSelected ? 'bw-canvas-node--selected' : '',
          isHovered && !isSelected ? 'bw-canvas-node--hovered' : '',
          isDropTarget && dropIndicator?.position === 'inside' ? 'bw-canvas-node--drop-target' : '',
          isDropTarget && dropIndicator?.position === 'before' ? 'bw-drop-line bw-drop-line--before' : '',
          isDropTarget && dropIndicator?.position === 'after' ? 'bw-drop-line bw-drop-line--after' : '',
          isFieldHighlighted ? 'bw-canvas-node--field-highlight' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        data-node-id={id}
        data-node-type={node.type}
        onClick={(event) => {
          event.stopPropagation()
          select(id)
        }}
        onMouseEnter={(event) => {
          event.stopPropagation()
          hover(id)
        }}
        onMouseLeave={() => hover(null)}
        ref={setDropRef}
      >
        {isSelected || isHovered ? (
          <button
            aria-label="Przeciągnij, aby przenieść"
            className="bw-canvas-node__grip"
            ref={setDragRef}
            type="button"
            {...dragListeners}
            {...dragAttributes}
          >
            ⠿
          </button>
        ) : null}
        {content}
      </div>
    </>
  )
}

/** `doc` on the site is the page's saved, published tree; on the canvas it is `store.doc`, re-passed on every edit. */
export function BuilderRender({ doc, ctx }: { doc: BuilderDoc; ctx: RenderCtx }) {
  const rootChildren = doc.nodes[doc.root]?.children ?? []

  return (
    <div className="bw-canvas-root flex flex-col">
      {rootChildren.map((id) => (
        <NodeRenderer doc={doc} ctx={ctx} id={id} key={id} />
      ))}
      {rootChildren.length === 0 && ctx.mode === 'canvas' ? (
        <p className="p-12 text-center text-muted" data-node-id={doc.root}>
          Ta strona nie ma jeszcze żadnych sekcji. Przeciągnij pierwszą z biblioteki.
        </p>
      ) : null}
    </div>
  )
}
