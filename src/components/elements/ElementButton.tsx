/**
 * One button row from a `buttons` / `hero` / `cta` element.
 *
 * Buttons stopped being their own document type in the rewrite: a button that
 * has to be identical in ten places is now a saved composition like any other
 * repeated layout.
 */

import type { CSSProperties } from 'react'

import { bool, buttonSize, color, radius, str } from '@/lib/component-values'

import { ElementLink } from './ElementLink'
import type { ElementMode } from './types'

export function ElementButton({ data, mode }: { data: unknown; mode: ElementMode }) {
  const button = (data ?? {}) as Record<string, unknown>
  const label = str(button.label, 'Przycisk')

  const variant = str(button.variant, 'solid')
  const size = buttonSize(button.size)
  const background = color(button.background, 'brand.primary')
  const textColor = color(button.textColor, 'text.inverted')
  const borderColor = color(button.borderColor, null)

  const isSolid = variant === 'solid'
  const isOutline = variant === 'outline'
  const isLink = variant === 'link'

  const style: CSSProperties = {
    background: isSolid ? background : 'transparent',
    borderColor: isOutline ? (borderColor ?? background ?? 'currentColor') : 'transparent',
    borderRadius: isLink ? 0 : radius(button.radius, 'full'),
    color: isSolid ? textColor : (borderColor ?? background),
    fontSize: size.fontSize,
    padding: isLink ? 0 : size.padding,
  }

  const className = [
    'bw-el-btn',
    isLink ? 'bw-el-btn--link' : '',
    bool(button.fullWidth) ? 'bw-el-btn--full' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <ElementLink
      className={className}
      href={button.href}
      mode={mode}
      newTab={button.newTab}
      style={style}
    >
      {label}
    </ElementLink>
  )
}
