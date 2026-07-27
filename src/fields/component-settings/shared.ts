/**
 * Reusable parameter fields for `site-components`.
 * Colour parameters point at theme tokens by default, so components follow the
 * "Schemat kolorów" palette unless an editor deliberately overrides them.
 */

import type { Field, GroupField, SelectField } from 'payload'

import { normalizeHexColor, THEME_COLOR_OPTIONS } from '@/lib/theme-tokens'

/** Colour parameter: palette token, or a custom HEX when `token = custom`. */
export function colorChoice(
  name: string,
  label: string,
  defaultToken: string,
  description?: string,
): GroupField {
  return {
    name,
    type: 'group',
    label,
    admin: { description },
    fields: [
      {
        type: 'row',
        fields: [
          {
            name: 'token',
            type: 'select',
            label: 'Kolor z palety',
            defaultValue: defaultToken,
            options: [
              ...THEME_COLOR_OPTIONS,
              { label: 'Własny (HEX)', value: 'custom' },
              { label: 'Brak / przezroczysty', value: 'none' },
            ],
            admin: { width: '60%' },
          },
          {
            name: 'custom',
            type: 'text',
            label: 'Własny kolor',
            validate: (value: unknown, { siblingData }: { siblingData?: unknown }) => {
              const token = (siblingData as { token?: string } | undefined)?.token
              if (token !== 'custom') return true
              if (normalizeHexColor(value)) return true
              return 'Podaj kolor w formacie HEX, np. #0f766e.'
            },
            admin: {
              width: '40%',
              condition: (_: unknown, siblingData: { token?: string }) =>
                siblingData?.token === 'custom',
              components: {
                Field: '/components/admin/appearance/ColorField#ColorField',
              },
            },
          },
        ],
      },
    ],
  }
}

function select(
  name: string,
  label: string,
  defaultValue: string,
  options: { label: string; value: string }[],
  width?: string,
): SelectField {
  return {
    name,
    type: 'select',
    label,
    defaultValue,
    options,
    admin: width ? { width } : undefined,
  }
}

export function radiusField(defaultValue: keyof typeof radiusOptions = 'md'): SelectField {
  return select(
    'radius',
    'Zaokrąglenie',
    defaultValue,
    Object.entries(radiusOptions).map(([value, label]) => ({ label, value })),
    '50%',
  )
}

const radiusOptions = {
  none: 'Brak (kant)',
  sm: 'Małe',
  md: 'Średnie',
  lg: 'Duże',
  full: 'Pełne (pigułka)',
} as const

export function alignField(name = 'align', defaultValue = 'left'): SelectField {
  return select(
    name,
    'Wyrównanie',
    defaultValue,
    [
      { label: 'Do lewej', value: 'left' },
      { label: 'Wyśrodkowane', value: 'center' },
      { label: 'Do prawej', value: 'right' },
    ],
    '50%',
  )
}

export function gapField(defaultValue = 'md'): SelectField {
  return select(
    'gap',
    'Odstępy',
    defaultValue,
    [
      { label: 'Brak', value: 'none' },
      { label: 'Małe', value: 'sm' },
      { label: 'Średnie', value: 'md' },
      { label: 'Duże', value: 'lg' },
    ],
    '50%',
  )
}

export function aspectRatioField(defaultValue = '16-9'): SelectField {
  return select(
    'aspectRatio',
    'Proporcje kadru',
    defaultValue,
    [
      { label: '16:9 (panorama)', value: '16-9' },
      { label: '21:9 (bardzo szeroki)', value: '21-9' },
      { label: '4:3 (klasyczny)', value: '4-3' },
      { label: '1:1 (kwadrat)', value: '1-1' },
      { label: '3:4 (pionowy)', value: '3-4' },
    ],
    '50%',
  )
}

export function columnsField(defaultValue = '3'): SelectField {
  return select(
    'columns',
    'Kolumny',
    defaultValue,
    [
      { label: '1', value: '1' },
      { label: '2', value: '2' },
      { label: '3', value: '3' },
      { label: '4', value: '4' },
    ],
    '50%',
  )
}

/** Link target shared by buttons and CTA sections. */
export const linkFields: Field[] = [
  {
    type: 'row',
    fields: [
      {
        name: 'href',
        type: 'text',
        label: 'Adres (URL lub /sciezka)',
        admin: { width: '70%' },
      },
      {
        name: 'newTab',
        type: 'checkbox',
        label: 'Otwórz w nowej karcie',
        defaultValue: false,
        admin: { width: '30%' },
      },
    ],
  },
]
