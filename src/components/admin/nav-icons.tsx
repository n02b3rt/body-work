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
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      {children}
    </svg>
  )
}

const stroke = {
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export const navIcons = {
  dashboard: (props: IconProps) => (
    <Svg {...props}>
      <path d="M2.5 2.5h4.5v4.5H2.5V2.5Z" {...stroke} />
      <path d="M9 2.5h4.5v3H9v-3Z" {...stroke} />
      <path d="M9 7.5h4.5v6H9v-6Z" {...stroke} />
      <path d="M2.5 9h4.5v4.5H2.5V9Z" {...stroke} />
    </Svg>
  ),
  updates: (props: IconProps) => (
    <Svg {...props}>
      <path d="M8 2.5v5l3 1.5" {...stroke} />
      <circle cx="8" cy="8" r="5.5" {...stroke} />
    </Svg>
  ),
  content: (props: IconProps) => (
    <Svg {...props}>
      <path d="M4 2.5h6.5L13 5v8.5H4V2.5Z" {...stroke} />
      <path d="M10.5 2.5V5H13" {...stroke} />
      <path d="M6 8h4M6 10.5h4" {...stroke} />
    </Svg>
  ),
  pages: (props: IconProps) => (
    <Svg {...props}>
      <path d="M3.5 2.5h6l3 3v8H3.5v-11Z" {...stroke} />
      <path d="M9.5 2.5v3h3" {...stroke} />
    </Svg>
  ),
  blog: (props: IconProps) => (
    <Svg {...props}>
      <path d="M3 3.5h10v9H3v-9Z" {...stroke} />
      <path d="M5.5 6.5h5M5.5 9h3.5" {...stroke} />
    </Svg>
  ),
  media: (props: IconProps) => (
    <Svg {...props}>
      <path d="M2.5 4.5h11v8h-11v-8Z" {...stroke} />
      <path d="M2.5 10.5l3-2.5 2.5 2 2-1.5 3.5 2" {...stroke} />
      <circle cx="6" cy="7" r="1" fill="currentColor" />
    </Svg>
  ),
  plus: (props: IconProps) => (
    <Svg {...props}>
      <path d="M8 3.5v9M3.5 8h9" {...stroke} />
    </Svg>
  ),
  list: (props: IconProps) => (
    <Svg {...props}>
      <path d="M5.5 4.5h7M5.5 8h7M5.5 11.5h7" {...stroke} />
      <path d="M3.5 4.5h.01M3.5 8h.01M3.5 11.5h.01" {...stroke} />
    </Svg>
  ),
  tag: (props: IconProps) => (
    <Svg {...props}>
      <path d="M2.5 8.5V3.5H7.5l6 6-5 5-6-6Z" {...stroke} />
      <circle cx="5.25" cy="5.25" r="0.75" fill="currentColor" />
    </Svg>
  ),
  folder: (props: IconProps) => (
    <Svg {...props}>
      <path d="M2.5 5.5V12.5h11V6.5H8L6.5 5H2.5v.5Z" {...stroke} />
    </Svg>
  ),
  cart: (props: IconProps) => (
    <Svg {...props}>
      <path d="M2.5 3.5h1.5l1.5 7h7l1.5-5H5" {...stroke} />
      <circle cx="7" cy="13" r="1" fill="currentColor" />
      <circle cx="11.5" cy="13" r="1" fill="currentColor" />
    </Svg>
  ),
  orders: (props: IconProps) => (
    <Svg {...props}>
      <path d="M4 3.5h8v10H4v-10Z" {...stroke} />
      <path d="M6 6h4M6 8.5h4M6 11h2.5" {...stroke} />
    </Svg>
  ),
  users: (props: IconProps) => (
    <Svg {...props}>
      <circle cx="6" cy="5.5" r="2" {...stroke} />
      <path d="M2.5 12.5c0-2 1.5-3.5 3.5-3.5s3.5 1.5 3.5 3.5" {...stroke} />
      <circle cx="11" cy="6" r="1.5" {...stroke} />
      <path d="M10 9c1.5.2 2.5 1.3 2.5 2.8" {...stroke} />
    </Svg>
  ),
  product: (props: IconProps) => (
    <Svg {...props}>
      <path d="M3 5.5 8 3l5 2.5v5L8 13l-5-2.5v-5Z" {...stroke} />
      <path d="M8 8v5M3 5.5 8 8l5-2.5" {...stroke} />
    </Svg>
  ),
  coupon: (props: IconProps) => (
    <Svg {...props}>
      <path d="M2.5 6.5c1 0 1.5-.8 1.5-1.5h8c0 .7.5 1.5 1.5 1.5v3c-1 0-1.5.8-1.5 1.5h-8c0-.7-.5-1.5-1.5-1.5v-3Z" {...stroke} />
      <path d="M9.5 6.5 6.5 9.5" {...stroke} />
    </Svg>
  ),
  chart: (props: IconProps) => (
    <Svg {...props}>
      <path d="M2.5 13V3.5M2.5 13h11" {...stroke} />
      <path d="M5 10.5v-3M8 10.5V6M11 10.5V4.5" {...stroke} />
    </Svg>
  ),
  invoice: (props: IconProps) => (
    <Svg {...props}>
      <path d="M4 2.5h8v11l-1.5-1-1.5 1-1.5-1-1.5 1-1.5-1-1.5 1v-11Z" {...stroke} />
      <path d="M6 6h4M6 8.5h4" {...stroke} />
    </Svg>
  ),
  settings: (props: IconProps) => (
    <Svg {...props}>
      <circle cx="8" cy="8" r="2.25" {...stroke} />
      <path
        d="M8 2.5v1.5M8 12v1.5M2.5 8H4M12 8h1.5M3.9 3.9l1.1 1.1M11 11l1.1 1.1M12.1 3.9 11 5M5 11l-1.1 1.1"
        {...stroke}
      />
    </Svg>
  ),
  payment: (props: IconProps) => (
    <Svg {...props}>
      <path d="M2.5 4.5h11v7h-11v-7Z" {...stroke} />
      <path d="M2.5 7h11" {...stroke} />
      <path d="M5 10h2.5" {...stroke} />
    </Svg>
  ),
  tax: (props: IconProps) => (
    <Svg {...props}>
      <path d="M3.5 12.5 12.5 3.5M5.5 4.5h.01M10.5 11.5h.01" {...stroke} />
    </Svg>
  ),
  message: (props: IconProps) => (
    <Svg {...props}>
      <path d="M3 3.5h10v7H8l-3 2.5V10.5H3v-7Z" {...stroke} />
    </Svg>
  ),
  translate: (props: IconProps) => (
    <Svg {...props}>
      <path d="M3 4.5h6M6 4.5S5 9 3 11.5M4 8.5h3.5" {...stroke} />
      <path d="M9 12.5l2-6 2 6M9.75 10.5h2.5" {...stroke} />
    </Svg>
  ),
  appearance: (props: IconProps) => (
    <Svg {...props}>
      <circle cx="8" cy="8" r="5.5" {...stroke} />
      <path d="M8 2.5v11M8 8c-3 0-5.5-1.5-5.5-3.5" {...stroke} />
    </Svg>
  ),
  colors: (props: IconProps) => (
    <Svg {...props}>
      <circle cx="6" cy="6.5" r="2.25" {...stroke} />
      <circle cx="10.5" cy="6.5" r="2.25" {...stroke} />
      <circle cx="8" cy="10.5" r="2.25" {...stroke} />
    </Svg>
  ),
  component: (props: IconProps) => (
    <Svg {...props}>
      <path d="M5.5 2.5h5v3h-5v-3Z" {...stroke} />
      <path d="M2.5 8h5v5.5h-5V8Z" {...stroke} />
      <path d="M8.5 8h5v5.5h-5V8Z" {...stroke} />
    </Svg>
  ),
  library: (props: IconProps) => (
    <Svg {...props}>
      <path d="M3.5 3v10M6.5 3v10M9 3.5 12.5 13M9.75 6.5h3" {...stroke} />
    </Svg>
  ),
  seo: (props: IconProps) => (
    <Svg {...props}>
      <circle cx="7" cy="7" r="4" {...stroke} />
      <path d="M10 10.5 13.5 14" {...stroke} />
    </Svg>
  ),
  backup: (props: IconProps) => (
    <Svg {...props}>
      <path d="M4 10.5a4 4 0 1 1 1.5 3" {...stroke} />
      <path d="M4 14v-3.5H7.5" {...stroke} />
      <path d="M6.5 5.5h3v4h-3v-4Z" {...stroke} />
    </Svg>
  ),
  site: (props: IconProps) => (
    <Svg {...props}>
      <circle cx="8" cy="8" r="5.5" {...stroke} />
      <path d="M2.5 8h11M8 2.5c1.8 2 2.7 4 2.7 5.5S9.8 12 8 13.5C6.2 12 5.3 10 5.3 8.5S6.2 4.5 8 2.5Z" {...stroke} />
    </Svg>
  ),
  analytics: (props: IconProps) => (
    <Svg {...props}>
      <path d="M3 12.5 6.5 8l2.5 2.5L13 5" {...stroke} />
      <path d="M10.5 5H13v2.5" {...stroke} />
    </Svg>
  ),
  cookie: (props: IconProps) => (
    <Svg {...props}>
      <circle cx="8" cy="8" r="5.5" {...stroke} />
      <circle cx="6" cy="6.5" r="0.75" fill="currentColor" />
      <circle cx="9.5" cy="7" r="0.75" fill="currentColor" />
      <circle cx="7.5" cy="10" r="0.75" fill="currentColor" />
    </Svg>
  ),
  admin: (props: IconProps) => (
    <Svg {...props}>
      <path d="M8 2.5 12.5 5v3.5c0 3-2 5-4.5 5.5-2.5-.5-4.5-2.5-4.5-5.5V5L8 2.5Z" {...stroke} />
    </Svg>
  ),
  store: (props: IconProps) => (
    <Svg {...props}>
      <path d="M2.5 6.5 4 3.5h8l1.5 3v7h-11v-7Z" {...stroke} />
      <path d="M2.5 6.5h11" {...stroke} />
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
