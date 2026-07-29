import type { CollectionConfig } from 'payload'

import { staff } from '@/access/roles'
import { slugField } from '@/fields/meta'

/**
 * Blog categories.
 *
 * A collection rather than a `select` field with four hardcoded options: the reference
 * has exactly four today (Fizjoterapia, Masaż, Trening, Dietetyka) and its posts can
 * carry more than one, but the point of moving to a CMS is that the client can add a
 * fifth without a deploy.
 */
export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: {
    singular: 'Kategoria',
    plural: 'Kategorie',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'updatedAt'],
    group: 'Treści',
    description: 'Kategorie wpisów na blogu.',
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
      label: 'Nazwa',
      required: true,
    },
    slugField('title'),
  ],
}
