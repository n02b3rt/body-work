/**
 * The element library: what an editor can drop onto a page, and what each
 * dropped element is made of.
 *
 * Plain data, not Payload field factories: the editor shell, the renderer, the
 * inspector and the drag-and-drop validity check all read the *same* catalogue,
 * so "what can go inside a container" and "what does a fresh heading start as"
 * are answered once, here, rather than re-decided in four places.
 *
 * **`container` replaces the old `columns`/`column` pair on purpose.** Payload
 * blocks could not reference themselves, which is why the previous builder
 * capped nesting at one level. A `container` is just another node with
 * `children`, so it can hold another `container`, and depth is bounded only by
 * `MAX_TREE_DEPTH` below, not by the schema.
 */

import type { Breakpoint, ElementType } from '../types'

export type ElementCategory = 'basic' | 'layout' | 'media' | 'sections'

export const ELEMENT_CATEGORIES: { slug: ElementCategory; label: string; hint: string }[] = [
  { slug: 'layout', label: 'Układ', hint: 'Sekcje i kontenery: wszystko inne w nie trafia.' },
  { slug: 'basic', label: 'Podstawowe', hint: 'Tekst, zdjęcia, przyciski.' },
  { slug: 'media', label: 'Media', hint: 'Galerie, karuzele, wideo.' },
  { slug: 'sections', label: 'Gotowe bloki', hint: 'Hero, CTA, karty, FAQ.' },
]

export type InspectorControl =
  | { kind: 'richText'; prop: string; label: string; placeholder?: string }
  | { kind: 'text'; prop: string; label: string; placeholder?: string }
  | { kind: 'link'; prop: string; label: string }
  | { kind: 'media'; prop: string; label: string; accept: 'image' | 'video' }
  | { kind: 'icon'; prop: string; label: string }
  | { kind: 'number'; prop: string; label: string; min?: number; max?: number }
  | { kind: 'checkbox'; prop: string; label: string }
  | { kind: 'select'; prop: string; label: string; options: { label: string; value: string }[] }
  | { kind: 'repeater'; prop: string; label: string; itemLabel: string; fields: InspectorControl[] }

/** A page's `width` sits outside the Tailwind token scale: it is a sitewide layout
 * convention (the reference site's 1440px container and 960px narrow measure),
 * not a value an editor should be free-typing per section. */
export const SECTION_WIDTHS = [
  { value: 'full', label: 'Pełna', maxWidth: 'none' },
  { value: 'container', label: 'Kontener (1440px)', maxWidth: '1440px' },
  { value: 'narrow', label: 'Wąska (960px)', maxWidth: '960px' },
] as const
export type SectionWidth = (typeof SECTION_WIDTHS)[number]['value']

/**
 * `className` is a literal string, not built at render time from a number:
 * Tailwind's scanner matches complete class tokens in source text, so
 * `` `py-${n}` `` in a render component would never be picked up.
 */
export const SECTION_SPACINGS = [
  { value: 'none', label: 'Brak', className: '' },
  { value: 'sm', label: 'Mały', className: 'py-8' },
  { value: 'md', label: 'Średni', className: 'py-16' },
  { value: 'lg', label: 'Duży', className: 'py-24' },
] as const
export type SectionSpacing = (typeof SECTION_SPACINGS)[number]['value']

export type ElementDefinition = {
  type: ElementType
  label: string
  hint: string
  category: ElementCategory
  icon: string
  /** What can be dropped inside. `'none'` means the element is a leaf: its content is data (`props`), not child nodes. */
  allowedChildren: readonly ElementType[] | 'none'
  /** Can an editor drop this straight into a section, or only into a container? Every current type allows both, kept for a future locked-down block. */
  topLevel: boolean
  defaultProps: Record<string, unknown>
  defaultTw: Partial<Record<Breakpoint, string[]>>
  /** Content-tab controls. Layout and Style tabs are generic (`src/components/builder/inspector/`) and read `tw`/`css` directly, so they need no per-element declaration. */
  controls: InspectorControl[]
}

const CONTAINABLE: readonly ElementType[] = [
  'container',
  'heading',
  'text',
  'image',
  'button',
  'icon',
  'list',
  'divider',
  'spacer',
  'gallery',
  'carousel',
  'video',
  'accordion',
  'hero',
  'cta',
  'features',
  'savedComponent',
]

