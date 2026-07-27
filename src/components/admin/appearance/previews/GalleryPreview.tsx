'use client'

import React from 'react'

import { toIdList, useMediaDocs } from '../use-preview-data'
import { asRecord, aspect, bool, columnCount, gap, radius } from './helpers'
import { MediaImage } from './MediaImage'

export function GalleryPreview({ data }: { data: unknown }) {
  const gallery = asRecord(data)
  const ids = toIdList(gallery.images)
  const media = useMediaDocs(ids)

  const columns = columnCount(gallery.columns)
  const corner = radius(gallery.radius, 'md')
  const ratio = aspect(gallery.aspectRatio, '1-1')
  const tiles = ids.length > 0 ? ids : new Array(columns).fill(null)

  return (
    <div className="bw-preview-gallery">
      <div
        className="bw-preview-gallery__grid"
        style={{
          gap: gap(gallery.gap),
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        }}
      >
        {tiles.map((id: string | null, index: number) => {
          const doc = id ? media[id] : undefined
          return (
            <figure className="bw-preview-gallery__tile" key={id ?? `empty-${index}`}>
              <MediaImage
                aspectRatio={ratio}
                media={doc}
                placeholder="Dodaj zdjęcia"
                radius={corner}
              />
              {bool(gallery.showCaptions) && doc?.caption ? (
                <figcaption className="bw-preview-gallery__caption">
                  {doc.caption}
                </figcaption>
              ) : null}
            </figure>
          )
        })}
      </div>
      <p className="bw-preview-meta">
        {ids.length} {ids.length === 1 ? 'zdjęcie' : 'zdjęć'} ·{' '}
        {bool(gallery.lightbox) ? 'z powiększaniem' : 'bez powiększania'}
      </p>
    </div>
  )
}
