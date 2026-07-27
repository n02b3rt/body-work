import type { GroupField } from 'payload'

import { alignField, colorChoice, radiusField } from './shared'

export const ctaSettings: GroupField = {
  name: 'cta',
  type: 'group',
  label: 'Parametry pasku CTA',
  admin: {
    condition: (data) => data?.type === 'cta',
    description: 'Wyróżniony pasek z zachętą do kontaktu lub rezerwacji.',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      label: 'Nagłówek',
      defaultValue: 'Nie wiesz, którą terapię wybrać?',
    },
    {
      name: 'text',
      type: 'textarea',
      label: 'Treść',
    },
    {
      type: 'row',
      fields: [
        alignField('align', 'center'),
        {
          name: 'padding',
          type: 'select',
          label: 'Wysokość paska',
          defaultValue: 'md',
          options: [
            { label: 'Niski', value: 'sm' },
            { label: 'Średni', value: 'md' },
            { label: 'Wysoki', value: 'lg' },
          ],
          admin: { width: '50%' },
        },
      ],
    },
    colorChoice('background', 'Tło', 'brand.secondary'),
    colorChoice('textColor', 'Kolor tekstu', 'text.inverted'),
    {
      type: 'row',
      fields: [radiusField('lg')],
    },
    {
      name: 'button',
      type: 'relationship',
      relationTo: 'site-components',
      label: 'Przycisk (komponent)',
      filterOptions: () => ({ type: { equals: 'button' } }),
    },
  ],
}
