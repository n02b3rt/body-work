import type { CollectionConfig } from 'payload'

import { staff } from '@/access/roles'
import { builderField } from '@/fields/builder'
import { slugField } from '@/fields/meta'

/**
 * Saved compositions — an editor's own building blocks.
 *
 * This collection used to hold *the* components: one document per configured
 * hero, button or gallery, with a `type` select deciding which parameter group
 * showed. That job moved into the element library, where a widget is configured
 * where it is placed.
 *
 * What is left is the thing the library cannot express: "a two-column row with
 * a photograph on the left and a heading, a paragraph and a button on the
 * right", saved under a name and dropped into any page as one item. Pages
 * reference it (the `savedComponent` element), so editing it here updates every
 * page that uses it.
 */
export const SiteComponents: CollectionConfig = {
  slug: 'site-components',
  labels: {
    singular: 'Komponent',
    plural: 'Komponenty',
  },
  // Kept from the previous builder for schema stability (renaming it now is a table
  // rename with no benefit): the constraint that named it, Postgres' 63-character
  // identifier cap on deeply nested block tables, no longer applies now that a
  // composition is one `jsonb` column instead of a tree of block tables.
  dbName: 'components',
  admin: {
    group: 'Wygląd',
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'slug', 'updatedAt'],
    listSearchableFields: ['name', 'slug', 'description'],
    description:
      'Własne złożenia elementów (sekcje, karty, bannery) do wstawiania w kreatorze stron i wpisów.',
  },
  access: {
    read: () => true,
    create: staff,
    update: staff,
    delete: staff,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Nazwa',
      required: true,
      admin: {
        description: 'Pod tą nazwą komponent pojawi się w bibliotece kreatora.',
      },
    },
    {
      name: 'category',
      type: 'select',
      label: 'Kategoria',
      defaultValue: 'section',
      index: true,
      options: [
        { label: 'Sekcja', value: 'section' },
        { label: 'Nagłówek strony', value: 'header' },
        { label: 'Karta / kafelek', value: 'card' },
        { label: 'Wezwanie do działania', value: 'cta' },
        { label: 'Inne', value: 'other' },
      ],
      admin: {
        description: 'Porządkuje listę w bibliotece kreatora.',
      },
    },
    builderField(),
    slugField('name', {
      description: 'Identyfikator komponentu, przydatny przy odwołaniach.',
    }),
    {
      name: 'preview',
      type: 'upload',
      relationTo: 'media',
      label: 'Miniatura',
      admin: {
        position: 'sidebar',
        description: 'Podgląd w bibliotece kreatora. Generowana automatycznie przy zapisie w edytorze; można nadpisać ręcznie.',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Notatka',
      admin: {
        position: 'sidebar',
        description: 'Gdzie i po co ten komponent jest używany.',
      },
    },
  ],
}
