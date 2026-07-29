/**
 * What an element needs to know beyond its own parameters.
 *
 * Deliberately a **plain, serializable object**: the public site renders these
 * components from a Server Component, and anything holding a function could not
 * cross into the interactive ones (gallery, carousel, accordion). Media and
 * saved compositions are therefore resolved *into the data* before rendering —
 * by Payload's `depth` on the site, by a REST fetch in the builder.
 */

export type ElementMode = 'admin' | 'site'

/**
 * Strings the interactive elements need.
 *
 * The builder canvas has no next-intl provider, so translations are looked up by
 * the caller and handed over rather than read with `useTranslations`.
 */
export type ElementLabels = {
  close: string
  enlarge: string
  lightbox: string
  next: string
  previous: string
  slide: string
}

export const DEFAULT_ELEMENT_LABELS: ElementLabels = {
  close: 'Zamknij',
  enlarge: 'Powiększ zdjęcie',
  lightbox: 'Powiększone zdjęcie',
  next: 'Następne',
  previous: 'Poprzednie',
  slide: 'Slajd',
}

export type ElementCtx = {
  /**
   * How many saved compositions deep we are. A composition can reference
   * another one, and nothing stops an editor from pointing one at itself.
   */
  depth: number
  labels: ElementLabels
  mode: ElementMode
}

export const MAX_COMPOSITION_DEPTH = 4

export function elementCtx(overrides: Partial<ElementCtx> = {}): ElementCtx {
  return {
    depth: 0,
    labels: DEFAULT_ELEMENT_LABELS,
    mode: 'site',
    ...overrides,
  }
}
