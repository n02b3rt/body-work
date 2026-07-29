import type { CollectionConfig } from 'payload'

import {
  administrators,
  administratorsField,
  isAdministrator,
  isStaff,
} from '@/access/roles'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: 'Użytkownik',
    plural: 'Użytkownicy',
  },
  admin: {
    useAsTitle: 'username',
    defaultColumns: ['username', 'email', 'role', 'firstName', 'lastName', 'updatedAt'],
    group: 'Ustawienia',
    description: 'Konta zespołu i klientów.',
  },
  auth: {
    loginWithUsername: {
      allowEmailLogin: true,
      requireEmail: true,
      requireUsername: true,
    },
  },
  access: {
    admin: ({ req: { user } }) => isStaff(user),
    create: administrators,
    read: ({ req: { user } }) => {
      if (!user) return false
      if (isAdministrator(user)) return true
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
      name: 'firstName',
      type: 'text',
      label: 'Imię',
    },
    {
      name: 'lastName',
      type: 'text',
      label: 'Nazwisko',
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
        { label: 'Edytor', value: 'edytor' },
        { label: 'Klient', value: 'klient' },
      ],
      access: {
        create: administratorsField,
        update: administratorsField,
      },
    },
    {
      name: 'userFormEnhancements',
      type: 'ui',
      admin: {
        disableListColumn: true,
        components: {
          Field: '/components/admin/users/UserFormEnhancements#UserFormEnhancements',
        },
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, req, operation }) => {
        if (operation === 'create' && !req.user) {
          return { ...data, role: 'administrator' }
        }
        if (operation === 'create' && req.user && !isAdministrator(req.user)) {
          return { ...data, role: 'klient' }
        }
        return data
      },
    ],
  },
}
