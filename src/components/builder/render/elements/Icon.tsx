import type { SVGProps } from 'react'

import type { ElementProps } from '../BuilderRender'

/**
 * A small, fixed icon set for v1. Deliberately not a wrapper around an icon
 * package: the builder stores an icon by **name** (`props.icon` /
 * `items[].icon`), so growing this set is additive (new key, new `<path>`),
 * and a name that has not been added yet still renders instead of crashing.
 */
const ICONS: Record<string, (props: SVGProps<SVGSVGElement>) => React.JSX.Element> = {
  check: (props) => (
    <svg fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" {...props}>
      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  arrow: (props) => (
    <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  star: (props) => (
    <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2z" />
    </svg>
  ),
  heart: (props) => (
    <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
      <path d="M12 21s-6.7-4.35-9.3-8.1C.86 10.1 1.6 6.6 4.6 5.2c2.2-1 4.6-.2 5.9 1.6C11.8 5 14.2 4.2 16.4 5.2c3 1.4 3.74 4.9 1.9 7.7C18.7 16.65 12 21 12 21z" />
    </svg>
  ),
  phone: (props) => (
    <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" {...props}>
      <path
        d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.5 2.1L8 9.7a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.5 2.7.6a2 2 0 0 1 1.7 2.3z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  mail: (props) => (
    <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" {...props}>
      <path
        d="M4 4h16v16H4V4zm0 0l8 8 8-8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
}

const SIZE_CLASS: Record<string, string> = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-8 w-8' }

export function iconExists(name: string): boolean {
  return name in ICONS
}

export const ICON_NAMES = Object.keys(ICONS)

export function IconGlyph({ name, size = 'md' }: { name: string; size?: string }) {
  const Glyph = ICONS[name] ?? ICONS.check
  return <Glyph className={SIZE_CLASS[size] ?? SIZE_CLASS.md} aria-hidden="true" />
}

export function Icon({ node }: ElementProps) {
  const name = typeof node.props.name === 'string' ? node.props.name : 'check'
  const size = typeof node.props.size === 'string' ? node.props.size : 'md'
  return <IconGlyph name={name} size={size} />
}
