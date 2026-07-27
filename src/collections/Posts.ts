import type { CollectionConfig } from 'payload'

import { isAdministrator, isModerator, staff } from '@/access/roles'
import { metaFields, slugField } from '@/fields/meta'

/** Words per minute for the "N min" label. 200 is the usual figure for prose. */
const WORDS_PER_MINUTE = 200

/** Walk a Lexical tree and add up the text. Cheaper and more robust than trying to
 * render it: any node carrying a `text` property contributes, whatever its type. */
function countWords(node: unknown): number {
  if (Array.isArray(node)) return node.reduce((sum, child) => sum + countWords(child), 0)
  if (node && typeof node === 'object') {
    const record = node as Record<string, unknown>
    const own = typeof record.text === 'string' ? record.text.trim().split(/\s+/).filter(Boolean).length : 0
    return own + countWords(record.children ?? [])
  }
  return 0
}

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
        if (data.readingMinutes == null && data.content) {
          const words = countWords(data.content)
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
    delete: ({ req: { user } }) => {
      if (!user) return false
      return isAdministrator(user) || isModerator(user)
    },
  },
  fields: [
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
    {
      name: 'content',
      type: 'richText',
      label: 'Treść',
    },
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
        },
      },
    },
    {
      name: 'author',
      type: 'relationship',
      // The `authors` collection, not `users` — see the note on Authors: these are
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
        description: 'Wpis może należeć do kilku kategorii — tak jest w obecnym serwisie.',
      },
    },
    {
      name: 'readingMinutes',
      type: 'number',
      label: 'Czas czytania (min)',
      min: 1,
      admin: {
        position: 'sidebar',
        description: 'Zostaw puste — policzy się automatycznie z długości treści przy zapisie.',
      },
    },
    metaFields,
  ],
}
