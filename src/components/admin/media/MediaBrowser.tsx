'use client'

import type { Media } from '@/payload-types'
import { useRouter } from 'next/navigation'
import React from 'react'

import {
  formatBytes,
  formatDimensions,
  isProbablyImage,
  mediaDisplayTitle,
  mediaThumbUrl,
  type LibraryView,
} from './media-library-utils'

type Group = {
  key: string
  label: string
  items: Media[]
}

type Props = {
  groups: Group[]
  view: LibraryView
  showGroupTitles: boolean
  selectedId: number | null
  adminRoute: string
  onSelect: (id: number) => void
}

export function MediaBrowser({
  groups,
  view,
  showGroupTitles,
  selectedId,
  adminRoute,
  onSelect,
}: Props) {
  const router = useRouter()

  // Was `window.location.href = …`, which the React Compiler lint rules reject (assigning
  // to a value it treats as immutable: the same rule that caught `document.cookie` in
  // PromoBar). `router.push` is also the better behaviour here, it navigates client-side
  // inside the admin instead of reloading the whole panel.
  const openDoc = (id: number) => {
    router.push(`${adminRoute}/c/media/${id}`)
  }

  return (
    <>
      {groups.map((group) => (
        <section key={group.key} className="bw-media__group">
          {showGroupTitles ? (
            <h2 className="bw-media__group-title">
              {group.label}
              <span>{group.items.length}</span>
            </h2>
          ) : null}

          {view === 'grid' ? (
            <ul className="bw-media__grid">
              {group.items.map((doc) => {
                const thumb = mediaThumbUrl(doc)
                const active = doc.id === selectedId
                return (
                  <li key={doc.id}>
                    <button
                      type="button"
                      className={`bw-media__card${active ? ' is-active' : ''}`}
                      onClick={() => onSelect(doc.id)}
                      onDoubleClick={() => openDoc(doc.id)}
                    >
                      <div className="bw-media__card-thumb">
                        {isProbablyImage(doc) && thumb ? (
                          // eslint-disable-next-line @next/next/no-img-element -- admin CMS preview
                          <img src={thumb} alt="" />
                        ) : (
                          <span className="bw-media__card-badge">
                            {(doc.mimeType || 'file').split('/').pop()}
                          </span>
                        )}
                      </div>
                      <span className="bw-media__card-name">{mediaDisplayTitle(doc)}</span>
                      <span className="bw-media__card-meta">{formatBytes(doc.filesize)}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          ) : (
            <div className="bw-media__table-wrap">
              <table className="bw-media__table">
                <thead>
                  <tr>
                    <th>Nazwa</th>
                    <th>ALT</th>
                    <th>Typ</th>
                    <th>Wymiary</th>
                    <th>Rozmiar</th>
                  </tr>
                </thead>
                <tbody>
                  {group.items.map((doc) => {
                    const active = doc.id === selectedId
                    return (
                      <tr
                        key={doc.id}
                        className={active ? 'is-active' : undefined}
                        onClick={() => onSelect(doc.id)}
                        onDoubleClick={() => openDoc(doc.id)}
                      >
                        <td>{mediaDisplayTitle(doc)}</td>
                        <td>{doc.isDecorative ? '(dekoracyjny)' : doc.alt || ': '}</td>
                        <td>{doc.mimeType || ': '}</td>
                        <td>{formatDimensions(doc.width, doc.height)}</td>
                        <td>{formatBytes(doc.filesize)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ))}
    </>
  )
}