export const ELEMENT_DEFINITIONS: ElementDefinition[] = [
  {
    type: 'container',
    label: 'Kontener',
    hint: 'Wiersz lub kolumna, mieści dowolne elementy.',
    category: 'layout',
    icon: 'layout-grid',
    allowedChildren: CONTAINABLE,
    topLevel: true,
    defaultProps: {},
    defaultTw: { base: ['flex', 'flex-col', 'gap-4'] },
    controls: [],
  },
  {
    type: 'heading',
    label: 'Nagłówek',
    hint: 'Tytuł sekcji, H1–H6.',
    category: 'basic',
    icon: 'heading',
    allowedChildren: 'none',
    topLevel: true,
    defaultProps: { html: 'Nagłówek sekcji' },
    defaultTw: { base: ['text-h-mobile'], lg: ['text-h-section'] },
    controls: [{ kind: 'richText', prop: 'html', label: 'Treść nagłówka' }],
  },
  {
    type: 'text',
    label: 'Tekst',
    hint: 'Akapity z formatowaniem.',
    category: 'basic',
    icon: 'text',
    allowedChildren: 'none',
    topLevel: true,
    defaultProps: { html: '<p>Nowy akapit tekstu.</p>', tag: 'p' },
    defaultTw: { base: ['text-body'] },
    controls: [
      { kind: 'richText', prop: 'html', label: 'Treść' },
      {
        kind: 'select',
        prop: 'tag',
        label: 'Znacznik HTML',
        options: [
          { value: 'p', label: 'p (akapit)' },
          { value: 'div', label: 'div' },
          { value: 'span', label: 'span' },
          { value: 'blockquote', label: 'blockquote (cytat)' },
        ],
      },
    ],
  },
  {
    type: 'image',
    label: 'Zdjęcie',
    hint: 'Pojedynczy obraz z podpisem.',
    category: 'basic',
    icon: 'image',
    allowedChildren: 'none',
    topLevel: true,
    defaultProps: { mediaId: null, aspectRatio: 'auto', fit: 'cover', caption: '' },
    defaultTw: { base: ['rounded-md'] },
    controls: [
      { kind: 'media', prop: 'mediaId', label: 'Zdjęcie', accept: 'image' },
      { kind: 'text', prop: 'caption', label: 'Podpis' },
      {
        kind: 'select',
        prop: 'aspectRatio',
        label: 'Proporcje',
        options: [
          { value: 'auto', label: 'Oryginalne' },
          { value: '1/1', label: 'Kwadrat' },
          { value: '4/3', label: '4:3' },
          { value: '16/9', label: '16:9' },
        ],
      },
    ],
  },
  {
    type: 'button',
    label: 'Przycisk',
    hint: 'Jeden odnośnik jako CTA.',
    category: 'basic',
    icon: 'button',
    allowedChildren: 'none',
    topLevel: true,
    defaultProps: { label: 'Przycisk', href: '', target: '_self', variant: 'primary' },
    defaultTw: { base: ['text-btn', 'px-6', 'py-3', 'rounded-md'] },
    controls: [
      { kind: 'text', prop: 'label', label: 'Etykieta' },
      { kind: 'link', prop: 'href', label: 'Odnośnik' },
      {
        kind: 'select',
        prop: 'variant',
        label: 'Wariant',
        options: [
          { value: 'primary', label: 'Wypełniony' },
          { value: 'secondary', label: 'Obrys' },
          { value: 'ghost', label: 'Tekstowy' },
        ],
      },
    ],
  },
  {
    type: 'icon',
    label: 'Ikona',
    hint: 'Pojedyncza ikona z biblioteki.',
    category: 'basic',
    icon: 'sparkle',
    allowedChildren: 'none',
    topLevel: true,
    defaultProps: { name: 'check', size: 'md' },
    defaultTw: { base: ['text-brand'] },
    controls: [{ kind: 'icon', prop: 'name', label: 'Ikona' }],
  },
  {
    type: 'list',
    label: 'Lista z ikonami',
    hint: 'Wypunktowanie z ikonami.',
    category: 'basic',
    icon: 'list',
    allowedChildren: 'none',
    topLevel: true,
    defaultProps: { items: [{ icon: 'check', html: 'Punkt listy' }] },
    defaultTw: { base: ['flex', 'flex-col', 'gap-2'] },
    controls: [
      {
        kind: 'repeater',
        prop: 'items',
        label: 'Punkty',
        itemLabel: 'Punkt',
        fields: [
          { kind: 'icon', prop: 'icon', label: 'Ikona' },
          { kind: 'richText', prop: 'html', label: 'Treść' },
        ],
      },
    ],
  },
  {
    type: 'divider',
    label: 'Separator',
    hint: 'Pozioma linia.',
    category: 'layout',
    icon: 'divider',
    allowedChildren: 'none',
    topLevel: true,
    defaultProps: {},
    defaultTw: { base: ['border-t', 'border-line'] },
    controls: [],
  },
  {
    type: 'spacer',
    label: 'Odstęp',
    hint: 'Pusta przestrzeń.',
    category: 'layout',
    icon: 'spacer',
    allowedChildren: 'none',
    topLevel: true,
    defaultProps: {},
    defaultTw: { base: ['h-8'], lg: ['h-16'] },
    controls: [],
  },
  {
    type: 'gallery',
    label: 'Galeria',
    hint: 'Siatka zdjęć z powiększaniem.',
    category: 'media',
    icon: 'gallery',
    allowedChildren: 'none',
    topLevel: true,
    defaultProps: { mediaIds: [] },
    defaultTw: { base: ['grid-cols-2'], lg: ['grid-cols-3'] },
    controls: [{ kind: 'media', prop: 'mediaIds', label: 'Zdjęcia', accept: 'image' }],
  },
  {
    type: 'carousel',
    label: 'Karuzela',
    hint: 'Przewijane slajdy.',
    category: 'media',
    icon: 'carousel',
    allowedChildren: 'none',
    topLevel: true,
    defaultProps: { mediaIds: [], autoplay: false },
    defaultTw: {},
    controls: [
      { kind: 'media', prop: 'mediaIds', label: 'Zdjęcia', accept: 'image' },
      { kind: 'checkbox', prop: 'autoplay', label: 'Automatyczne przewijanie' },
    ],
  },
  {
    type: 'video',
    label: 'Wideo',
    hint: 'Plik, YouTube lub Vimeo.',
    category: 'media',
    icon: 'video',
    allowedChildren: 'none',
    topLevel: true,
    defaultProps: { source: 'upload', mediaId: null, url: '', posterId: null },
    defaultTw: { base: ['rounded-md'] },
    controls: [
      {
        kind: 'select',
        prop: 'source',
        label: 'Źródło',
        options: [
          { value: 'upload', label: 'Plik z biblioteki' },
          { value: 'youtube', label: 'YouTube' },
          { value: 'vimeo', label: 'Vimeo' },
        ],
      },
      { kind: 'media', prop: 'mediaId', label: 'Plik wideo', accept: 'video' },
      { kind: 'text', prop: 'url', label: 'Adres URL' },
      { kind: 'media', prop: 'posterId', label: 'Miniatura (poster)', accept: 'image' },
    ],
  },
  {
    type: 'accordion',
    label: 'Akordeon',
    hint: 'Rozwijane pytania i odpowiedzi.',
    category: 'sections',
    icon: 'accordion',
    allowedChildren: 'none',
    topLevel: true,
    defaultProps: { items: [{ title: 'Pytanie', html: '<p>Odpowiedź.</p>' }] },
    defaultTw: { base: ['flex', 'flex-col', 'gap-2'] },
    controls: [
      {
        kind: 'repeater',
        prop: 'items',
        label: 'Pozycje',
        itemLabel: 'Pytanie',
        fields: [
          { kind: 'text', prop: 'title', label: 'Pytanie' },
          { kind: 'richText', prop: 'html', label: 'Odpowiedź' },
        ],
      },
    ],
  },
  {
    type: 'hero',
    label: 'Hero',
    hint: 'Zdjęcie tła z nagłówkiem.',
    category: 'sections',
    icon: 'hero',
    allowedChildren: 'none',
    topLevel: true,
    defaultProps: { mediaId: null, heading: 'Nagłówek hero', subheading: '', buttons: [] },
    defaultTw: { base: ['py-16'], lg: ['py-32'] },
    controls: [
      { kind: 'media', prop: 'mediaId', label: 'Zdjęcie tła', accept: 'image' },
      { kind: 'richText', prop: 'heading', label: 'Nagłówek' },
      { kind: 'richText', prop: 'subheading', label: 'Podtytuł' },
      {
        kind: 'repeater',
        prop: 'buttons',
        label: 'Przyciski',
        itemLabel: 'Przycisk',
        fields: [
          { kind: 'text', prop: 'label', label: 'Etykieta' },
          { kind: 'link', prop: 'href', label: 'Odnośnik' },
        ],
      },
    ],
  },
  {
    type: 'cta',
    label: 'Pasek CTA',
    hint: 'Wyróżniona zachęta.',
    category: 'sections',
    icon: 'cta',
    allowedChildren: 'none',
    topLevel: true,
    defaultProps: { heading: 'Wezwanie do działania', text: '', buttonLabel: '', buttonHref: '' },
    defaultTw: { base: ['bg-surface-alt', 'rounded-lg', 'p-8'] },
    controls: [
      { kind: 'text', prop: 'heading', label: 'Nagłówek' },
      { kind: 'richText', prop: 'text', label: 'Treść' },
      { kind: 'text', prop: 'buttonLabel', label: 'Etykieta przycisku' },
      { kind: 'link', prop: 'buttonHref', label: 'Odnośnik przycisku' },
    ],
  },
  {
    type: 'features',
    label: 'Karty',
    hint: 'Siatka kart z opisami.',
    category: 'sections',
    icon: 'features',
    allowedChildren: 'none',
    topLevel: true,
    defaultProps: { items: [{ icon: 'check', heading: 'Zaleta', text: '' }] },
    defaultTw: { base: ['grid-cols-1'], md: ['grid-cols-2'], lg: ['grid-cols-3'] },
    controls: [
      {
        kind: 'repeater',
        prop: 'items',
        label: 'Karty',
        itemLabel: 'Karta',
        fields: [
          { kind: 'icon', prop: 'icon', label: 'Ikona' },
          { kind: 'text', prop: 'heading', label: 'Nagłówek' },
          { kind: 'richText', prop: 'text', label: 'Treść' },
        ],
      },
    ],
  },
  {
    type: 'savedComponent',
    label: 'Zapisany komponent',
    hint: 'Referencja do biblioteki komponentów.',
    category: 'layout',
    icon: 'component',
    allowedChildren: 'none',
    topLevel: true,
    defaultProps: {},
    defaultTw: {},
    controls: [],
  },
]

