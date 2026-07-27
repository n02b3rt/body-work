import type { GroupField } from 'payload'

import { colorChoice, linkFields, radiusField } from './shared'

export const buttonSettings: GroupField = {
  name: 'button',
  type: 'group',
  label: 'Parametry przycisku',
  admin: {
    condition: (data) => data?.type === 'button',
    description: 'Napis, odnośnik i wygląd przycisku.',
  },
  fields: [
    {
      name: 'label',
      type: 'text',
      label: 'Napis',
      defaultValue: 'Zarezerwuj wizytę',
    },
    ...linkFields,
    {
      type: 'row',
      fields: [
        {
          name: 'variant',
          type: 'select',
          label: 'Styl',
          defaultValue: 'solid',
          options: [
            { label: 'Wypełniony', value: 'solid' },
            { label: 'Obramowany', value: 'outline' },
            { label: 'Przezroczysty', value: 'ghost' },
            { label: 'Odnośnik tekstowy', value: 'link' },
          ],
          admin: { width: '50%' },
        },
        {
          name: 'size',
          type: 'select',
          label: 'Rozmiar',
          defaultValue: 'md',
          options: [
            { label: 'Mały', value: 'sm' },
            { label: 'Średni', value: 'md' },
            { label: 'Duży', value: 'lg' },
          ],
          admin: { width: '50%' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        radiusField('full'),
        {
          name: 'fullWidth',
          type: 'checkbox',
          label: 'Pełna szerokość',
          defaultValue: false,
          admin: { width: '50%' },
        },
      ],
    },
    colorChoice('background', 'Tło', 'brand.primary'),
    colorChoice('textColor', 'Kolor napisu', 'text.inverted'),
    colorChoice(
      'borderColor',
      'Obramowanie',
      'none',
      'Używane przy stylu „obramowany”.',
    ),
  ],
}
