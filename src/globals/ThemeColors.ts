import type { Field, GlobalConfig, TabsField } from 'payload'

import { administrators, staff } from '@/access/roles'
import { normalizeHexColor, THEME_TOKEN_GROUPS } from '@/lib/theme-tokens'

/** One colour token → a text field rendered with the custom colour picker. */
function colorField(token: {
  name: string
  label: string
  cssVar: string
  defaultValue: string
  description?: string
}): Field {
  return {
    name: token.name,
    type: 'text',
    label: token.label,
    defaultValue: token.defaultValue,
    validate: (value: unknown) => {
      if (value === undefined || value === null || value === '') return true
      if (normalizeHexColor(value)) return true
      return 'Podaj kolor w formacie HEX, np. #0f766e.'
    },
    admin: {
      description: token.description
        ? `${token.description} Zmienna CSS: ${token.cssVar}`
        : `Zmienna CSS: ${token.cssVar}`,
      components: {
        Field: '/components/admin/appearance/ColorField#ColorField',
      },
    },
  }
}

const paletteTabs: TabsField['tabs'] = THEME_TOKEN_GROUPS.map((group) => ({
  name: group.name,
  label: group.label,
  description: group.description,
  fields: group.tokens.map(colorField),
}))

export const ThemeColors: GlobalConfig = {
  slug: 'theme-colors',
  label: 'Schemat kolorów',
  admin: {
    group: 'Wygląd',
    description:
      'Paleta motywu stosowana na całej stronie. Kolory trafiają na front jako zmienne CSS (--bw-*).',
  },
  access: {
    read: () => true,
    update: administrators,
    readVersions: staff,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Presety i podgląd',
          description:
            'Zacznij od gotowej palety, a potem dostrój pojedyncze kolory w kolejnych zakładkach.',
          fields: [
            {
              name: 'presetPicker',
              type: 'ui',
              admin: {
                components: {
                  Field: '/components/admin/appearance/ThemePresets#ThemePresets',
                },
              },
            },
            {
              name: 'palettePreview',
              type: 'ui',
              admin: {
                components: {
                  Field: '/components/admin/appearance/ThemePreview#ThemePreview',
                },
              },
            },
          ],
        },
        ...paletteTabs,
      ],
    },
  ],
}
