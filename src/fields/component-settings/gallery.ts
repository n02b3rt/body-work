import type { GroupField } from 'payload'

import {
  aspectRatioField,
  columnsField,
  gapField,
  radiusField,
} from './shared'

export const gallerySettings: GroupField = {
  name: 'gallery',
  type: 'group',
  label: 'Parametry galerii',
  admin: {
    condition: (data) => data?.type === 'gallery',
    description: 'Siatka zdjęć: realizacje, zespół, wnętrza.',
  },
  fields: [
    {
      name: 'images',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      label: 'Zdjęcia',
    },
    {
      type: 'row',
      fields: [columnsField('3'), gapField('md')],
    },
    {
      type: 'row',
      fields: [aspectRatioField('1-1'), radiusField('md')],
    },
    {
      name: 'lightbox',
      type: 'checkbox',
      label: 'Powiększanie po kliknięciu',
      defaultValue: true,
    },
    {
      name: 'showCaptions',
      type: 'checkbox',
      label: 'Pokaż podpisy zdjęć',
      defaultValue: false,
      admin: {
        description: 'Podpis pobierany jest z pola „Podpis” w bibliotece mediów.',
      },
    },
  ],
}
