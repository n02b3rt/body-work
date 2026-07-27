'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

import { resolveThemeColors } from '@/lib/theme-css'
import { THEME_TOKENS, type ThemeTokenPath } from '@/lib/theme-tokens'

export type MediaPreview = {
  id: string
  url?: string | null
  thumbnailURL?: string | null
  alt?: string | null
  caption?: string | null
  mimeType?: string | null
}

const defaultColors = THEME_TOKENS.reduce((acc, token) => {
  acc[token.path] = token.defaultValue
  return acc
}, {} as Record<ThemeTokenPath, string>)

/** Saved palette, so component previews use the real site colours. */
export function useSavedThemeColors(): Record<ThemeTokenPath, string> {
  const [colors, setColors] = useState(defaultColors)

  useEffect(() => {
    let active = true
    fetch('/api/globals/theme-colors?depth=0', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((doc) => {
        if (active && doc) setColors(resolveThemeColors(doc))
      })
      .catch(() => {
        /* preview falls back to token defaults */
      })
    return () => {
      active = false
    }
  }, [])

  return colors
}

/** Extracts an id from a form-state relationship/upload value. */
export function toId(value: unknown): string | null {
  if (typeof value === 'number') return String(value)
  if (typeof value === 'string' && value.length > 0) return value
  if (value && typeof value === 'object') {
    const record = value as { id?: unknown; value?: unknown }
    if (record.id !== undefined) return toId(record.id)
    if (record.value !== undefined) return toId(record.value)
  }
  return null
}

export function toIdList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    const single = toId(value)
    return single ? [single] : []
  }
  return value.map(toId).filter((id): id is string => Boolean(id))
}

/**
 * Fetches media documents referenced by the form, keeping a local cache so
 * editing unrelated fields does not re-request the same files.
 */
export function useMediaDocs(ids: string[]): Record<string, MediaPreview> {
  const [docs, setDocs] = useState<Record<string, MediaPreview>>({})
  const pending = useRef<Set<string>>(new Set())
  const key = useMemo(() => [...new Set(ids)].sort().join(','), [ids])

  useEffect(() => {
    const wanted = key ? key.split(',') : []
    const missing = wanted.filter((id) => !docs[id] && !pending.current.has(id))
    if (missing.length === 0) return

    missing.forEach((id) => pending.current.add(id))
    let active = true

    Promise.all(
      missing.map((id) =>
        fetch(`/api/media/${id}?depth=0`, { credentials: 'include' })
          .then((res) => (res.ok ? res.json() : null))
          .catch(() => null),
      ),
    ).then((results) => {
      missing.forEach((id) => pending.current.delete(id))
      if (!active) return
      const next: Record<string, MediaPreview> = {}
      results.forEach((doc, index) => {
        if (doc) next[missing[index]!] = doc as MediaPreview
      })
      if (Object.keys(next).length > 0) {
        setDocs((current) => ({ ...current, ...next }))
      }
    })

    return () => {
      active = false
    }
  }, [key, docs])

  return docs
}

export type LinkedComponent = {
  id: string
  name?: string | null
  type?: string | null
  button?: Record<string, unknown> | null
}

/** Resolves a referenced component (e.g. the button used inside a hero). */
export function useLinkedComponent(id: string | null): LinkedComponent | null {
  // Keyed by id so clearing the relationship needs no setState in the effect.
  const [entry, setEntry] = useState<{
    doc: LinkedComponent | null
    id: string | null
  }>({ doc: null, id: null })

  useEffect(() => {
    if (!id) return
    let active = true
    fetch(`/api/site-components/${id}?depth=0`, { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((result) => {
        if (active) setEntry({ doc: result as LinkedComponent | null, id })
      })
      .catch(() => {
        if (active) setEntry({ doc: null, id })
      })
    return () => {
      active = false
    }
  }, [id])

  return id && entry.id === id ? entry.doc : null
}
