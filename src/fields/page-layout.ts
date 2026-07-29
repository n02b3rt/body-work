/**
 * The page builder's data model: an ordered list of sections, each one a
 * placement of a component from "Wygląd → Komponenty".
 *
 * The overrides live on the *placement*, not on the component, so the same
 * component can sit on a dark full-bleed band on one page and inside a narrow
 * column on another without being duplicated in the component library.
 *
 * The array is edited through `PageBuilder`, a custom Field component. Payload's
 * stock array UI still works if that component is ever removed: no data here
 * depends on the builder being present.
 */

import type { ArrayField } from 'payload'

import { colorChoice } from './component-settings/shared'
import { SECTION_SPACING_OPTIONS, SECTION_WIDTH_OPTIONS } from '@/lib/page-sections'

export const pageLayoutField: ArrayField = {
  name: 'layout',
  type: 'array',
  label: 'Sekcje strony',
  labels: { singular: 'Sekcja', plural: 'Sekcje' },
  admin: {
    description:
      'Ułóż stronę z gotowych komponentów. Komponenty dodajesz i edytujesz w Zarządzanie → Wygląd → Komponenty.',
    components: {
      Field: '/components/admin/builder/PageBuilder#PageBuilder',
    },
  },
  fields: [
    {
      name: 'component',
      type: 'relationship',
      relationTo: 'site-components',
      label: 'Komponent',
      required: true,
      admin: {
        description: 'Który komponent z biblioteki wyświetlić w tym miejscu.',
      },
    },
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
