import type { CollectionConfig } from 'payload'

import { isAdministrator, isModerator, staff } from '@/access/roles'
import {
  COMPONENT_TYPE_OPTIONS,
  componentSettingsGroups,
} from '@/fields/component-settings'
import { slugField } from '@/fields/meta'

export const SiteComponents: CollectionConfig = {
  slug: 'site-components',
  labels: {
    singular: 'Komponent',
    plural: 'Komponenty',
  },
  admin: {
    group: 'Wygląd',
    useAsTitle: 'name',
    defaultColumns: ['name', 'type', 'slug', 'updatedAt'],
    listSearchableFields: ['name', 'slug', 'description'],
    description:
      'Gotowe bloki (przyciski, hero, karuzele, galerie) z własnymi parametrami: do wstawiania na stronach.',
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
      label: 'Nazwa',
      required: true,
      admin: {
        description: 'Nazwa robocza widoczna tylko w panelu.',
      },
    },
    {
      name: 'type',
      type: 'select',
      label: 'Typ komponentu',
      required: true,
      index: true,
      defaultValue: 'button',
      options: COMPONENT_TYPE_OPTIONS,
      admin: {
        description: 'Typ decyduje o dostępnych parametrach poniżej.',
      },
    },
    {
      name: 'preview',
      type: 'ui',
      admin: {
        components: {
          Field: '/components/admin/appearance/ComponentPreview#ComponentPreview',
        },
      },
    },
    ...componentSettingsGroups,
    slugField('name', {
      description: 'Identyfikator używany przy wstawianiu komponentu na stronę.',
    }),
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
