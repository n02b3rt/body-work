/**
 * The page builder's data model: an ordered list of sections, each holding its
 * own tree of elements.
 *
 * A section is the band across the page — width, vertical spacing, background,
 * anchor. What is *in* it comes from the element library
 * (`src/fields/elements/`), configured per placement: a heading here can be
 * centred and a heading there left-aligned without either of them being a
 * separate saved thing.
 *
 * Sections used to be placements of a `site-components` document. That
 * collection now holds **saved compositions**, reachable through the
 * `savedComponent` element, which keeps the "edit once, updates everywhere"
 * behaviour for the layouts that actually need it.
 *
 * The array is edited through `PageBuilder`, a custom Field component. Payload's
 * stock array UI still works if that component is ever removed: no data here
 * depends on the builder being present.
 */

import type { ArrayField } from 'payload'

import { elementsField } from './elements'
import { colorChoice } from './elements/shared'
import { SECTION_SPACING_OPTIONS, SECTION_WIDTH_OPTIONS } from '@/lib/page-sections'

export const pageLayoutField: ArrayField = {
  name: 'layout',
  type: 'array',
  label: 'Sekcje strony',
  labels: { singular: 'Sekcja', plural: 'Sekcje' },
  admin: {
    description:
      'Ułóż stronę z elementów. Powtarzalne złożenia zapisujesz w Zarządzanie → Wygląd → Komponenty.',
    components: {
      Field: '/components/admin/builder/PageBuilder#PageBuilder',
    },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Nazwa sekcji',
      admin: {
        description: 'Tylko dla porządku w kreatorze, nie pojawia się na stronie.',
      },
    },
    elementsField(),
    {
      type: 'row',
      fields: [
        {
          name: 'width',
          type: 'select',
          label: 'Szerokość sekcji',
          defaultValue: 'container',
          options: [...SECTION_WIDTH_OPTIONS],
          admin: { width: '50%' },
        },
        {
          name: 'spacing',
          type: 'select',
          label: 'Odstęp pionowy',
          defaultValue: 'md',
          options: [...SECTION_SPACING_OPTIONS],
          admin: { width: '50%' },
        },
      ],
    },
    colorChoice('background', 'Tło sekcji', 'none'),
    {
      type: 'row',
      fields: [
        {
          name: 'anchor',
          type: 'text',
          label: 'Kotwica (#)',
          admin: {
            width: '50%',
            description: 'Pozwala linkować do tej sekcji, np. „cennik” → /strona#cennik.',
          },
        },
        {
          name: 'hidden',
          type: 'checkbox',
          label: 'Ukryj sekcję',
          defaultValue: false,
          admin: {
            width: '50%',
            description: 'Sekcja zostaje na stronie, ale nie jest publikowana.',
          },
        },
      ],
    },
  ],
}
