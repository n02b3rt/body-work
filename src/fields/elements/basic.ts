/**
 * The everyday elements: text, pictures, buttons, spacing.
 *
 * Every definition is a factory. The same block appears in three places (a
 * page's sections, a saved composition, and inside a column), and Payload
 * sanitizes field configs in place.
 */

import type { Block } from 'payload'

import {
  alignField,
  aspectRatioField,
  buttonItemFields,
  colorChoice,
  columnsField,
  gapField,
  iconField,
  linkFields,
  radiusField,
  select,
} from './shared'
import { elementStyleField } from './style'

export function headingBlock(): Block {
  return {
    slug: 'heading',
    dbName: ({ tableName }) => `${tableName}_b_head`,
    labels: { singular: 'Nagłówek', plural: 'Nagłówki' },
    fields: [
      {
        name: 'text',
        type: 'textarea',
        label: 'Treść nagłówka',
        defaultValue: 'Nagłówek sekcji',
      },
      {
        type: 'row',
        fields: [
          select(
            'level',
            'Poziom (SEO)',
            'h2',
            ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].map((value) => ({
              label: value.toUpperCase(),
              value,
            })),
            '50%',
          ),
          select(
            'size',
            'Wielkość liter',
            'lg',
            [
              { label: 'Mała', value: 'sm' },
              { label: 'Średnia', value: 'md' },
              { label: 'Duża', value: 'lg' },
              { label: 'Bardzo duża', value: 'xl' },
            ],
            '50%',
          ),
        ],
      },
      colorChoice('color', 'Kolor', 'text.heading'),
      elementStyleField(),
    ],
  }
}

export function textBlock(): Block {
  return {
    slug: 'text',
    dbName: ({ tableName }) => `${tableName}_b_txt`,
    labels: { singular: 'Tekst', plural: 'Bloki tekstu' },
    fields: [
      {
        name: 'content',
        type: 'richText',
        label: 'Treść',
      },
      {
        name: 'measure',
        type: 'checkbox',
        label: 'Ogranicz długość wiersza',
        defaultValue: false,
        admin: {
          description: 'Trzyma tekst przy ~68 znakach w wierszu, czyli w wygodnej do czytania kolumnie.',
        },
      },
      elementStyleField(),
    ],
  }
}

export function imageBlock(): Block {
  return {
    slug: 'image',
    dbName: ({ tableName }) => `${tableName}_b_img`,
    labels: { singular: 'Zdjęcie', plural: 'Zdjęcia' },
    fields: [
      {
        name: 'image',
        type: 'upload',
        relationTo: 'media',
        label: 'Plik',
      },
      {
        name: 'caption',
        type: 'text',
        label: 'Podpis',
      },
      {
        type: 'row',
        fields: [aspectRatioField('auto'), radiusField('none')],
      },
      {
        type: 'row',
        fields: [
          select(
            'fit',
            'Dopasowanie kadru',
            'cover',
            [
              { label: 'Wypełnij kadr', value: 'cover' },
              { label: 'Zmieść całe zdjęcie', value: 'contain' },
            ],
            '50%',
          ),
        ],
      },
      ...linkFields,
      elementStyleField(),
    ],
  }
}

export function buttonsBlock(): Block {
  return {
    slug: 'buttons',
    dbName: ({ tableName }) => `${tableName}_b_btn`,
    labels: { singular: 'Przyciski', plural: 'Grupy przycisków' },
    fields: [
      {
        name: 'items',
        type: 'array',
        label: 'Przyciski',
        labels: { singular: 'Przycisk', plural: 'Przyciski' },
        dbName: ({ tableName }) => `${tableName}_btn`,
        defaultValue: [{ label: 'Umów wizytę' }],
        fields: buttonItemFields,
      },
      {
        type: 'row',
        fields: [gapField('sm'), alignField('align', 'left')],
      },
      elementStyleField(),
    ],
  }
}

export function iconListBlock(): Block {
  return {
    slug: 'iconList',
    dbName: ({ tableName }) => `${tableName}_b_icl`,
    labels: { singular: 'Lista z ikonami', plural: 'Listy z ikonami' },
    fields: [
      {
        name: 'items',
        type: 'array',
        label: 'Pozycje',
        labels: { singular: 'Pozycja', plural: 'Pozycje' },
        fields: [
          {
            type: 'row',
            fields: [iconField('icon', 'check')],
          },
          {
            name: 'text',
            type: 'text',
            label: 'Tekst',
          },
          ...linkFields,
        ],
      },
      {
        type: 'row',
        fields: [columnsField('1'), gapField('sm')],
      },
      colorChoice('iconColor', 'Kolor ikon', 'brand.primary'),
      elementStyleField(),
    ],
  }
}

export function dividerBlock(): Block {
  return {
    slug: 'divider',
    dbName: ({ tableName }) => `${tableName}_b_div`,
    labels: { singular: 'Separator', plural: 'Separatory' },
    fields: [
      {
        type: 'row',
        fields: [
          {
            name: 'thickness',
            type: 'number',
            label: 'Grubość (px)',
            defaultValue: 1,
            min: 1,
            max: 20,
            admin: { width: '50%' },
          },
          {
            name: 'widthPercent',
            type: 'number',
            label: 'Szerokość (%)',
            defaultValue: 100,
            min: 5,
            max: 100,
            admin: { width: '50%' },
          },
        ],
      },
      {
        type: 'row',
        fields: [
          select(
            'lineStyle',
            'Rodzaj linii',
            'solid',
            [
              { label: 'Ciągła', value: 'solid' },
              { label: 'Kreskowana', value: 'dashed' },
              { label: 'Kropkowana', value: 'dotted' },
            ],
            '50%',
          ),
        ],
      },
      colorChoice('color', 'Kolor', 'surface.border'),
      elementStyleField(),
    ],
  }
}

export function spacerBlock(): Block {
  return {
    slug: 'spacer',
    dbName: ({ tableName }) => `${tableName}_b_spc`,
    labels: { singular: 'Odstęp', plural: 'Odstępy' },
    fields: [
      {
        type: 'row',
        fields: [
          {
            name: 'height',
            type: 'number',
            label: 'Wysokość (px)',
            defaultValue: 48,
            min: 0,
            max: 400,
            admin: { width: '50%', step: 8 },
          },
          {
            name: 'heightMobile',
            type: 'number',
            label: 'Wysokość na telefonie (px)',
            min: 0,
            max: 400,
            admin: {
              width: '50%',
              step: 8,
              description: 'Zostaw puste, aby użyć tej samej wartości.',
            },
          },
        ],
      },
      elementStyleField(),
    ],
  }
}
