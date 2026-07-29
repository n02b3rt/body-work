import React from 'react'

type IconProps = {
  className?: string
}

function Svg({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      {children}
    </svg>
  )
}

/** Shared stroke for outline glyphs (reads clearly at 20px). */
const stroke = {
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export const navIcons = {
  /** 2×2 widget grid — Kokpit / podsumowanie */
  dashboard: (props: IconProps) => (
    <Svg {...props}>
      <path d="M2.5 2.5h4v4h-4v-4Z" {...stroke} />
      <path d="M9.5 2.5h4v4h-4v-4Z" {...stroke} />
      <path d="M2.5 9.5h4v4h-4v-4Z" {...stroke} />
      <path d="M9.5 9.5h4v4h-4v-4Z" {...stroke} />
    </Svg>
  ),

  /** Clock with hand — aktualizacje / ostatni check */
  updates: (props: IconProps) => (
    <Svg {...props}>
      <circle cx="8" cy="8" r="5.25" {...stroke} />
      <path d="M8 4.75v3.5l2.25 1.35" {...stroke} />
    </Svg>
  ),

  /** Document with lines — treści */
  content: (props: IconProps) => (
    <Svg {...props}>
      <path d="M4 2.25h5.5L12.5 5.25V13.5H4V2.25Z" {...stroke} />
      <path d="M9.5 2.25V5.25H12.5" {...stroke} />
      <path d="M6 7.5h4.5M6 9.75h4.5M6 12h2.75" {...stroke} />
    </Svg>
  ),

  /** Stacked pages */
  pages: (props: IconProps) => (
    <Svg {...props}>
      <path d="M4.5 3.5h7.5v10H4.5V3.5Z" {...stroke} />
      <path d="M3.25 5.25V2.25h7.5" {...stroke} />
      <path d="M6.25 6.75h4M6.25 9h4M6.25 11.25h2.5" {...stroke} />
    </Svg>
  ),

  /** Newspaper / post card */
  blog: (props: IconProps) => (
    <Svg {...props}>
      <path d="M2.5 3h11v10H2.5V3Z" {...stroke} />
      <path d="M4.5 5.25h3.25v3H4.5v-3Z" {...stroke} />
      <path d="M9 5.25h2.5M9 7.25h2.5M4.5 10.5h7" {...stroke} />
    </Svg>
  ),

  /** Landscape photo */
  media: (props: IconProps) => (
    <Svg {...props}>
      <path d="M2.25 4h11.5v8.5H2.25V4Z" {...stroke} />
      <circle cx="5.5" cy="6.75" r="1.1" {...stroke} />
      <path d="M2.75 11.25 5.5 8.75l2.25 1.75 2-1.5 3.25 2.5" {...stroke} />
    </Svg>
  ),

  /** Plus in rounded square — create actions */
  plus: (props: IconProps) => (
    <Svg {...props}>
      <path d="M3 3h10v10H3V3Z" {...stroke} />
      <path d="M8 5.5v5M5.5 8h5" {...stroke} />
    </Svg>
  ),

  /** Bulleted list */
  list: (props: IconProps) => (
    <Svg {...props}>
      <path d="M6 4.25h7M6 8h7M6 11.75h7" {...stroke} />
      <circle cx="3.5" cy="4.25" r="0.9" fill="currentColor" />
      <circle cx="3.5" cy="8" r="0.9" fill="currentColor" />
      <circle cx="3.5" cy="11.75" r="0.9" fill="currentColor" />
    </Svg>
  ),

  /** Price / category tag */
  tag: (props: IconProps) => (
    <Svg {...props}>
      <path d="M2.5 8.25V2.75H8l5.5 5.5-5.5 5.5-5.5-5.5Z" {...stroke} />
      <circle cx="5.5" cy="5.5" r="1" {...stroke} />
    </Svg>
  ),

  /** Folder */
  folder: (props: IconProps) => (
    <Svg {...props}>
      <path
        d="M2.25 5.25V4a1 1 0 0 1 1-1h3.1l1.4 1.5h5a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-9.5a1 1 0 0 1-1-1V5.25Z"
        {...stroke}
      />
    </Svg>
  ),

  /** Shopping cart */
  cart: (props: IconProps) => (
    <Svg {...props}>
      <path d="M2 3.25h1.6l1.35 7.25h7.6l1.4-5.25H5" {...stroke} />
      <circle cx="7" cy="13" r="1.1" {...stroke} />
      <circle cx="11.5" cy="13" r="1.1" {...stroke} />
    </Svg>
  ),

  /** Clipboard / order sheet */
  orders: (props: IconProps) => (
    <Svg {...props}>
      <path d="M5.25 3.25h5.5v1.5h1.5v9.5h-8.5v-9.5h1.5v-1.5Z" {...stroke} />
      <path d="M6.5 3.25a1.5 1.5 0 0 1 3 0" {...stroke} />
      <path d="M5.75 7.5h4.5M5.75 9.75h4.5M5.75 12h2.75" {...stroke} />
    </Svg>
  ),

  /** Two people */
  users: (props: IconProps) => (
    <Svg {...props}>
      <circle cx="6" cy="5.25" r="2" {...stroke} />
      <path d="M2.25 13c0-2.1 1.7-3.75 3.75-3.75S9.75 10.9 9.75 13" {...stroke} />
      <circle cx="11.25" cy="5.75" r="1.5" {...stroke} />
      <path d="M10.5 9.35c1.55.25 2.75 1.45 2.75 3.15" {...stroke} />
    </Svg>
  ),

  /** 3D box / product */
  product: (props: IconProps) => (
    <Svg {...props}>
      <path d="M2.75 5.25 8 2.75l5.25 2.5v5.5L8 13.25l-5.25-2.5v-5.5Z" {...stroke} />
      <path d="M2.75 5.25 8 7.75l5.25-2.5M8 7.75V13.25" {...stroke} />
    </Svg>
  ),

  /** Ticket / coupon */
  coupon: (props: IconProps) => (
    <Svg {...props}>
      <path
        d="M2.25 5.5c.9 0 1.5-.7 1.5-1.5h8.5c0 .8.6 1.5 1.5 1.5v5c-.9 0-1.5.7-1.5 1.5h-8.5c0-.8-.6-1.5-1.5-1.5v-5Z"
        {...stroke}
      />
      <path d="M9.25 6.25 6.75 9.75" {...stroke} />
      <circle cx="6.75" cy="6.75" r="0.7" fill="currentColor" />
      <circle cx="9.25" cy="9.25" r="0.7" fill="currentColor" />
    </Svg>
  ),

  /** Bar chart */
  chart: (props: IconProps) => (
    <Svg {...props}>
      <path d="M2.5 13.25V2.75M2.5 13.25h11" {...stroke} />
      <path d="M5 10.5V7.25M8 10.5V5M11 10.5V3.75" {...stroke} />
    </Svg>
  ),

  /** Receipt with zig-zag bottom */
  invoice: (props: IconProps) => (
    <Svg {...props}>
      <path d="M4 2.5h8v11l-1.35-1-1.35 1-1.3-1-1.3 1-1.35-1-1.35 1V2.5Z" {...stroke} />
      <path d="M6 5.5h4M6 8h4M6 10.5h2.25" {...stroke} />
    </Svg>
  ),

  /**
   * Cog / gear — true settings icon (not sun rays).
   * Outer ring with six notches + hub.
   */
  settings: (props: IconProps) => (
    <Svg {...props}>
      <path
        d="M6.55 1.6h2.9l.4 1.55c.5.12.96.34 1.38.63l1.5-.7 1.45 2.5-1.25 1c.1.4.15.82.15 1.25s-.05.85-.15 1.25l1.25 1-1.45 2.5-1.5-.7c-.42.29-.88.51-1.38.63l-.4 1.55h-2.9l-.4-1.55a5.1 5.1 0 0 1-1.38-.63l-1.5.7-1.45-2.5 1.25-1A5.4 5.4 0 0 1 2.7 8c0-.43.05-.85.15-1.25l-1.25-1 1.45-2.5 1.5.7c.42-.29.88-.51 1.38-.63l.4-1.55Z"
        {...stroke}
      />
      <circle cx="8" cy="8" r="2.1" {...stroke} />
    </Svg>
  ),

  /** Payment card */
  payment: (props: IconProps) => (
    <Svg {...props}>
      <path d="M2.25 4.25h11.5v7.5H2.25v-7.5Z" {...stroke} />
      <path d="M2.25 6.75h11.5" {...stroke} />
      <path d="M4.5 10h3" {...stroke} />
    </Svg>
  ),

  /** Percent — taxes */
  tax: (props: IconProps) => (
    <Svg {...props}>
      <path d="M3.75 12.25 12.25 3.75" {...stroke} />
      <circle cx="5" cy="5" r="1.6" {...stroke} />
      <circle cx="11" cy="11" r="1.6" {...stroke} />
    </Svg>
  ),

  /** Chat bubble */
  message: (props: IconProps) => (
    <Svg {...props}>
      <path d="M2.75 3.25h10.5v7.25H8.25L5 13.25V10.5H2.75V3.25Z" {...stroke} />
      <path d="M5.25 6h5.5M5.25 8.25h3.5" {...stroke} />
    </Svg>
  ),

  /** A / 文 style translate */
  translate: (props: IconProps) => (
    <Svg {...props}>
      <path d="M2.5 4.25h7M6 4.25S4.75 9 2.75 11.75" {...stroke} />
      <path d="M4 8.25h3.75" {...stroke} />
      <path d="M9.25 13 11.5 6.5 13.75 13M9.85 11h3.05" {...stroke} />
    </Svg>
  ),

  /** Paint brush — wygląd */
  appearance: (props: IconProps) => (
    <Svg {...props}>
      <path
        d="M9.5 2.75c2.4 0 4 1.7 4 3.75 0 1.7-1.15 3-2.65 3.35-.35.08-.6.4-.6.75v.4c0 .55-.45 1-1 1H8.1c-1.9 0-3.45-1.55-3.45-3.45 0-.35.05-.7.15-1.05C5.4 5.2 7.1 2.75 9.5 2.75Z"
        {...stroke}
      />
      <path d="M4.65 11.75c-.85.45-1.9 1.15-1.9 2.1 0 .55.45 1 1 1 1.55 0 2.85-1.2 3.5-2.35" {...stroke} />
      <circle cx="10.75" cy="5.5" r="0.65" fill="currentColor" />
      <circle cx="8.75" cy="4.75" r="0.55" fill="currentColor" />
    </Svg>
  ),

  /** Palette dots — colours */
  colors: (props: IconProps) => (
    <Svg {...props}>
      <circle cx="5.5" cy="6" r="2.15" {...stroke} />
      <circle cx="10.5" cy="6" r="2.15" {...stroke} />
      <circle cx="8" cy="10.5" r="2.15" {...stroke} />
    </Svg>
  ),

  /** Building blocks — components */
  component: (props: IconProps) => (
    <Svg {...props}>
      <path d="M5.75 2.25h4.5v3.5h-4.5v-3.5Z" {...stroke} />
      <path d="M2.25 8h4.5v5.75h-4.5V8Z" {...stroke} />
      <path d="M9.25 8h4.5v5.75h-4.5V8Z" {...stroke} />
    </Svg>
  ),

  /** Book spines — libraries */
  library: (props: IconProps) => (
    <Svg {...props}>
      <path d="M3 2.75v10.5" {...stroke} />
      <path d="M6 2.75v10.5" {...stroke} />
      <path d="M9 3.25 12.75 13" {...stroke} />
      <path d="M9.85 6.5h3" {...stroke} />
    </Svg>
  ),

  /** Magnifying glass — SEO */
  seo: (props: IconProps) => (
    <Svg {...props}>
      <circle cx="7" cy="7" r="4.25" {...stroke} />
      <path d="M10.15 10.15 13.5 13.5" {...stroke} />
    </Svg>
  ),

  /** Cloud with download arrow — backups */
  backup: (props: IconProps) => (
    <Svg {...props}>
      <path
        d="M5 11.5H4.25A2.75 2.75 0 0 1 4.25 6c.2-1.9 1.8-3.4 3.75-3.4 1.7 0 3.15 1.1 3.6 2.65.9.15 1.65.9 1.65 1.85 0 1.05-.85 1.9-1.9 1.9H11"
        {...stroke}
      />
      <path d="M8 8.25v5M6.25 11.5 8 13.25 9.75 11.5" {...stroke} />
    </Svg>
  ),

  /** Globe — site */
  site: (props: IconProps) => (
    <Svg {...props}>
      <circle cx="8" cy="8" r="5.25" {...stroke} />
      <path d="M2.75 8h10.5" {...stroke} />
      <path
        d="M8 2.75c1.65 1.9 2.5 3.7 2.5 5.25S9.65 12.35 8 13.25C6.35 12.35 5.5 10.55 5.5 9S6.35 4.65 8 2.75Z"
        {...stroke}
      />
    </Svg>
  ),

  /** Trend line up — analytics */
  analytics: (props: IconProps) => (
    <Svg {...props}>
      <path d="M2.5 12.5 6 8.25l2.5 2.5L13.5 4.5" {...stroke} />
      <path d="M10 4.5h3.5V8" {...stroke} />
    </Svg>
  ),

  /** Cookie with chips */
  cookie: (props: IconProps) => (
    <Svg {...props}>
      <circle cx="8" cy="8" r="5.25" {...stroke} />
      <circle cx="6" cy="6.5" r="0.75" fill="currentColor" />
      <circle cx="9.75" cy="6.75" r="0.7" fill="currentColor" />
      <circle cx="7.25" cy="9.75" r="0.7" fill="currentColor" />
      <circle cx="10.25" cy="10" r="0.55" fill="currentColor" />
    </Svg>
  ),

  /** Shield — administration / security */
  admin: (props: IconProps) => (
    <Svg {...props}>
      <path
        d="M8 2.25 12.75 4.5v3.6c0 2.9-1.95 5.15-4.75 5.9-2.8-.75-4.75-3-4.75-5.9V4.5L8 2.25Z"
        {...stroke}
      />
      <path d="M6.25 8.1 7.5 9.35 9.9 6.7" {...stroke} />
    </Svg>
  ),

  /** Storefront awning */
  store: (props: IconProps) => (
    <Svg {...props}>
      <path d="M2.5 6.5 4 3.25h8l1.5 3.25" {...stroke} />
      <path d="M2.5 6.5v6.75h11V6.5" {...stroke} />
      <path d="M2.5 6.5h11" {...stroke} />
      <path d="M6.5 13.25V9.5h3v3.75" {...stroke} />
    </Svg>
  ),
} as const

export type NavIconName = keyof typeof navIcons

export function NavIcon({
  name,
  className,
}: {
  name: NavIconName
  className?: string
}) {
  const Icon = navIcons[name]
  return <Icon className={className} />
}
