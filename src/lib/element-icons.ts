/**
 * The icon set an editor can pick from (icon lists, feature cards, buttons).
 *
 * Names only: the drawings live in `src/components/elements/Icon.tsx`. Keeping
 * the list here means the Payload field config never imports a component file,
 * and both sides agree on what "check" means.
 */

export const ELEMENT_ICONS = [
  { label: 'Ptaszek', value: 'check' },
  { label: 'Gwiazdka', value: 'star' },
  { label: 'Serce', value: 'heart' },
  { label: 'Iskra', value: 'sparkle' },
  { label: 'Tarcza', value: 'shield' },
  { label: 'Telefon', value: 'phone' },
  { label: 'Koperta', value: 'mail' },
  { label: 'Zegar', value: 'clock' },
  { label: 'Pinezka', value: 'pin' },
  { label: 'Kalendarz', value: 'calendar' },
  { label: 'Osoba', value: 'user' },
  { label: 'Strzałka w prawo', value: 'arrow' },
  { label: 'Cudzysłów', value: 'quote' },
  { label: 'Plus', value: 'plus' },
  { label: 'Kropka', value: 'dot' },
  { label: 'Brak', value: 'none' },
] as const

export type ElementIconName = (typeof ELEMENT_ICONS)[number]['value']

export function isIconName(value: unknown): value is ElementIconName {
  return ELEMENT_ICONS.some((icon) => icon.value === value)
}
