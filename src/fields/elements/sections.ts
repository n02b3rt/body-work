/**
 * Ready-made section elements: hero, CTA band, feature cards, accordion.
 *
 * These used to be whole document types. They stay in the library because they
 * are what an editor reaches for first — a saved composition is for the layouts
 * this set does not cover.
 */

import type { Block } from 'payload'

import {
  alignField,
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

export function heroBlock(): Block {
  return {
    slug: 'hero',
    dbName: ({ tableName }) => `${tableName}_b_hero`,
    labels: { singular: 'Hero', plural: 'Sekcje hero' },
    fields: [
      {
        name: 'image',
        type: 'upload',
        relationTo: 'media',
        label: 'Zdjęcie tła',
      },
      {
        name: 'heading',
        type: 'text',
        label: 'Nagłówek',
        defaultValue: 'Wróć do formy z BodyWork Centrum',
      },
      {
        name: 'subheading',
        type: 'textarea',
        label: 'Podtytuł',
      },
      {
        type: 'row',
        fields: [
          select(
            'height',
            'Wysokość',
            'lg',
            [
              { label: 'Niska', value: 'sm' },
              { label: 'Średnia', value: 'md' },
              { label: 'Wysoka', value: 'lg' },
              { label: 'Pełny ekran', value: 'screen' },
            ],
            '50%',
          ),
          alignField('align', 'center'),
        ],
      },
      {
        type: 'row',
        fields: [
          {
            name: 'overlayOpacity',
            type: 'number',
            label: 'Przyciemnienie zdjęcia (%)',
            defaultValue: 45,
            min: 0,
            max: 100,
            admin: {
              width: '50%',
              description: 'Kolor nakładki pochodzi z palety (Tła → Przyciemnienie zdjęć).',
            },
          },
          radiusField('md'),
        ],
      },
      colorChoice('textColor', 'Kolor tekstu', 'text.inverted'),
      {
        name: 'buttons',
        type: 'array',
        label: 'Przyciski',
        labels: { singular: 'Przycisk', plural: 'Przyciski' },
        dbName: ({ tableName }) => `${tableName}_btn`,
        fields: buttonItemFields,
      },
      elementStyleField(),
    ],
  }
}

export function ctaBlock(): Block {
  return {
    slug: 'cta',
    dbName: ({ tableName }) => `${tableName}_b_cta`,
    labels: { singular: 'Pasek CTA', plural: 'Paski CTA' },
    fields: [
      {
        name: 'heading',
        type: 'text',
        label: 'Nagłówek',
        defaultValue: 'Umów bezpłatną konsultację',
      },
      {
        name: 'text',
        type: 'textarea',
        label: 'Tekst',
      },
      {
        name: 'buttons',
        type: 'array',
        label: 'Przyciski',
        labels: { singular: 'Przycisk', plural: 'Przyciski' },
        dbName: ({ tableName }) => `${tableName}_btn`,
        fields: buttonItemFields,
      },
      {
        type: 'row',
        fields: [
          alignField('align', 'center'),
          select(
            'padding',
            'Wysokość paska',
            'md',
            [
              { label: 'Niski', value: 'sm' },
              { label: 'Średni', value: 'md' },
              { label: 'Wysoki', value: 'lg' },
            ],
            '50%',
          ),
        ],
      },
      colorChoice('background', 'Tło paska', 'brand.secondary'),
      colorChoice('textColor', 'Kolor tekstu', 'text.inverted'),
      radiusField('lg'),
      elementStyleField(),
    ],
  }
}

export function featuresBlock(): Block {
  return {
    slug: 'features',
    dbName: ({ tableName }) => `${tableName}_b_feat`,
    labels: { singular: 'Karty', plural: 'Zestawy kart' },
    fields: [
      {
        name: 'items',
        type: 'array',
        label: 'Karty',
        labels: { singular: 'Karta', plural: 'Karty' },
        admin: {
          components: {
            RowLabel: '/components/admin/appearance/CardRowLabel#CardRowLabel',
          },
        },
        fields: [
          {
            name: 'title',
            type: 'text',
            label: 'Tytuł',
          },
          {
            name: 'text',
            type: 'textarea',
            label: 'Opis',
          },
          {
            type: 'row',
            fields: [iconField('icon', 'none')],
          },
          {
            name: 'image',
            type: 'upload',
            relationTo: 'media',
            label: 'Obrazek (zamiast ikony)',
          },
          ...linkFields,
        ],
      },
      {
        type: 'row',
        fields: [columnsField('3'), gapField('md')],
      },
      {
        type: 'row',
        fields: [alignField('cardAlign', 'left'), radiusField('md')],
      },
      colorChoice('cardBackground', 'Tło karty', 'surface.surface'),
      colorChoice('cardBorder', 'Obramowanie karty', 'surface.border'),
      colorChoice('titleColor', 'Kolor tytułu', 'text.heading'),
      colorChoice('iconColor', 'Kolor ikony', 'brand.primary'),
      elementStyleField(),
    ],
  }
}

export function accordionBlock(): Block {
  return {
    slug: 'accordion',
    dbName: ({ tableName }) => `${tableName}_b_acc`,
    labels: { singular: 'Rozwijana lista', plural: 'Rozwijane listy' },
    fields: [
      {
        name: 'items',
        type: 'array',
        label: 'Pozycje',
        labels: { singular: 'Pozycja', plural: 'Pozycje' },
        fields: [
          {
            name: 'title',
            type: 'text',
            label: 'Pytanie / tytuł',
          },
          {
            name: 'content',
            type: 'richText',
            label: 'Odpowiedź',
          },
        ],
      },
      {
        type: 'row',
        fields: [
          {
            name: 'allowMultiple',
            type: 'checkbox',
            label: 'Można rozwinąć kilka naraz',
            defaultValue: false,
            admin: { width: '50%' },
          },
          {
            name: 'openFirst',
            type: 'checkbox',
            label: 'Pierwsza pozycja rozwinięta',
            defaultValue: false,
            admin: { width: '50%' },
          },
        ],
      },
      radiusField('md'),
      colorChoice('titleColor', 'Kolor tytułów', 'text.heading'),
      colorChoice('borderColor', 'Kolor linii', 'surface.border'),
      elementStyleField(),
    ],
  }
}
