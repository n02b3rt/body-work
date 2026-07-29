'use client'

/**
 * Reading the builder's own schema out of the client field config Payload hands
 * a custom Field component.
 *
 * The inspector renders the selected block with Payload's `RenderFields`, which
 * needs three things: the block's client fields, the path of the row in form
 * state, and the *schema* path of the blocks field it belongs to. The first
 * comes from here; the other two are derived, because the nesting is fixed:
 *
 *   layout            → sections (array)
 *   layout.content    → elements (blocks)
 *   layout.content.columns.columns.content → elements inside a column (blocks)
 */

import type { ClientBlock, ClientField } from 'payload'

/** Row / collapsible / tabs carry fields but no name; flatten them away. */
function flatten(fields: ClientField[] | undefined): ClientField[] {
  if (!Array.isArray(fields)) return []

  return fields.flatMap((field) => {
    if (field.type === 'tabs') {
      return field.tabs.flatMap((tab) =>
        'name' in tab && tab.name ? [] : flatten(tab.fields as ClientField[]),
      )
    }
    if (field.type === 'row' || field.type === 'collapsible') {
      return flatten(field.fields as ClientField[])
    }
    return [field]
  })
}

export function findField(fields: ClientField[] | undefined, name: string): ClientField | undefined {
  return flatten(fields).find((field) => 'name' in field && field.name === name)
}

export function blocksOf(field: ClientField | undefined): ClientBlock[] {
  if (!field || field.type !== 'blocks') return []
  return (field.blocks ?? []) as ClientBlock[]
}

export function fieldsOf(field: ClientField | undefined): ClientField[] {
  if (!field || !('fields' in field) || !Array.isArray(field.fields)) return []
  return field.fields as ClientField[]
}

/** The element library available inside a column, one nesting level down. */
export function nestedBlocks(blocks: ClientBlock[]): ClientBlock[] {
  const columns = blocks.find((block) => block.slug === 'columns')
  if (!columns) return []
  const columnsArray = findField(columns.fields as ClientField[], 'columns')
  return blocksOf(findField(fieldsOf(columnsArray), 'content'))
}

export function blockBySlug(blocks: ClientBlock[], slug: unknown): ClientBlock | undefined {
  return blocks.find((block) => block.slug === slug)
}

/**
 * Payload composes a block row's schema path as `${blocksFieldSchemaPath}.${slug}`
 * (see `addFieldStatePromise`), and that is what `RenderFields` has to be given
 * or custom field components inside the block resolve against nothing.
 */
export function blockSchemaPath(blocksSchemaPath: string, slug: string): string {
  return `${blocksSchemaPath}.${slug}`
}

/**
 * Where the selected row currently lives.
 *
 * Selection is kept as an **id**, never an index: moving or deleting a row
 * shifts every index after it, and an index-keyed selection would silently
 * re-point the inspector at a different element. The rest is re-derived from the
 * values on every render, which is why this is a search rather than a cache.
 */
export type Located =
  | {
      blockType: string
      id: string
      index: number
      kind: 'element'
      /** Path of the `blocks` field this row sits in. */
      listPath: string
      listSchemaPath: string
      /** Inside a column: the library there excludes `columns`. */
      nested: boolean
      path: string
    }
  | { id: string; index: number; kind: 'section'; path: string }

function asList(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? (value as Record<string, unknown>[]) : []
}

/** The `content` field of one column, in both path spaces. */
export function columnContentPaths(
  listPath: string,
  listSchemaPath: string,
  elementIndex: number,
  columnIndex: number,
): { path: string; schemaPath: string } {
  return {
    path: `${listPath}.${elementIndex}.columns.${columnIndex}.content`,
    schemaPath: `${listSchemaPath}.columns.columns.content`,
  }
}

export function locateInElements(
  elements: unknown,
  id: string,
  listPath: string,
  listSchemaPath: string,
  nested = false,
): Located | null {
  const list = asList(elements)

  for (let index = 0; index < list.length; index += 1) {
    const element = list[index]!
    if (element.id === id) {
      return {
        blockType: String(element.blockType ?? ''),
        id,
        index,
        kind: 'element',
        listPath,
        listSchemaPath,
        nested,
        path: `${listPath}.${index}`,
      }
    }

    if (element.blockType === 'columns') {
      const columns = asList(element.columns)
      for (let columnIndex = 0; columnIndex < columns.length; columnIndex += 1) {
        const paths = columnContentPaths(listPath, listSchemaPath, index, columnIndex)
        const found = locateInElements(
          columns[columnIndex]!.content,
          id,
          paths.path,
          paths.schemaPath,
          true,
        )
        if (found) return found
      }
    }
  }

  return null
}

export function locateInSections(
  sections: unknown,
  id: string,
  path: string,
  schemaPath: string,
): Located | null {
  const list = asList(sections)

  for (let index = 0; index < list.length; index += 1) {
    const section = list[index]!
    if (section.id === id) {
      return { id, index, kind: 'section', path: `${path}.${index}` }
    }
    const found = locateInElements(
      section.content,
      id,
      `${path}.${index}.content`,
      `${schemaPath}.content`,
    )
    if (found) return found
  }

  return null
}

/** Row ids are form-state only until the document is saved; Payload's own shape. */
export function newRowId(): string {
  const random = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}${Math.random()}`
  return random.replace(/[^a-f0-9]/gi, '').slice(0, 24)
}
