'use client'

import React from 'react'

import { toId, useMediaDocs } from '../use-preview-data'
import { asArray, asRecord, color, columnCount, gap, radius, str } from './helpers'
import { MediaImage } from './MediaImage'

export function FeaturesPreview({ data }: { data: unknown }) {
  const features = asRecord(data)
  const items = asArray(features.items)
  const ids = items.map((item) => toId(item.image)).filter((id): id is string => Boolean(id))
  const media = useMediaDocs(ids)

  const columns = columnCount(features.columns)
  const corner = radius(features.radius, 'md')
  const cards: Record<string, unknown>[] =
    items.length > 0 ? items : new Array(columns).fill({})

  return (
    <div
      className="bw-preview-features"
      style={{
        gap: gap(features.gap),
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
      }}
    >
      {cards.map((item, index) => {
        const id = toId(item.image)
        return (
          <div
            className="bw-preview-features__card"
            key={index}
            style={{
              background: color(features.cardBackground, 'surface.surface'),
              border: `1px solid ${color(features.cardBorder, 'surface.border') ?? 'transparent'}`,
              borderRadius: corner,
            }}
          >
            {id ? (
              <MediaImage
                aspectRatio="1 / 1"
                className="bw-preview-features__icon"
                media={media[id]}
                radius={corner}
              />
            ) : null}
            <strong
              className="bw-preview-features__title"
              style={{ color: color(features.titleColor, 'text.heading') }}
            >
              {str(item.title, `Karta ${index + 1}`)}
            </strong>
            <span
              className="bw-preview-features__text"
              style={{ color: color({ token: 'text.body' }, 'text.body') }}
            >
              {str(item.text, 'Krótki opis korzyści.')}
            </span>
          </div>
        )
      })}
    </div>
  )
}
