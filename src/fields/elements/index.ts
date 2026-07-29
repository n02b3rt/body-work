/**
 * The element library: the blocks an editor can drop into a page, a post or a
 * saved composition.
 *
 * This replaced `component-settings/`, where every "component" was a document
 * with a type. Elements are a *library of widgets* configured per placement;
 * "Wygląd → Komponenty" now holds saved compositions of them.
 *
 * Everything is built through factories, because the same block appears in three
 * fields (a page's sections, a column, a composition) and Payload sanitizes
 * field configs in place.
 *
 * The names and grouping live in `src/lib/element-catalog.ts`, so the builder UI
 * can read them without pulling this file into the browser bundle.
 */

import type { Block, BlocksField } from 'payload'

import { ELEMENT_ORDER } from '@/lib/element-catalog'

import {
  buttonsBlock,
  dividerBlock,
  headingBlock,
  iconListBlock,
  imageBlock,
  spacerBlock,
  textBlock,
} from './basic'
import { columnsBlock, elementContentField, savedComponentBlock } from './layout'
import { carouselBlock, galleryBlock, videoBlock } from './media'
import { accordionBlock, ctaBlock, featuresBlock, heroBlock } from './sections'

/** Elements allowed inside a column: everything but another column. */
function leafBlocks(): Block[] {
  return [
    headingBlock(),
    textBlock(),
    imageBlock(),
    buttonsBlock(),
    iconListBlock(),
    dividerBlock(),
    spacerBlock(),
    galleryBlock(),
    carouselBlock(),
    videoBlock(),
    heroBlock(),
    ctaBlock(),
    featuresBlock(),
    accordionBlock(),
    savedComponentBlock(),
  ]
}

/** The full library, in library order. */
export function elementBlocks(): Block[] {
  const bySlug = new Map(leafBlocks().map((block) => [block.slug, block]))
  const columns = columnsBlock(leafBlocks())
  bySlug.set(columns.slug, columns)

  return ELEMENT_ORDER.map((slug) => bySlug.get(slug)).filter((block): block is Block =>
    Boolean(block),
  )
}

/** A `content` blocks field carrying the whole library. */
export function elementsField(overrides: Partial<BlocksField> = {}): BlocksField {
  return elementContentField(elementBlocks(), overrides)
}

export { elementContentField }
