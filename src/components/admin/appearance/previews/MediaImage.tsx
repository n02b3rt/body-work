'use client'

import React from 'react'

import type { MediaPreview } from '../use-preview-data'

type Props = {
  media?: MediaPreview
  alt?: string
  aspectRatio?: string
  radius?: string
  /** Shown when no file is selected yet. */
  placeholder?: string
  className?: string
}

/** Thumbnail (or a neutral placeholder) used across component previews. */
export function MediaImage({
  alt,
  aspectRatio,
  className,
  media,
  placeholder = 'Brak zdjęcia',
  radius,
}: Props) {
  const src = media?.thumbnailURL || media?.url

  return (
    <div
      className={`bw-preview-image${className ? ` ${className}` : ''}`}
      style={{ aspectRatio, borderRadius: radius }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- admin preview of a media file
        <img alt={alt ?? media?.alt ?? ''} src={src} />
      ) : (
        <span className="bw-preview-image__placeholder">{placeholder}</span>
      )}
    </div>
  )
}
