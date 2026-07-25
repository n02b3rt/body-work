import type { CollectionConfig } from 'payload'

import { isAdministrator, isModerator, staff } from '@/access/roles'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: 'Plik mediów',
    plural: 'Media',
  },
  admin: {
    group: 'Treści',
    description: 'Biblioteka mediów — odpowiednik „Mediów” w WordPressie.',
    defaultColumns: ['filename', 'alt', 'updatedAt'],
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
      name: 'alt',
      type: 'text',
      label: 'Tekst alternatywny',
      required: true,
      admin: {
        description: 'Krótki opis obrazu (dostępność i SEO).',
      },
    },
  ],
  upload: true,
}
