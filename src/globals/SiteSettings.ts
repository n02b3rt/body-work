import type { GlobalConfig } from 'payload'

import { administrators } from '@/access/roles'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Ustawienia witryny',
  admin: {
    group: 'Ustawienia',
    description: 'Tożsamość marki, dane kontaktowe i domyślne SEO.',
  },
  access: {
    read: () => true,
    update: administrators,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Tożsamość',
          fields: [
            {
              name: 'siteName',
              type: 'text',
              label: 'Nazwa witryny',
              required: true,
              defaultValue: 'BodyWork Centrum',
            },
            {
              name: 'tagline',
              type: 'text',
              label: 'Hasło / slogan',
            },
            {
              name: 'logo',
              type: 'upload',
              relationTo: 'media',
              label: 'Logo',
            },
            {
              name: 'favicon',
              type: 'upload',
              relationTo: 'media',
              label: 'Favicon',
            },
          ],
        },
        {
          label: 'Kontakt',
          fields: [
            {
              name: 'email',
              type: 'email',
              label: 'E-mail',
            },
            {
              name: 'phone',
              type: 'text',
              label: 'Telefon',
            },
            {
              name: 'address',
              type: 'textarea',
              label: 'Adres',
            },
          ],
        },
        {
          label: 'SEO domyślne',
          fields: [
            {
              name: 'defaultMetaTitle',
              type: 'text',
              label: 'Domyślny tytuł SEO',
            },
            {
              name: 'defaultMetaDescription',
              type: 'textarea',
              label: 'Domyślny opis SEO',
            },
            {
              name: 'defaultOgImage',
              type: 'upload',
              relationTo: 'media',
              label: 'Domyślny obraz OG',
            },
          ],
        },
      ],
    },
  ],
}
