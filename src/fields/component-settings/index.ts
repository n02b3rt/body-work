/**
 * Registry of component types available in "Wygląd → Komponenty".
 * Each type owns one settings group (see the sibling files) whose fields are
 * shown only when that type is selected.
 */

import type { GroupField } from 'payload'

import { buttonSettings } from './button'
import { carouselSettings } from './carousel'
import { ctaSettings } from './cta'
import { featuresSettings } from './features'
import { gallerySettings } from './gallery'
import { heroSettings } from './hero'

export type ComponentTypeValue =
  | 'button'
  | 'hero'
  | 'carousel'
  | 'gallery'
  | 'cta'
  | 'features'

export type ComponentTypeDefinition = {
  value: ComponentTypeValue
  label: string
  hint: string
}

export const COMPONENT_TYPES: ComponentTypeDefinition[] = [
  {
    value: 'button',
    label: 'Przycisk',
    hint: 'Pojedynczy przycisk lub odnośnik do wielokrotnego użycia.',
  },
  {
    value: 'hero',
    label: 'Hero (zdjęcie z nagłówkiem)',
    hint: 'Sekcja otwierająca stronę: zdjęcie tła, nagłówek, przycisk.',
  },
  {
    value: 'carousel',
    label: 'Karuzela zdjęć',
    hint: 'Przewijane slajdy z podpisami.',
  },
  {
    value: 'gallery',
    label: 'Galeria zdjęć',
    hint: 'Siatka zdjęć z opcjonalnym powiększaniem.',
  },
  {
    value: 'cta',
    label: 'Pasek CTA',
    hint: 'Wyróżniony pasek z zachętą i przyciskiem.',
  },
  {
    value: 'features',
    label: 'Karty z korzyściami',
    hint: 'Kilka kart z ikoną, tytułem i opisem.',
  },
]

export const COMPONENT_TYPE_OPTIONS = COMPONENT_TYPES.map(({ label, value }) => ({
  label,
  value,
}))

export function componentTypeLabel(value: unknown): string {
  const found = COMPONENT_TYPES.find((type) => type.value === value)
  return found?.label ?? 'Komponent'
}

/** Settings groups in the order they appear in the edit view. */
export const componentSettingsGroups: GroupField[] = [
  buttonSettings,
  heroSettings,
  carouselSettings,
  gallerySettings,
  ctaSettings,
  featuresSettings,
]
