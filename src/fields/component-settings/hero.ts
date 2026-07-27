import type { GroupField } from 'payload'

import { alignField, colorChoice, radiusField } from './shared'

export const heroSettings: GroupField = {
  name: 'hero',
  type: 'group',
  label: 'Parametry hero',
  admin: {
    condition: (data) => data?.type === 'hero',
    description: 'Duże zdjęcie z nagłówkiem, opisem i wezwaniem do działania.',
  },
  fields: [
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: 'Zdjęcie tła',
    },
    {
      name: 'heading',
      type: 'text',
      label: 'Nagłówek',
      defaultValue: 'Wróć do formy z BodyWork Centrum',
    },
    {
      name: 'subheading',
      type: 'textarea',
      label: 'Podtytuł',
    },
    {
      type: 'row',
      fields: [
        {
          name: 'height',
          type: 'select',
          label: 'Wysokość sekcji',
          defaultValue: 'lg',
          options: [
            { label: 'Niska', value: 'sm' },
            { label: 'Średnia', value: 'md' },
            { label: 'Wysoka', value: 'lg' },
            { label: 'Pełny ekran', value: 'screen' },
          ],
          admin: { width: '50%' },
        },
        alignField('align', 'center'),
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'overlayOpacity',
          type: 'number',
          label: 'Przyciemnienie zdjęcia (%)',
          defaultValue: 45,
          min: 0,
          max: 100,
          admin: {
            width: '50%',
            description: 'Kolor nakładki pochodzi z palety (Tła → Przyciemnienie zdjęć).',
          },
        },
        radiusField('md'),
      ],
    },
    colorChoice('textColor', 'Kolor tekstu', 'text.inverted'),
    {
      name: 'ctaButton',
      type: 'relationship',
      relationTo: 'site-components',
      label: 'Przycisk (komponent)',
      filterOptions: () => ({ type: { equals: 'button' } }),
      admin: {
        description: 'Wskaż istniejący komponent typu „Przycisk”.',
      },
    },
  ],
}
