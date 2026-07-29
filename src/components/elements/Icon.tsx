/**
 * The inline icon set editors pick from (`src/lib/element-icons.ts` holds the
 * names). Inline SVG rather than a font or a package: the admin panel and the
 * public site load different stylesheets, and a path is the one thing that
 * renders identically in both without any wiring.
 */

import type { ElementIconName } from '@/lib/element-icons'

const PATHS: Record<Exclude<ElementIconName, 'none'>, string> = {
  arrow: 'M4 12h15m0 0-6-6m6 6-6 6',
  calendar: 'M7 3v3m10-3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z',
  check: 'm4.5 12.5 5 5 10-11',
  clock: 'M12 7v5.5l3.5 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  dot: 'M12 9.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Z',
  heart:
    'M12 20s-7.5-4.7-7.5-9.6A4.4 4.4 0 0 1 12 7.6a4.4 4.4 0 0 1 7.5 2.8C19.5 15.3 12 20 12 20Z',
  mail: 'M4 6h16v12H4V6Zm0 .5 8 6 8-6',
  phone:
    'M6.5 4h3l1.5 4-2 1.5a12 12 0 0 0 5.5 5.5l1.5-2 4 1.5v3a1.5 1.5 0 0 1-1.7 1.5A16.5 16.5 0 0 1 4.5 5.7 1.5 1.5 0 0 1 6 4Z',
  pin: 'M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11Zm0-8.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z',
  plus: 'M12 5v14M5 12h14',
  quote:
    'M9 6c-2.8 1-4.5 3.3-4.5 6.5V18h6v-6H7c0-1.9.7-3.2 2-4L9 6Zm10 0c-2.8 1-4.5 3.3-4.5 6.5V18h6v-6H17c0-1.9.7-3.2 2-4L19 6Z',
  shield: 'M12 3.5 5 6v5.5c0 4.4 3 7.6 7 9 4-1.4 7-4.6 7-9V6l-7-2.5Z',
  sparkle: 'M12 3.5 13.8 9l5.7 1.8-5.7 1.8L12 20.5l-1.8-5.9-5.7-1.8L10.2 9 12 3.5Z',
  star: 'm12 4 2.5 5.2 5.5.8-4 3.9 1 5.6-5-2.7-5 2.7 1-5.6-4-3.9 5.5-.8L12 4Z',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0',
}

const FILLED: ElementIconName[] = ['dot', 'heart', 'star', 'quote', 'shield', 'sparkle']

type Props = {
  className?: string
  color?: string
  name: unknown
  size?: number
}

export function Icon({ className, color, name, size = 20 }: Props) {
  if (typeof name !== 'string' || name === 'none') return null
  const path = PATHS[name as Exclude<ElementIconName, 'none'>]
  if (!path) return null

  const filled = FILLED.includes(name as ElementIconName)

  return (
    <svg
      aria-hidden="true"
      className={['bw-el-icon', className].filter(Boolean).join(' ')}
      fill={filled ? 'currentColor' : 'none'}
      height={size}
      stroke={filled ? 'none' : 'currentColor'}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.7}
      style={color ? { color } : undefined}
      viewBox="0 0 24 24"
      width={size}
    >
      <path d={path} />
    </svg>
  )
}
