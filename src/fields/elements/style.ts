/**
 * The `style` group carried by every element.
 *
 * This is the half of the builder an editor spends most time in: spacing,
 * corners, borders, colours, width, alignment and per-breakpoint visibility.
 * It is one definition rather than per-element copies, so a new element gets the
 * whole set for free and `resolveElementStyle` stays the only reader.
 *
 * Everything here is a **factory**. Payload sanitizes field configs in place, so
 * one shared object reused across sixteen blocks would have the first block's
 * resolved paths baked into it by the time the second is built. (And the configs
 * hold functions — `validate`, `condition` — so they cannot simply be cloned.)
 */

import type { CollapsibleField, Field, GroupField, NumberField } from 'payload'

import { alignField, colorChoice, radiusField, select } from './shared'

function pxField(name: string, label: string, width = '25%'): NumberField {
  return {
    name,
    type: 'number',
    label,
    min: 0,
    max: 400,
    admin: { width, step: 4 },
  }
}

export function paddingGroup(): GroupField {
  return {
    name: 'padding',
    type: 'group',
    label: 'Wypełnienie (px)',
    admin: { description: 'Odstęp wewnątrz elementu, od jego krawędzi do treści.' },
    fields: [
      {
        type: 'row',
        fields: [
          pxField('top', 'Góra'),
          pxField('right', 'Prawo'),
          pxField('bottom', 'Dół'),
          pxField('left', 'Lewo'),
        ],
      },
    ],
  }
}

function marginGroup(): GroupField {
  return {
    name: 'margin',
    type: 'group',
    label: 'Margines zewnętrzny (px)',
    admin: { description: 'Odstęp od sąsiednich elementów.' },
    fields: [
      {
        type: 'row',
        fields: [pxField('top', 'Góra', '50%'), pxField('bottom', 'Dół', '50%')],
      },
    ],
  }
}

const hasBorder = (_: unknown, siblingData: { style?: string }) =>
  Boolean(siblingData?.style) && siblingData?.style !== 'none'

export function borderGroup(): GroupField {
  return {
    name: 'border',
    type: 'group',
    label: 'Obramowanie',
    fields: [
      {
        type: 'row',
        fields: [
          select(
            'style',
            'Rodzaj linii',
            'none',
            [
              { label: 'Brak', value: 'none' },
              { label: 'Ciągła', value: 'solid' },
              { label: 'Kreskowana', value: 'dashed' },
              { label: 'Kropkowana', value: 'dotted' },
            ],
            '50%',
          ),
          {
            name: 'width',
            type: 'number',
            label: 'Grubość (px)',
            defaultValue: 1,
            min: 0,
            max: 20,
            admin: { width: '50%', condition: hasBorder },
          },
        ],
      },
      {
        ...colorChoice('color', 'Kolor obramowania', 'surface.border'),
        admin: { condition: hasBorder },
      },
    ],
  }
}

function styleGroup(): GroupField {
  return {
    name: 'style',
    type: 'group',
    label: false,
    fields: [
      {
        type: 'row',
        fields: [
          alignField('align', 'left'),
          select(
            'width',
            'Szerokość',
            'auto',
            [
              { label: 'Automatyczna', value: 'auto' },
              { label: 'Pełna', value: 'full' },
              { label: 'Własna (%)', value: 'custom' },
            ],
            '50%',
          ),
        ],
      },
      {
        name: 'customWidth',
        type: 'number',
        label: 'Szerokość (%)',
        defaultValue: 100,
        min: 5,
        max: 100,
        admin: {
          condition: (_: unknown, siblingData: { width?: string }) =>
            siblingData?.width === 'custom',
        },
      },
      paddingGroup(),
      marginGroup(),
      colorChoice('background', 'Tło elementu', 'none'),
      colorChoice('textColor', 'Kolor tekstu', 'none'),
      {
        type: 'row',
        fields: [
          radiusField('none'),
          select(
            'shadow',
            'Cień',
            'none',
            [
              { label: 'Brak', value: 'none' },
              { label: 'Delikatny', value: 'sm' },
              { label: 'Średni', value: 'md' },
              { label: 'Mocny', value: 'lg' },
            ],
            '50%',
          ),
        ],
      },
      borderGroup(),
      {
        name: 'hideOn',
        type: 'select',
        hasMany: true,
        label: 'Ukryj na',
        options: [
          { label: 'Telefonie (< 640px)', value: 'mobile' },
          { label: 'Tablecie (640–1023px)', value: 'tablet' },
          { label: 'Komputerze (≥ 1024px)', value: 'desktop' },
        ],
        admin: {
          description:
            'Element zostaje w układzie, ale nie wyświetla się na wybranych ekranach.',
        },
      },
      {
        type: 'row',
        fields: [
          {
            name: 'anchorId',
            type: 'text',
            label: 'Kotwica (#)',
            admin: { width: '50%' },
          },
          {
            name: 'cssClass',
            type: 'text',
            label: 'Własna klasa CSS',
            admin: { width: '50%' },
          },
        ],
      },
    ],
  }
}

/** Appended last to every element's field list. */
export function elementStyleField(): CollapsibleField {
  return {
    type: 'collapsible',
    label: 'Wygląd i odstępy',
    admin: { initCollapsed: true },
    fields: [styleGroup()],
  }
}

/** The frame of a container that is not itself an element (a single column). */
export function containerStyleFields(): Field[] {
  return [paddingGroup(), colorChoice('background', 'Tło', 'none'), radiusField('none'), borderGroup()]
}
