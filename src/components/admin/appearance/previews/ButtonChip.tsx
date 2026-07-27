'use client'

import React from 'react'

import { asRecord, bool, buttonSize, color, radius, str } from './helpers'

/**
 * Renders a button from its parameter group: used by the button preview and
 * by hero/CTA previews that reference a button component.
 */
export function ButtonChip({ data }: { data: unknown }) {
  const button = asRecord(data)
  const variant = str(button.variant, 'solid')
  const size = buttonSize(button.size)
  const background = color(button.background, 'brand.primary')
  const textColor = color(button.textColor, 'text.inverted')
  const borderColor = color(button.borderColor, null)

  const isSolid = variant === 'solid'
  const isOutline = variant === 'outline'
  const isLink = variant === 'link'

  const style: React.CSSProperties = {
    borderRadius: isLink ? 0 : radius(button.radius, 'full'),
    fontSize: size.fontSize,
    padding: isLink ? 0 : size.padding,
    width: bool(button.fullWidth) ? '100%' : undefined,
    background: isSolid ? background : 'transparent',
    color: isSolid ? textColor : (borderColor ?? background),
    border: isOutline
      ? `1.5px solid ${borderColor ?? background ?? 'currentColor'}`
      : '1.5px solid transparent',
    textDecoration: isLink ? 'underline' : 'none',
  }

  return (
    <span className="bw-preview-button" style={style}>
      {str(button.label, 'Przycisk')}
    </span>
  )
}
