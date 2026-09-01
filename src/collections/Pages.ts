import type { CollectionConfig } from 'payload'
import {
  createBreadcrumbsField,
  createParentField,
} from '@payloadcms/plugin-nested-docs'

import { staff } from '@/access/roles'
import { builderField, componentRefsField } from '@/fields/builder'
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
    description: 'Struktura witryny: strony można zagnieżdżać (rodzic → dziecko).',
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
    delete: staff,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Tytuł',
      required: true,
    },
    slugField('title'),
    builderField(),
    componentRefsField(),
    {
      // Unnamed tab: presentation only, adds no column and no path segment.
      type: 'tabs',
      tabs: [
        {
          label: 'SEO',
          fields: [metaFields],
        },
      ],
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
  ],
}
