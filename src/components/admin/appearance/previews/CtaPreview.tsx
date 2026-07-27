'use client'

import React from 'react'

import { toId, useLinkedComponent } from '../use-preview-data'
import { ButtonChip } from './ButtonChip'
import { asRecord, color, flexAlign, radius, str, textAlign } from './helpers'

const PADDING = { sm: '1rem 1.25rem', md: '1.75rem 2rem', lg: '2.75rem 2rem' } as const

export function CtaPreview({ data }: { data: unknown }) {
  const cta = asRecord(data)
  const buttonDoc = useLinkedComponent(toId(cta.button))
  const paddingKey = str(cta.padding, 'md') as keyof typeof PADDING

  return (
    <div
      className="bw-preview-cta"
      style={{
        alignItems: flexAlign(cta.align),
        background: color(cta.background, 'brand.secondary'),
        borderRadius: radius(cta.radius, 'lg'),
        color: color(cta.textColor, 'text.inverted'),
        padding: PADDING[paddingKey] ?? PADDING.md,
        textAlign: textAlign(cta.align),
      }}
    >
      <strong className="bw-preview-cta__heading">
        {str(cta.heading, 'Nagłówek paska CTA')}
      </strong>
      {str(cta.text) ? <p className="bw-preview-cta__text">{str(cta.text)}</p> : null}
      {buttonDoc?.button ? <ButtonChip data={buttonDoc.button} /> : null}
    </div>
  )
}
