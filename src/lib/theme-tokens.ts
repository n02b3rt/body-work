/**
 * Theme colour tokens — single source of truth for the "Schemat kolorów" global
 * and for the CSS custom properties emitted on the public site.
 *
 * Adding a token here automatically adds the admin field (see
 * `src/globals/ThemeColors.ts`) and the `:root` variable (see `theme-css.ts`).
 */

export type ThemeTokenGroupName = 'brand' | 'text' | 'surface' | 'state'

export type ThemeColorToken = {
  /** Field name inside its group — full path is `<group>.<name>`. */
  name: string
  label: string
  /** CSS custom property emitted on `:root` of the public site. */
  cssVar: string
  /** Fallback used when the global has no value saved yet. */
  defaultValue: string
  description?: string
}

export type ThemeTokenGroup = {
  name: ThemeTokenGroupName
  label: string
  description: string
  tokens: ThemeColorToken[]
}

export const THEME_TOKEN_GROUPS: ThemeTokenGroup[] = [
  {
    name: 'brand',
    label: 'Marka',
    description: 'Kolory wiodące — przyciski, akcenty, elementy interaktywne.',
    tokens: [
      {
        name: 'primary',
        label: 'Główny',
        cssVar: '--bw-primary',
        defaultValue: '#0f766e',
        description: 'Podstawowy kolor marki (przyciski, aktywne elementy).',
      },
      {
        name: 'primaryHover',
        label: 'Główny — hover',
        cssVar: '--bw-primary-hover',
        defaultValue: '#115e59',
      },
      {
        name: 'secondary',
        label: 'Dodatkowy',
        cssVar: '--bw-secondary',
        defaultValue: '#1e293b',
      },
      {
        name: 'secondaryHover',
        label: 'Dodatkowy — hover',
        cssVar: '--bw-secondary-hover',
        defaultValue: '#0f172a',
      },
      {
        name: 'accent',
        label: 'Akcent',
        cssVar: '--bw-accent',
        defaultValue: '#f59e0b',
        description: 'Wyróżnienia, odznaki, elementy przyciągające wzrok.',
      },
    ],
  },
  {
    name: 'text',
    label: 'Tekst',
    description: 'Kolory typografii i odnośników.',
    tokens: [
      {
        name: 'heading',
        label: 'Nagłówki',
        cssVar: '--bw-text-heading',
        defaultValue: '#0f172a',
      },
      {
        name: 'body',
        label: 'Tekst podstawowy',
        cssVar: '--bw-text-body',
        defaultValue: '#334155',
      },
      {
        name: 'muted',
        label: 'Tekst pomocniczy',
        cssVar: '--bw-text-muted',
        defaultValue: '#64748b',
      },
      {
        name: 'inverted',
        label: 'Tekst na tle koloru',
        cssVar: '--bw-text-inverted',
        defaultValue: '#ffffff',
        description: 'Używany na przyciskach i sekcjach z ciemnym tłem.',
      },
      {
        name: 'link',
        label: 'Odnośniki',
        cssVar: '--bw-link',
        defaultValue: '#0f766e',
      },
      {
        name: 'linkHover',
        label: 'Odnośniki — hover',
        cssVar: '--bw-link-hover',
        defaultValue: '#115e59',
      },
    ],
  },
  {
    name: 'surface',
    label: 'Tła i obramowania',
    description: 'Powierzchnie sekcji, kart i linie podziału.',
    tokens: [
      {
        name: 'page',
        label: 'Tło strony',
        cssVar: '--bw-surface-page',
        defaultValue: '#ffffff',
      },
      {
        name: 'surface',
        label: 'Tło karty',
        cssVar: '--bw-surface',
        defaultValue: '#f8fafc',
      },
      {
        name: 'surfaceAlt',
        label: 'Tło sekcji wyróżnionej',
        cssVar: '--bw-surface-alt',
        defaultValue: '#f1f5f9',
      },
      {
        name: 'border',
        label: 'Obramowanie',
        cssVar: '--bw-border',
        defaultValue: '#e2e8f0',
      },
      {
        name: 'overlay',
        label: 'Przyciemnienie zdjęć',
        cssVar: '--bw-overlay',
        defaultValue: '#0f172a',
        description: 'Kolor nakładki na hero i karuzelach (krycie ustawia komponent).',
      },
    ],
  },
  {
    name: 'state',
    label: 'Stany',
    description: 'Komunikaty formularzy i powiadomienia.',
    tokens: [
      {
        name: 'success',
        label: 'Sukces',
        cssVar: '--bw-success',
        defaultValue: '#16a34a',
      },
      {
        name: 'warning',
        label: 'Ostrzeżenie',
        cssVar: '--bw-warning',
        defaultValue: '#d97706',
      },
      {
        name: 'error',
        label: 'Błąd',
        cssVar: '--bw-error',
        defaultValue: '#dc2626',
      },
      {
        name: 'info',
        label: 'Informacja',
        cssVar: '--bw-info',
        defaultValue: '#0284c7',
      },
    ],
  },
]

export type ThemeTokenPath = `${ThemeTokenGroupName}.${string}`

/** Flat token list with its form path — handy for previews and CSS emitting. */
export const THEME_TOKENS: (ThemeColorToken & {
  group: ThemeTokenGroupName
  path: ThemeTokenPath
})[] = THEME_TOKEN_GROUPS.flatMap((group) =>
  group.tokens.map((token) => ({
    ...token,
    group: group.name,
    path: `${group.name}.${token.name}` as ThemeTokenPath,
  })),
)

/** Token paths offered to components that pick a colour from the palette. */
export const THEME_COLOR_OPTIONS = THEME_TOKENS.map((token) => ({
  label: `${
    THEME_TOKEN_GROUPS.find((group) => group.name === token.group)!.label
  } — ${token.label}`,
  value: token.path,
}))

export function findThemeToken(path: string) {
  return THEME_TOKENS.find((token) => token.path === path)
}

const HEX_COLOR = /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i

export function isHexColor(value: unknown): value is string {
  return typeof value === 'string' && HEX_COLOR.test(value.trim())
}

/** Normalize user input to a lowercase `#rrggbb`-style value, or `null`. */
export function normalizeHexColor(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  const withHash = trimmed.startsWith('#') ? trimmed : `#${trimmed}`
  return isHexColor(withHash) ? withHash.toLowerCase() : null
}
