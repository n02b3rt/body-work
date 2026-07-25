import type { CollectionConfig } from 'payload'

import {
  administrators,
  administratorsField,
  canAccessAdmin,
  isAdministrator,
  isModerator,
} from '@/access/roles'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: 'Użytkownik',
    plural: 'Użytkownicy',
  },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['name', 'email', 'role', 'updatedAt'],
    group: 'Ustawienia',
    description: 'Konta zespołu i klientów — podobnie jak użytkownicy w WordPressie.',
  },
  auth: true,
  access: {
    admin: canAccessAdmin,
    create: administrators,
    read: ({ req: { user } }) => {
      if (!user) return false
      if (isAdministrator(user) || isModerator(user)) return true
      return { id: { equals: user.id } }
    },
    update: ({ req: { user } }) => {
      if (!user) return false
      if (isAdministrator(user)) return true
      return { id: { equals: user.id } }
    },
    delete: administrators,
    unlock: administrators,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Nazwa wyświetlana',
      admin: {
        description: 'Imię i nazwisko lub nazwa widoczna w panelu (jak „Wyświetlana nazwa” w WP).',
      },
    },
    {
      name: 'role',
      type: 'select',
      label: 'Rola',
      required: true,
      defaultValue: 'klient',
      saveToJWT: true,
      options: [
        { label: 'Administrator', value: 'administrator' },
        { label: 'Moderator', value: 'moderator' },
        { label: 'Redaktor', value: 'redaktor' },
        { label: 'Klient', value: 'klient' },
      ],
      access: {
        create: administratorsField,
        update: administratorsField,
      },
      admin: {
        description:
          'Administrator — pełny dostęp. Moderator — treści i podgląd użytkowników. Redaktor — treści. Klient — bez panelu.',
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, req, operation }) => {
        // First user (create-first-user) becomes administrator.
        if (operation === 'create' && !req.user) {
          return { ...data, role: 'administrator' }
        }
        // Non-admins cannot create privileged accounts.
        if (operation === 'create' && req.user && !isAdministrator(req.user)) {
          return { ...data, role: 'klient' }
        }
        return data
      },
    ],
  },
}
