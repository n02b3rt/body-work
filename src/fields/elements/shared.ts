/**
 * Reusable parameter fields for page-builder elements.
 *
 * Moved here from `component-settings/shared.ts` when components stopped being
 * documents with a type and became a block library. Colour parameters still
 * default to a palette token, so an element follows "Schemat kolorów" unless an
 * editor deliberately overrides it.
 */

import type { Field, GroupField, SelectField } from 'payload'

import { ELEMENT_ICONS } from '@/lib/element-icons'
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

export function select(
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

const radiusOptions = {
  none: 'Brak (kant)',
  sm: 'Małe',
  md: 'Średnie',
  lg: 'Duże',
  xl: 'Bardzo duże',
  full: 'Pełne (pigułka)',
} as const

export function radiusField(defaultValue: keyof typeof radiusOptions = 'md'): SelectField {
  return select(
    'radius',
    'Zaokrąglenie',
    defaultValue,
    Object.entries(radiusOptions).map(([value, label]) => ({ label, value })),
    '50%',
  )
}

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

export function gapField(defaultValue = 'md', label = 'Odstępy'): SelectField {
  return select(
    'gap',
    label,
    defaultValue,
    [
      { label: 'Brak', value: 'none' },
      { label: 'Bardzo małe', value: 'xs' },
      { label: 'Małe', value: 'sm' },
      { label: 'Średnie', value: 'md' },
      { label: 'Duże', value: 'lg' },
      { label: 'Bardzo duże', value: 'xl' },
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
      { label: 'Oryginalne (bez kadrowania)', value: 'auto' },
      { label: '16:9 (panorama)', value: '16-9' },
      { label: '21:9 (bardzo szeroki)', value: '21-9' },
      { label: '4:3 (klasyczny)', value: '4-3' },
      { label: '1:1 (kwadrat)', value: '1-1' },
      { label: '3:4 (pionowy)', value: '3-4' },
    ],
    '50%',
  )
}

export function columnsField(defaultValue = '3', label = 'Kolumny'): SelectField {
  return select(
    'columns',
    label,
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

export function iconField(name = 'icon', defaultValue = 'check'): SelectField {
  return select(
    name,
    'Ikona',
    defaultValue,
    ELEMENT_ICONS.map(({ label, value }) => ({ label, value })),
    '50%',
  )
}

/** Link target shared by buttons, cards and slides. */
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

/**
 * One button, as an array row.
 *
 * Buttons used to be their own document type so a hero could point at one. With
 * elements they are just a widget, and a button that has to be identical in ten
 * places is a saved composition like any other.
 */
export const buttonItemFields: Field[] = [
  {
    type: 'row',
    fields: [
      {
        name: 'label',
        type: 'text',
        label: 'Napis',
        defaultValue: 'Umów wizytę',
        admin: { width: '60%' },
      },
      select(
        'variant',
        'Styl',
        'solid',
        [
          { label: 'Wypełniony', value: 'solid' },
          { label: 'Obrys', value: 'outline' },
          { label: 'Sam tekst', value: 'link' },
        ],
        '40%',
      ),
    ],
  },
  ...linkFields,
  {
    type: 'row',
    fields: [
      select(
        'size',
        'Wielkość',
        'md',
        [
          { label: 'Mała', value: 'sm' },
          { label: 'Średnia', value: 'md' },
          { label: 'Duża', value: 'lg' },
        ],
        '50%',
      ),
      radiusField('full'),
    ],
  },
  colorChoice('background', 'Kolor tła', 'brand.primary'),
  colorChoice('textColor', 'Kolor napisu', 'text.inverted'),
  colorChoice('borderColor', 'Kolor obrysu', 'none'),
  {
    name: 'fullWidth',
    type: 'checkbox',
    label: 'Na całą szerokość',
    defaultValue: false,
  },
]
