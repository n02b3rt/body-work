'use client'

import type { Media } from '@/payload-types'
import Link from 'next/link'
import React, { useState } from 'react'

import {
  formatBytes,
  formatDimensions,
  isProbablyImage,
  isProbablyVideo,
  KIND_LABELS,
  mediaDisplayTitle,
  mediaThumbUrl,
  type MediaKind,
} from './media-library-utils'

type Props = {
  doc: Media | null
  adminRoute: string
  onClose: () => void
}

export function MediaDetailsPanel({ doc, adminRoute, onClose }: Props) {
  const [copied, setCopied] = useState(false)

  if (!doc) {
    return (
      <aside className="bw-media__details bw-media__details--empty" aria-label="Szczegóły pliku">
        <p>Wybierz plik, aby zobaczyć podgląd i szczegóły.</p>
      </aside>
    )
  }

  const title = mediaDisplayTitle(doc)
  const thumb = mediaThumbUrl(doc)
  const editHref = `${adminRoute}/c/media/${doc.id}`
  const kind = (doc.kind || 'other') as MediaKind

  const copyUrl = async () => {
    if (!doc.url) return
    try {
      await navigator.clipboard.writeText(
        doc.url.startsWith('http') ? doc.url : `${window.location.origin}${doc.url}`,
      )
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  return (
    <aside className="bw-media__details" aria-label={`Szczegóły: ${title}`}>
      <div className="bw-media__details-head">
        <strong>Szczegóły</strong>
        <button type="button" className="bw-media__icon-btn" onClick={onClose} aria-label="Zamknij">
          ×
        </button>
      </div>

      <div className="bw-media__preview">
        {isProbablyImage(doc) && thumb ? (
          // eslint-disable-next-line @next/next/no-img-element -- admin CMS preview
          <img src={thumb} alt={doc.alt || title} />
        ) : null}
        {isProbablyVideo(doc) && doc.url ? (
          <video src={doc.url} controls preload="metadata" />
        ) : null}
        {!isProbablyImage(doc) && !isProbablyVideo(doc) ? (
          <div className="bw-media__preview-fallback">{doc.mimeType || 'plik'}</div>
        ) : null}
      </div>

      <dl className="bw-media__meta">
        <div>
          <dt>Tytuł</dt>
          <dd>{title}</dd>
        </div>
        <div>
          <dt>ALT</dt>
          <dd>{doc.isDecorative ? '(dekoracyjny)' : doc.alt || ': '}</dd>
        </div>
        <div>
          <dt>Typ</dt>
          <dd>{KIND_LABELS[kind]}</dd>
        </div>
        <div>
          <dt>Plik</dt>
          <dd>{doc.filename || ': '}</dd>
        </div>
        <div>
          <dt>MIME</dt>
          <dd>{doc.mimeType || ': '}</dd>
        </div>
        <div>
          <dt>Rozmiar</dt>
          <dd>{formatBytes(doc.filesize)}</dd>
        </div>
        <div>
          <dt>Wymiary</dt>
          <dd>{formatDimensions(doc.width, doc.height)}</dd>
        </div>
        {doc.caption ? (
          <div>
            <dt>Podpis</dt>
            <dd>{doc.caption}</dd>
          </div>
        ) : null}
        {doc.tags && doc.tags.length > 0 ? (
          <div>
            <dt>Tagi</dt>
            <dd>{doc.tags.join(', ')}</dd>
          </div>
        ) : null}
      </dl>

      <div className="bw-media__details-actions">
        <Link className="bw-media__btn bw-media__btn--primary" href={editHref}>
          Edytuj
        </Link>
        {doc.url ? (
          <button type="button" className="bw-media__btn" onClick={() => void copyUrl()}>
            {copied ? 'Skopiowano URL' : 'Kopiuj URL'}
          </button>
        ) : null}
        {doc.url ? (
          <a className="bw-media__btn" href={doc.url} target="_blank" rel="noreferrer">
            Otwórz
          </a>
        ) : null}
      </div>
    </aside>
  )
}
