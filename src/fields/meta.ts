import type { Field } from 'payload'

import { formatSlug } from '@/lib/format-slug'

/** Shared SEO / social metadata for pages and posts */
export const metaFields: Field = {
  name: 'meta',
  type: 'group',
  label: 'Metadane',
  admin: {
    description:
      'Tytuł i opis widoczne w wyszukiwarkach oraz przy udostępnianiu w mediach społecznościowych. Wszystkie pola są opcjonalne: puste znaczy „użyj tego, co już jest w dokumencie”, a nie „brak opisu”.',
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
      // Every hint here earns its place: an empty SEO group looks like an oversight, and a
      // blank field with no explanation is what prompts "why is the SEO not filled in".
      name: 'description',
      type: 'textarea',
      label: 'Opis SEO',
      admin: {
        description:
          'Jeśli puste, użyta zostanie zajawka wpisu. Wypełnij tylko wtedy, gdy w wyszukiwarce ma się pokazać coś innego niż zajawka.',
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: 'Obraz OG',
      admin: {
        description:
          'Jeśli puste, użyte zostanie zdjęcie główne wpisu. Przydaje się, gdy miniatura dobrze wygląda na liście, ale źle w kafelku na Facebooku.',
      },
    },
    {
      name: 'noIndex',
      type: 'checkbox',
      label: 'Ukryj przed wyszukiwarkami (noindex)',
      defaultValue: false,
    },
  ],
}

export const slugField = (
  fieldToUse = 'title',
  { description = 'Fragment adresu URL (bez ukośników).' }: { description?: string } = {},
): Field => ({
  name: 'slug',
  type: 'text',
  label: 'Slug',
  required: true,
  unique: true,
  index: true,
  admin: {
    position: 'sidebar',
    description,
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
