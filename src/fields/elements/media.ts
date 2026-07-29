/**
 * Picture-heavy elements: gallery, carousel, video.
 *
 * The gallery and carousel parameters are carried over from the old
 * `site-components` types, so galleries built before the rewrite read the same.
 */

import type { Block } from 'payload'

import {
  aspectRatioField,
  columnsField,
  gapField,
  linkFields,
  radiusField,
  select,
} from './shared'
import { elementStyleField } from './style'

export function galleryBlock(): Block {
  return {
    slug: 'gallery',
    dbName: ({ tableName }) => `${tableName}_b_gal`,
    labels: { singular: 'Galeria', plural: 'Galerie' },
    fields: [
      {
        name: 'images',
        type: 'upload',
        relationTo: 'media',
        hasMany: true,
        label: 'Zdjęcia',
      },
      {
        type: 'row',
        fields: [columnsField('3'), gapField('md')],
      },
      {
        type: 'row',
        fields: [aspectRatioField('1-1'), radiusField('md')],
      },
      {
        type: 'row',
        fields: [
          {
            name: 'lightbox',
            type: 'checkbox',
            label: 'Powiększanie po kliknięciu',
            defaultValue: true,
            admin: { width: '50%' },
          },
          {
            name: 'showCaptions',
            type: 'checkbox',
            label: 'Pokaż podpisy',
            defaultValue: false,
            admin: { width: '50%' },
          },
        ],
      },
      elementStyleField(),
    ],
  }
}

export function carouselBlock(): Block {
  return {
    slug: 'carousel',
    dbName: ({ tableName }) => `${tableName}_b_car`,
    labels: { singular: 'Karuzela', plural: 'Karuzele' },
    fields: [
      {
        name: 'slides',
        type: 'array',
        label: 'Slajdy',
        labels: { singular: 'Slajd', plural: 'Slajdy' },
        admin: {
          components: {
            RowLabel: '/components/admin/appearance/SlideRowLabel#SlideRowLabel',
          },
        },
        fields: [
          {
            name: 'image',
            type: 'upload',
            relationTo: 'media',
            label: 'Zdjęcie',
          },
          {
            name: 'caption',
            type: 'text',
            label: 'Podpis',
          },
          ...linkFields,
        ],
      },
      {
        type: 'row',
        fields: [
          {
            name: 'slidesPerView',
            type: 'number',
            label: 'Slajdów naraz',
            defaultValue: 1,
            min: 1,
            max: 3,
            admin: { width: '50%' },
          },
          gapField('md'),
        ],
      },
      {
        type: 'row',
        fields: [aspectRatioField('16-9'), radiusField('md')],
      },
      {
        type: 'row',
        fields: [
          {
            name: 'autoplay',
            type: 'checkbox',
            label: 'Przewijaj automatycznie',
            defaultValue: false,
            admin: { width: '50%' },
          },
          {
            name: 'interval',
            type: 'number',
            label: 'Co ile sekund',
            defaultValue: 5,
            min: 1,
            max: 30,
            admin: {
              width: '50%',
              condition: (_: unknown, siblingData: { autoplay?: boolean }) =>
                siblingData?.autoplay === true,
            },
          },
        ],
      },
      {
        type: 'row',
        fields: [
          {
            name: 'loop',
            type: 'checkbox',
            label: 'Zapętl',
            defaultValue: true,
            admin: { width: '33%' },
          },
          {
            name: 'showArrows',
            type: 'checkbox',
            label: 'Strzałki',
            defaultValue: true,
            admin: { width: '33%' },
          },
          {
            name: 'showDots',
            type: 'checkbox',
            label: 'Kropki',
            defaultValue: true,
            admin: { width: '34%' },
          },
        ],
      },
      elementStyleField(),
    ],
  }
}

export function videoBlock(): Block {
  return {
    slug: 'video',
    dbName: ({ tableName }) => `${tableName}_b_vid`,
    labels: { singular: 'Wideo', plural: 'Filmy' },
    fields: [
      select(
        'source',
        'Źródło',
        'file',
        [
          { label: 'Plik z biblioteki mediów', value: 'file' },
          { label: 'YouTube', value: 'youtube' },
          { label: 'Vimeo', value: 'vimeo' },
        ],
        '50%',
      ),
      {
        name: 'file',
        type: 'upload',
        relationTo: 'media',
        label: 'Plik wideo',
        admin: {
          condition: (_: unknown, siblingData: { source?: string }) =>
            (siblingData?.source ?? 'file') === 'file',
        },
      },
      {
        name: 'url',
        type: 'text',
        label: 'Adres filmu',
        admin: {
          description: 'Wklej pełny adres, np. https://www.youtube.com/watch?v=…',
          condition: (_: unknown, siblingData: { source?: string }) =>
            siblingData?.source === 'youtube' || siblingData?.source === 'vimeo',
        },
      },
      {
        name: 'poster',
        type: 'upload',
        relationTo: 'media',
        label: 'Miniatura (plakat)',
        admin: {
          condition: (_: unknown, siblingData: { source?: string }) =>
            (siblingData?.source ?? 'file') === 'file',
        },
      },
      {
        type: 'row',
        fields: [aspectRatioField('16-9'), radiusField('md')],
      },
      {
        type: 'row',
        fields: [
          {
            name: 'controls',
            type: 'checkbox',
            label: 'Pokaż sterowanie',
            defaultValue: true,
            admin: { width: '25%' },
          },
          {
            name: 'autoplay',
            type: 'checkbox',
            label: 'Autoodtwarzanie',
            defaultValue: false,
            admin: { width: '25%' },
          },
          {
            name: 'loop',
            type: 'checkbox',
            label: 'Zapętl',
            defaultValue: false,
            admin: { width: '25%' },
          },
          {
            name: 'muted',
            type: 'checkbox',
            label: 'Wycisz',
            defaultValue: true,
            admin: {
              width: '25%',
              description: 'Przeglądarki odtwarzają automatycznie tylko wyciszone filmy.',
            },
          },
        ],
      },
      elementStyleField(),
    ],
  }
}
