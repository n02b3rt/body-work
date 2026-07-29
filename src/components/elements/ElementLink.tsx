/**
 * The link wrapper elements use.
 *
 * In the builder it renders a `span`, not an anchor: clicking a card on the
 * canvas has to select it for editing, and a live link would navigate the panel
 * away. On the site an internal path goes through next-intl's `Link`, so the
 * locale prefix and client-side navigation behave like everywhere else.
 */

import type { CSSProperties, ReactNode } from 'react'

import { Link } from '@/i18n/navigation'

import type { ElementMode } from './types'

type Props = {
  ariaLabel?: string
  children: ReactNode
  className?: string
  href?: unknown
  mode: ElementMode
  newTab?: unknown
  style?: CSSProperties
}

export function ElementLink({
  ariaLabel,
  children,
  className,
  href,
  mode,
  newTab,
  style,
}: Props) {
  const target = typeof href === 'string' ? href.trim() : ''

  if (!target || mode === 'admin') {
    return (
      <span aria-label={ariaLabel} className={className} style={style}>
        {children}
      </span>
    )
  }

  const external = !target.startsWith('/') || target.startsWith('//')
  const tabProps = newTab === true ? { rel: 'noreferrer', target: '_blank' } : {}

  if (external) {
    return (
      <a
        aria-label={ariaLabel}
        className={className}
        href={target}
        rel="noreferrer"
        style={style}
        target={newTab === true ? '_blank' : undefined}
      >
        {children}
      </a>
    )
  }

  return (
    <Link aria-label={ariaLabel} className={className} href={target} style={style} {...tabProps}>
      {children}
    </Link>
  )
}
