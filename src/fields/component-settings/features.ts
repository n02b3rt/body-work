import type { GroupField } from 'payload'

import { colorChoice, columnsField, gapField, radiusField } from './shared'

export const featuresSettings: GroupField = {
  name: 'features',
  type: 'group',
  label: 'Parametry kart',
  admin: {
    condition: (data) => data?.type === 'features',
    description: 'Zestaw kart z ikoną/zdjęciem, tytułem i krótkim opisem.',
  },
  fields: [
    {
      name: 'items',
      type: 'array',
      label: 'Karty',
      labels: { singular: 'Karta', plural: 'Karty' },
      minRows: 1,
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: '/components/admin/appearance/CardRowLabel#CardRowLabel',
        },
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          label: 'Tytuł',
          required: true,
        },
        {
          name: 'text',
          type: 'textarea',
          label: 'Opis',
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          label: 'Ikona / zdjęcie',
        },
        {
          name: 'href',
          type: 'text',
          label: 'Odnośnik (opcjonalnie)',
        },
      ],
    },
    {
      type: 'row',
      fields: [columnsField('3'), gapField('md')],
    },
    colorChoice('cardBackground', 'Tło karty', 'surface.surface'),
    colorChoice('cardBorder', 'Obramowanie karty', 'surface.border'),
    colorChoice('titleColor', 'Kolor tytułu', 'text.heading'),
    {
      type: 'row',
      fields: [radiusField('md')],
    },
  ],
}
