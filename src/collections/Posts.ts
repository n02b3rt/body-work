import type { CollectionConfig } from 'payload'

import { staff } from '@/access/roles'
import { builderField, componentRefsField } from '@/fields/builder'
import { metaFields, slugField } from '@/fields/meta'
import { coerceBuilderDoc, wordCount } from '@/lib/builder/types'
import { PAYLOAD_DATETIME_FORMAT, PAYLOAD_TIME_FORMAT } from '@/lib/format-date'

/** Words per minute for the "N min" label. 200 is the usual figure for prose. */
const WORDS_PER_MINUTE = 200

export const Posts: CollectionConfig = {
  slug: 'posts',
  labels: {
    singular: 'Wpis',
    plural: 'Wpisy',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'author', 'publishedAt', 'updatedAt'],
    group: 'Treści',
    description: 'Wpisy na blog.',
  },
  versions: {
    drafts: true,
  },
  hooks: {
    beforeChange: [
      ({ data }) => {
        // Only fill it in when the editor left it blank, so a hand-set value sticks.
        if (data.readingMinutes == null && data.builder) {
          const words = wordCount(coerceBuilderDoc(data.builder))
          if (words > 0) data.readingMinutes = Math.max(1, Math.round(words / WORDS_PER_MINUTE))
        }
        return data
      },
    ],
  },
  access: {
    read: () => true,
    create: staff,
    update: staff,
    delete: staff,
  },
  fields: [
    {
      // Shows whether this post has an English version and links straight to it, so nobody has
      // to find the right document in a list of sixty. See EnglishVersionPanel for why the
      // translation lives in its own collection rather than behind a locale switcher.
      name: 'englishVersion',
      type: 'ui',
      admin: {
        components: {
          Field: '/components/admin/EnglishVersionPanel#EnglishVersionPanel',
        },
      },
    },
    {
      name: 'aiDraft',
      type: 'ui',
      admin: {
        components: {
          Field: '/components/admin/ai/PostDraftAiPanel#PostDraftAiPanel',
        },
      },
    },
    {
      name: 'title',
      type: 'text',
      label: 'Tytuł',
      required: true,
    },
    slugField('title'),
    {
      name: 'excerpt',
      type: 'textarea',
      label: 'Lead / zajawka',
    },
    builderField(),
    componentRefsField(),
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Obraz wyróżniający',
    },
    {
      name: 'publishedAt',
      type: 'date',
      label: 'Data publikacji',
      admin: {
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayAndTime',
          displayFormat: PAYLOAD_DATETIME_FORMAT,
          timeFormat: PAYLOAD_TIME_FORMAT,
        },
      },
    },
    {
      name: 'author',
      type: 'relationship',
      // The `authors` collection, not `users`, see the note on Authors: these are
      // trainers whose name appears on an article, not people with panel logins.
      relationTo: 'authors',
      label: 'Autor',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      label: 'Kategorie',
      admin: {
        position: 'sidebar',
        description: 'Wpis może należeć do kilku kategorii: tak jest w obecnym serwisie.',
      },
    },
    {
      name: 'readingMinutes',
      type: 'number',
      label: 'Czas czytania (min)',
      min: 1,
      admin: {
        position: 'sidebar',
        description: 'Zostaw puste: policzy się automatycznie z długości treści przy zapisie.',
      },
    },
    metaFields,
  ],
}
