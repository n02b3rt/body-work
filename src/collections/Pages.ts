import type { CollectionConfig } from 'payload'
import {
  createBreadcrumbsField,
  createParentField,
} from '@payloadcms/plugin-nested-docs'

import { staff } from '@/access/roles'
import { metaFields, slugField } from '@/fields/meta'
import { pageLayoutField } from '@/fields/page-layout'

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
    {
      // Unnamed tabs: presentation only, so this adds no columns and the
      // existing `content` field keeps its path.
      type: 'tabs',
      tabs: [
        {
          label: 'Układ strony',
          description:
            'Kreator stron: ułóż stronę z komponentów zdefiniowanych w Zarządzanie → Wygląd → Komponenty.',
          fields: [pageLayoutField],
        },
        {
          label: 'Treść tekstowa',
          description:
            'Zwykły tekst pod sekcjami. Zostaw puste, jeśli cała strona jest zbudowana w kreatorze.',
          fields: [
            {
              name: 'content',
              type: 'richText',
              label: 'Treść',
            },
          ],
        },
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