/**
 * `section` is not in `ELEMENT_DEFINITIONS`: it is never dragged in from the
 * library, only added with its own "+ Dodaj sekcję" action, the same way the
 * previous builder treated the section array itself rather than one more block.
 */
export function defaultSectionProps(): Record<string, unknown> {
  return { width: 'container' as SectionWidth, spacing: 'md' as SectionSpacing, background: '', anchor: '' }
}

export const ELEMENT_BY_TYPE: Record<string, ElementDefinition> = Object.fromEntries(
  ELEMENT_DEFINITIONS.map((definition) => [definition.type, definition]),
)

export function elementDefinition(type: ElementType): ElementDefinition | undefined {
  return ELEMENT_BY_TYPE[type]
}

export function elementLabel(type: string): string {
  return ELEMENT_BY_TYPE[type]?.label ?? type
}

/** What is allowed to sit directly under a section: everything in the library. */
export const SECTION_CHILDREN: readonly ElementType[] = CONTAINABLE

/** Guards against a page nested deep enough to blow the stack on a recursive walk, and against an editor nesting containers with no way out. */
export const MAX_TREE_DEPTH = 12

/** Guards a `savedComponent` reference that resolves back into itself, directly or through a chain. */
export const MAX_COMPOSITION_DEPTH = 4

export function canContain(parentType: ElementType, childType: ElementType): boolean {
  if (parentType === 'root') return childType === 'section'
  if (parentType === 'section') return SECTION_CHILDREN.includes(childType)
  const definition = elementDefinition(parentType)
  if (!definition || definition.allowedChildren === 'none') return false
  return definition.allowedChildren.includes(childType)
}
