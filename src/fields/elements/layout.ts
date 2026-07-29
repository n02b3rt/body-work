/**
 * The container element: a row of columns holding other elements.
 *
 * Nesting is one level deep on purpose. Payload blocks cannot reference
 * themselves, and a fixed depth keeps both the generated types and the Postgres
 * tables finite — `section → elements → columns → column → elements` covers the
 * image-left/text-right layouts this exists for, without a tree that can grow
 * without bound.
 */

import type { Block, BlocksField, Field } from 'payload'

import { containerStyleFields } from './style'
import { elementStyleField } from './style'
import { gapField, select } from './shared'

/** A `blocks` field holding elements. Used for sections, columns and compositions. */
export function elementContentField(
  blocks: Block[],
  overrides: Partial<BlocksField> = {},
): BlocksField {
  return {
    name: 'content',
    type: 'blocks',
    label: 'Elementy',
    labels: { singular: 'Element', plural: 'Elementy' },
    blocks,
    admin: {
      description: 'Zawartość układasz na kanwie kreatora.',
      components: {
        Field: '/components/admin/builder/CanvasOnlyField#CanvasOnlyField',
      },
    },
    ...overrides,
  }
}

export function columnsBlock(leafBlocks: Block[]): Block {
  const columnFields: Field[] = [
    {
      type: 'row',
      fields: [
        select(
          'weight',
          'Szerokość kolumny',
          '1',
          [
            { label: 'Równa pozostałym', value: '1' },
            { label: '1,5× szersza', value: '1.5' },
            { label: '2× szersza', value: '2' },
            { label: '3× szersza', value: '3' },
            { label: 'Do szerokości treści', value: 'auto' },
          ],
          '50%',
        ),
        select(
          'verticalAlign',
          'Wyrównanie w pionie',
          'inherit',
          [
            { label: 'Jak w wierszu', value: 'inherit' },
            { label: 'Do góry', value: 'start' },
            { label: 'Do środka', value: 'center' },
            { label: 'Do dołu', value: 'end' },
          ],
          '50%',
        ),
      ],
    },
    ...containerStyleFields(),
    elementContentField(leafBlocks),
  ]

  return {
    slug: 'columns',
    dbName: ({ tableName }) => `${tableName}_b_col`,
    labels: { singular: 'Kolumny', plural: 'Układy kolumnowe' },
    fields: [
      {
        type: 'row',
        fields: [
          gapField('md', 'Odstęp między kolumnami'),
          select(
            'stackOn',
            'Układaj jedna pod drugą',
            'mobile',
            [
              { label: 'Na telefonie', value: 'mobile' },
              { label: 'Na telefonie i tablecie', value: 'tablet' },
              { label: 'Nigdy', value: 'never' },
            ],
            '50%',
          ),
        ],
      },
      {
        type: 'row',
        fields: [
          select(
            'verticalAlign',
            'Wyrównanie w pionie',
            'start',
            [
              { label: 'Do góry', value: 'start' },
              { label: 'Do środka', value: 'center' },
              { label: 'Do dołu', value: 'end' },
              { label: 'Na całą wysokość', value: 'stretch' },
            ],
            '50%',
          ),
        ],
      },
      {
        name: 'columns',
        type: 'array',
        label: 'Kolumny',
        labels: { singular: 'Kolumna', plural: 'Kolumny' },
        dbName: ({ tableName }) => `${tableName}_c`,
        maxRows: 4,
        defaultValue: [{ weight: '1' }, { weight: '1' }],
        fields: columnFields,
      },
      elementStyleField(),
    ],
  }
}

export function savedComponentBlock(): Block {
  return {
    slug: 'savedComponent',
    dbName: ({ tableName }) => `${tableName}_b_saved`,
    labels: { singular: 'Mój komponent', plural: 'Moje komponenty' },
    fields: [
      {
        name: 'component',
        type: 'relationship',
        relationTo: 'site-components',
        label: 'Zapisany komponent',
        admin: {
          description:
            'Złożenie z Wygląd → Komponenty. Zmiana tam aktualizuje każdą stronę, która go używa.',
        },
      },
      elementStyleField(),
    ],
  }
}
