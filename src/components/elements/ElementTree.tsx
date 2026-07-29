/**
 * Renders a list of page-builder elements.
 *
 * One dispatcher for both sides — the builder canvas wraps each frame in a
 * selectable shell and passes `mode: 'admin'`, the site renders the same output
 * from a Server Component. Anything that needs interaction lives in its own
 * `'use client'` view and receives plain props, so no function ever has to cross
 * the RSC boundary.
 *
 * `columns` and `savedComponent` are defined here rather than in their own files
 * because both recurse back into `ElementTree`, and a module cycle is the one
 * thing this file exists to avoid.
 */

import type { ReactNode } from 'react'

import { asArray, asRecord, str } from '@/lib/component-values'
import { resolveContainerStyle, resolveElementStyle, space } from '@/lib/element-styles'

import {
  ButtonsElement,
  DividerElement,
  ElementPlaceholder,
  HeadingElement,
  IconListElement,
  ImageElement,
  SpacerElement,
  TextElement,
} from './BasicElements'
import { CarouselElement, GalleryElement, VideoElement } from './MediaElements'
import {
  AccordionElement,
  CtaElement,
  FeaturesElement,
  HeroElement,
} from './SectionElements'
import { MAX_COMPOSITION_DEPTH, type ElementCtx } from './types'

export type ElementNodeProps = { ctx: ElementCtx; data: Record<string, unknown> }

/** The frame every element sits in: the `style` group an editor configured. */
export function ElementFrame({
  blockType,
  children,
  data,
}: {
  blockType: string
  children: ReactNode
  data: Record<string, unknown>
}) {
  const frame = resolveElementStyle(data.style)

  return (
    <div className={frame.className} data-element={blockType} id={frame.id} style={frame.style}>
      {children}
    </div>
  )
}

export function ElementBody({ ctx, data }: ElementNodeProps) {
  const blockType = str(data.blockType)

  switch (blockType) {
    case 'heading':
      return <HeadingElement ctx={ctx} data={data} />
    case 'text':
      return <TextElement ctx={ctx} data={data} />
    case 'image':
      return <ImageElement ctx={ctx} data={data} />
    case 'buttons':
      return <ButtonsElement ctx={ctx} data={data} />
    case 'iconList':
      return <IconListElement ctx={ctx} data={data} />
    case 'divider':
      return <DividerElement ctx={ctx} data={data} />
    case 'spacer':
      return <SpacerElement ctx={ctx} data={data} />
    case 'columns':
      return <ColumnsElement ctx={ctx} data={data} />
    case 'gallery':
      return <GalleryElement ctx={ctx} data={data} />
    case 'carousel':
      return <CarouselElement ctx={ctx} data={data} />
    case 'video':
      return <VideoElement ctx={ctx} data={data} />
    case 'hero':
      return <HeroElement ctx={ctx} data={data} />
    case 'cta':
      return <CtaElement ctx={ctx} data={data} />
    case 'features':
      return <FeaturesElement ctx={ctx} data={data} />
    case 'accordion':
      return <AccordionElement ctx={ctx} data={data} />
    case 'savedComponent':
      return <SavedComponentElement ctx={ctx} data={data} />
    default:
      // An unknown block means the library moved on without this placement.
      // Nothing on the site; a marker in the panel, where it is actionable.
      return ctx.mode === 'admin' ? (
        <ElementPlaceholder label={`Nieznany element: ${blockType || 'brak'}`} />
      ) : null
  }
}

export function ElementTree({ ctx, elements }: { ctx: ElementCtx; elements: unknown }) {
  const list = asArray(elements)
  if (list.length === 0) return null

  return (
    <>
      {list.map((element, index) => (
        <ElementFrame
          blockType={str(element.blockType)}
          data={element}
          key={str(element.id) || index}
        >
          <ElementBody ctx={ctx} data={element} />
        </ElementFrame>
      ))}
    </>
  )
}

/**
 * A row of columns.
 *
 * Widths are `fr` weights written into `grid-template-columns`, so the gap is
 * subtracted by the grid itself; stacking is a container query in
 * `src/styles/elements.css` keyed off `data-stack`.
 */
function ColumnsElement({ ctx, data }: ElementNodeProps) {
  const columns = asArray(data.columns)
  if (columns.length === 0) {
    return ctx.mode === 'admin' ? <ElementPlaceholder label="Kolumny: dodaj kolumnę" /> : null
  }

  const template = columns
    .map((column) => {
      const weight = str(column.weight, '1')
      return weight === 'auto' ? 'auto' : `${Number(weight) || 1}fr`
    })
    .join(' ')

  return (
    <div
      className="bw-el-columns"
      data-align={str(data.verticalAlign, 'start')}
      data-stack={str(data.stackOn, 'mobile')}
      style={{ gap: space(data.gap, 'md'), gridTemplateColumns: template }}
    >
      {columns.map((column, index) => {
        const self = str(column.verticalAlign, 'inherit')
        return (
          <div
            className="bw-el-column"
            key={str(column.id) || index}
            style={{
              ...resolveContainerStyle(column),
              alignSelf: self === 'inherit' ? undefined : self,
            }}
          >
            <ElementTree ctx={ctx} elements={column.content} />
          </div>
        )
      })}
    </div>
  )
}

/**
 * A saved composition, inlined.
 *
 * Referenced rather than copied, so editing it in "Wygląd → Komponenty" updates
 * every page at once. The depth guard is not theoretical: nothing stops an
 * editor from putting a composition inside itself.
 */
function SavedComponentElement({ ctx, data }: ElementNodeProps) {
  const doc = asRecord(data.component)
  const name = str(doc.name)

  if (!doc.id) {
    return ctx.mode === 'admin' ? (
      <ElementPlaceholder label="Mój komponent: wybierz złożenie" />
    ) : null
  }

  if (ctx.depth >= MAX_COMPOSITION_DEPTH) {
    return ctx.mode === 'admin' ? (
      <ElementPlaceholder label={`„${name}” zagnieżdżony zbyt głęboko`} />
    ) : null
  }

  const content = asArray(doc.content)
  if (content.length === 0) {
    return ctx.mode === 'admin' ? (
      <ElementPlaceholder label={`„${name || 'Mój komponent'}” jest pusty`} />
    ) : null
  }

  return <ElementTree ctx={{ ...ctx, depth: ctx.depth + 1 }} elements={doc.content} />
}
