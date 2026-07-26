import type { Field } from 'payload'

import { formatSlug } from '@/lib/format-slug'

/** Shared SEO / social metadata for pages and posts */
export const metaFields: Field = {
  name: 'meta',
  type: 'group',
  label: 'Metadane',
  admin: {
    description: 'Tytuł i opis widoczne w wyszukiwarkach oraz przy udostępnianiu w mediach społecznościowych.',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Tytuł SEO',
      admin: {
        description: 'Jeśli puste, użyty zostanie tytuł dokumentu.',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Opis SEO',
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: 'Obraz OG',
    },
    {
      name: 'noIndex',
      type: 'checkbox',
      label: 'Ukryj przed wyszukiwarkami (noindex)',
      defaultValue: false,
    },
  ],
}

export const slugField = (fieldToUse = 'title'): Field => ({
  name: 'slug',
  type: 'text',
  label: 'Slug',
  required: true,
  unique: true,
  index: true,
  admin: {
    position: 'sidebar',
    description: 'Fragment adresu URL (bez ukośników).',
  },
  hooks: {
    beforeValidate: [
      ({ value, data, operation }) => {
        if (typeof value === 'string' && value.length > 0) {
          return formatSlug(value)
        }
        if (operation === 'create' || !value) {
          const source = data?.[fieldToUse]
          if (typeof source === 'string') return formatSlug(source)
        }
        return value
      },
    ],
  },
})
