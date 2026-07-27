'use client'

import React from 'react'

import { toId, useLinkedComponent, useMediaDocs } from '../use-preview-data'
import { ButtonChip } from './ButtonChip'
import {
  asRecord,
  color,
  flexAlign,
  num,
  radius,
  sectionHeight,
  str,
  textAlign,
} from './helpers'
import { MediaImage } from './MediaImage'

export function HeroPreview({ data }: { data: unknown }) {
  const hero = asRecord(data)
  const imageId = toId(hero.image)
  const media = useMediaDocs(imageId ? [imageId] : [])
  const buttonDoc = useLinkedComponent(toId(hero.ctaButton))

  const overlay = Math.min(Math.max(num(hero.overlayOpacity, 45), 0), 100) / 100
  const corner = radius(hero.radius, 'md')

  return (
    <div
      className="bw-preview-hero"
      style={{ borderRadius: corner, minHeight: sectionHeight(hero.height) }}
    >
      <MediaImage
        aspectRatio={undefined}
        className="bw-preview-hero__image"
        media={imageId ? media[imageId] : undefined}
        placeholder="Wybierz zdjęcie tła"
        radius={corner}
      />
      <div
        className="bw-preview-hero__overlay"
        style={{
          background: color({ token: 'surface.overlay' }, 'surface.overlay'),
          borderRadius: corner,
          opacity: overlay,
        }}
      />
      <div
        className="bw-preview-hero__content"
        style={{
          alignItems: flexAlign(hero.align),
          color: color(hero.textColor, 'text.inverted'),
          textAlign: textAlign(hero.align),
        }}
      >
        <h5 className="bw-preview-hero__heading">
          {str(hero.heading, 'Nagłówek sekcji hero')}
        </h5>
        {str(hero.subheading) ? (
          <p className="bw-preview-hero__sub">{str(hero.subheading)}</p>
        ) : null}
        {buttonDoc?.button ? <ButtonChip data={buttonDoc.button} /> : null}
      </div>
    </div>
  )
}
