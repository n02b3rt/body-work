'use client'

/**
 * Picks an existing `Media` document. Reuses the collection's own REST API
 * (`listSearchableFields` on `Media`, `src/collections/Media.ts`) rather than
 * inventing a second search index, and its own upload endpoint, so a file
 * dropped here goes through the same `compressOnUpload` hook and conversion
 * settings as an upload from the panel.
 *
 * A modal, not a field-level dropdown: picking a photo is a big enough
 * decision (right crop, right subject) to deserve the whole screen's width
 * for a grid, the way Elementor's own media modal does.
 */

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

import type { Media } from '@/payload-types'

type MediaPickerProps = {
  accept?: 'image' | 'video'
  onClose: () => void
  onSelect: (id: number) => void
}

const PAGE_SIZE = 48

export function MediaPicker({ accept = 'image', onClose, onSelect }: MediaPickerProps) {
  const [query, setQuery] = useState('')
  // Loading is derived from "do we have a result for this exact query yet", not toggled
  // directly: setting it synchronously at the top of the effect is exactly the pattern the
  // React Compiler's set-state-in-effect rule flags. Same technique as `BlogList.tsx`.
  const [result, setResult] = useState<{ accept: string; query: string; docs: Media[] } | null>(null)
  const loading = result?.accept !== accept || result?.query !== query
  const docs = loading ? [] : result!.docs
  const [uploading, setUploading] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const params = new URLSearchParams()
    params.set('limit', String(PAGE_SIZE))
    params.set('depth', '0')
    params.set('sort', '-updatedAt')
    params.set('where[kind][equals]', accept)
    if (query.trim()) params.set('where[title][like]', query.trim())

    let cancelled = false
    fetch(`/api/media?${params.toString()}`, { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : { docs: [] }))
      .then((data: { docs?: Media[] }) => {
        if (!cancelled) setResult({ accept, query, docs: data.docs ?? [] })
      })
    return () => {
      cancelled = true
    }
  }, [accept, query])

  const handleUpload = async (file: File) => {
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const response = await fetch('/api/media', { method: 'POST', credentials: 'include', body: form })
      if (response.ok) {
        const created = (await response.json()) as { doc: Media }
        onSelect(created.doc.id)
        onClose()
      }
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-navy/50 p-6">
      <div className="flex max-h-[80vh] w-full max-w-4xl flex-col rounded-lg bg-page shadow-xl">
        <div className="flex items-center gap-3 border-b border-line p-4">
          <input
            className="flex-1 rounded-md border border-line px-3 py-2 text-sm"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Szukaj..."
            type="search"
            value={query}
          />
          <button
            className="rounded-md bg-[var(--bw-editor-accent)] px-4 py-2 text-sm text-white hover:bg-[var(--bw-editor-accent-hover)] disabled:opacity-50"
            disabled={uploading}
            onClick={() => fileInput.current?.click()}
            type="button"
          >
            {uploading ? 'Wgrywanie…' : 'Wgraj plik'}
          </button>
          <input
            accept={accept === 'image' ? 'image/*' : 'video/*'}
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) handleUpload(file)
            }}
            ref={fileInput}
            type="file"
          />
          <button className="text-muted hover:text-text-heading" onClick={onClose} type="button">
            Zamknij
          </button>
        </div>
        <div className="grid flex-1 grid-cols-4 gap-3 overflow-y-auto p-4 sm:grid-cols-6">
          {loading ? (
            <p className="col-span-full text-center text-sm text-muted">Ładowanie…</p>
          ) : docs.length === 0 ? (
            <p className="col-span-full text-center text-sm text-muted">Brak wyników.</p>
          ) : (
            docs.map((doc) => (
              <button
                className="group relative aspect-square overflow-hidden rounded-md border border-line hover:border-[var(--bw-editor-accent)]"
                key={doc.id}
                onClick={() => {
                  onSelect(doc.id)
                  onClose()
                }}
                type="button"
              >
                {doc.sizes?.thumbnail?.url ? (
                  <Image alt={doc.alt || ''} className="object-cover" fill sizes="200px" src={doc.sizes.thumbnail.url} />
                ) : (
                  <span className="flex h-full items-center justify-center text-xs text-muted">
                    {doc.filename}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
