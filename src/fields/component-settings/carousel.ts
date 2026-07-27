import type { GroupField } from 'payload'

import { aspectRatioField, gapField, radiusField } from './shared'

export const carouselSettings: GroupField = {
  name: 'carousel',
  type: 'group',
  label: 'Parametry karuzeli',
  admin: {
    condition: (data) => data?.type === 'carousel',
    description: 'Przewijane zdjęcia z podpisami — np. galeria gabinetu.',
  },
  fields: [
    {
      name: 'slides',
      type: 'array',
      label: 'Slajdy',
      labels: { singular: 'Slajd', plural: 'Slajdy' },
      minRows: 1,
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: '/components/admin/appearance/SlideRowLabel#SlideRowLabel',
        },
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          label: 'Zdjęcie',
          required: true,
        },
        {
          name: 'caption',
          type: 'text',
          label: 'Podpis',
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
      fields: [
        {
          name: 'slidesPerView',
          type: 'select',
          label: 'Widoczne slajdy',
          defaultValue: '1',
          options: [
            { label: '1', value: '1' },
            { label: '2', value: '2' },
            { label: '3', value: '3' },
          ],
          admin: { width: '50%' },
        },
        aspectRatioField('16-9'),
      ],
    },
    {
      type: 'row',
      fields: [radiusField('md'), gapField('md')],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'autoplay',
          type: 'checkbox',
          label: 'Automatyczne przewijanie',
          defaultValue: true,
          admin: { width: '50%' },
        },
        {
          name: 'interval',
          type: 'number',
          label: 'Czas slajdu (s)',
          defaultValue: 5,
          min: 1,
          max: 30,
          admin: {
            width: '50%',
            condition: (_, siblingData) => Boolean(siblingData?.autoplay),
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'showArrows',
          type: 'checkbox',
          label: 'Strzałki',
          defaultValue: true,
          admin: { width: '33%' },
        },
        {
          name: 'showDots',
          type: 'checkbox',
          label: 'Kropki',
          defaultValue: true,
          admin: { width: '33%' },
        },
        {
          name: 'loop',
          type: 'checkbox',
          label: 'Zapętlenie',
          defaultValue: true,
          admin: { width: '34%' },
        },
      ],
    },
  ],
}
