import type { CollectionConfig } from 'payload'
import {
  createBreadcrumbsField,
  createParentField,
} from '@payloadcms/plugin-nested-docs'

import { isAdministrator, isModerator, staff } from '@/access/roles'
import { metaFields, slugField } from '@/fields/meta'

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: {
    singular: 'Strona',
    plural: 'Strony',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'updatedAt'],
    group: 'Treści',
    description: 'Struktura witryny — strony można zagnieżdżać (rodzic → dziecko).',
    components: {
      beforeListTable: ['/components/admin/PagesTree#PagesTree'],
    },
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
      name: 'content',
      type: 'richText',
      label: 'Treść',
    },
    createParentField('pages', {
      label: 'Strona nadrzędna',
      admin: {
        position: 'sidebar',
        description: 'Ustaw, aby umieścić stronę w drzewie pod inną stroną.',
      },
    }),
    createBreadcrumbsField('pages', {
      label: 'Ścieżka',
      admin: {
        position: 'sidebar',
      },
    }),
    metaFields,
  ],
}
