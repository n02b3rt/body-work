import type { CollectionConfig } from 'payload'

import { isAdministrator, isModerator, staff } from '@/access/roles'
import { slugField } from '@/fields/meta'

/**
 * Blog post authors.
 *
 * Separate from `Users` on purpose: the reference has 18 authors, and they are the
 * centre's trainers and physiotherapists: people whose name and photo appear on an
 * article, not people who need to log into the CMS. Tying authorship to `Users` would
 * mean creating an account (and a login) for each of them just to attribute a post.
 * A `user` relationship is available for the ones who do also write in the panel.
 */
export const Authors: CollectionConfig = {
  slug: 'authors',
  labels: {
    singular: 'Autor',
    plural: 'Autorzy',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'role', 'updatedAt'],
    group: 'Treści',
    description: 'Autorzy wpisów na blogu, imię, nazwisko, zdjęcie i krótki opis.',
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
      name: 'name',
      type: 'text',
      label: 'Imię i nazwisko',
      required: true,
    },
    slugField('name'),
    {
      name: 'role',
      type: 'text',
      label: 'Rola / specjalizacja',
      admin: {
        description: 'Np. „Fizjoterapeuta", „Trener przygotowania motorycznego".',
      },
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      label: 'Zdjęcie',
    },
    {
      name: 'bio',
      type: 'textarea',
      label: 'Krótki opis',
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      label: 'Powiązane konto',
      admin: {
        position: 'sidebar',
        description: 'Opcjonalnie: tylko jeśli ten autor ma też konto w panelu.',
      },
    },
  ],
}
