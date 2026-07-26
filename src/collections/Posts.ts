import type { CollectionConfig } from 'payload'

import { isAdministrator, isModerator, staff } from '@/access/roles'
import { metaFields, slugField } from '@/fields/meta'
import { PAYLOAD_DATETIME_FORMAT, PAYLOAD_TIME_FORMAT } from '@/lib/format-date'

export const Posts: CollectionConfig = {
  slug: 'posts',
  labels: {
    singular: 'Wpis',
    plural: 'Wpisy',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'publishedAt', 'updatedAt'],
    group: 'Treści',
    description: 'Wpisy na blog.',
  },
  versions: {
    drafts: true,
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
          displayFormat: PAYLOAD_DATETIME_FORMAT,
          timeFormat: PAYLOAD_TIME_FORMAT,
        },
      },
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      label: 'Autor',
      admin: {
        position: 'sidebar',
      },
    },
    metaFields,
  ],
}
