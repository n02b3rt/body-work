/**
 * What the element library *is called*, separate from what it *is*.
 *
 * The block definitions live in `src/fields/elements/`, which is server config;
 * this file is plain data so the builder's library panel and inspector can read
 * it without dragging Payload's field factories into the browser bundle.
 */

export type ElementCategory = {
  hint: string
  label: string
  slug: string
}

/** Groups in the builder's library panel, in the order they are shown. */
export const ELEMENT_CATEGORIES: ElementCategory[] = [
  { slug: 'basic', label: 'Podstawowe', hint: 'Tekst, zdjęcia, przyciski.' },
  { slug: 'layout', label: 'Układ', hint: 'Kolumny i odstępy.' },
  { slug: 'media', label: 'Media', hint: 'Galerie, karuzele, wideo.' },
  { slug: 'sections', label: 'Sekcje', hint: 'Gotowe bloki: hero, CTA, karty, FAQ.' },
]

export type ElementDefinition = {
  category: string
  /** Short line shown under the name in the library. */
  hint: string
  label: string
  slug: string
}

export const ELEMENT_DEFINITIONS: ElementDefinition[] = [
  { slug: 'heading', label: 'Nagłówek', category: 'basic', hint: 'Tytuł sekcji, H1–H6.' },
  { slug: 'text', label: 'Tekst', category: 'basic', hint: 'Akapity z formatowaniem.' },
  { slug: 'image', label: 'Zdjęcie', category: 'basic', hint: 'Pojedynczy obraz z podpisem.' },
  { slug: 'buttons', label: 'Przyciski', category: 'basic', hint: 'Jeden lub kilka odnośników.' },
  {
    slug: 'iconList',
    label: 'Lista z ikonami',
    category: 'basic',
    hint: 'Wypunktowanie z ikonami.',
  },
  { slug: 'columns', label: 'Kolumny', category: 'layout', hint: 'Podziel sekcję na kolumny.' },
  { slug: 'divider', label: 'Separator', category: 'layout', hint: 'Pozioma linia.' },
  { slug: 'spacer', label: 'Odstęp', category: 'layout', hint: 'Pusta przestrzeń.' },
  { slug: 'gallery', label: 'Galeria', category: 'media', hint: 'Siatka zdjęć z powiększaniem.' },
  { slug: 'carousel', label: 'Karuzela', category: 'media', hint: 'Przewijane slajdy.' },
  { slug: 'video', label: 'Wideo', category: 'media', hint: 'Plik, YouTube lub Vimeo.' },
  { slug: 'hero', label: 'Hero', category: 'sections', hint: 'Zdjęcie tła z nagłówkiem.' },
  { slug: 'cta', label: 'Pasek CTA', category: 'sections', hint: 'Wyróżniona zachęta.' },
  { slug: 'features', label: 'Karty', category: 'sections', hint: 'Siatka kart z opisami.' },
  { slug: 'accordion', label: 'Rozwijana lista', category: 'sections', hint: 'FAQ, harmonijka.' },
  {
    slug: 'savedComponent',
    label: 'Mój komponent',
    category: 'saved',
    hint: 'Wstaw zapisane złożenie.',
  },
]

/** Order the blocks are built in, so the library and the config agree. */
export const ELEMENT_ORDER = ELEMENT_DEFINITIONS.map(({ slug }) => slug)

export function elementLabel(slug: unknown): string {
  const found = ELEMENT_DEFINITIONS.find((element) => element.slug === slug)
  return found?.label ?? 'Element'
}

/** Compositions are filed under these in "Wygląd → Komponenty". */
export const COMPOSITION_CATEGORIES: Record<string, string> = {
  card: 'Karty / kafelki',
  cta: 'Wezwania do działania',
  header: 'Nagłówki stron',
  other: 'Inne',
  section: 'Sekcje',
}
