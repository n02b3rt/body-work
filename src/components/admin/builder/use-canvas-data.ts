'use client'

/**
 * Turning form state into something the element renderers can draw.
 *
 * On the site, Payload's `depth` hands the renderers fully populated documents:
 * an `image` field is a media document, a `savedComponent` holds the whole
 * composition. In the panel the form only ever holds ids, so the canvas fetches
 * what it needs over the REST API and splices the documents back into a copy of
 * the values.
 *
 * That copy is the whole trick behind sharing one renderer between the builder
 * and the site: the components take **plain, already-resolved data**, so nothing
 * has to travel as a function across the RSC boundary.
 */

import { useEffect, useMemo, useRef, useState } from 'react'

import { toId } from '@/components/admin/appearance/use-preview-data'

/**
 * Keys that hold an upload. An explicit list rather than a schema walk: the
 * element library is ours, the set is small, and a missed key degrades to "no
 * picture in the preview" instead of a crash.
 */
const UPLOAD_KEYS = new Set(['image', 'images', 'file', 'poster'])
const COMPONENT_KEYS = new Set(['component'])

type Docs = Record<string, Record<string, unknown>>

function walk(value: unknown, media: Set<string>, components: Set<string>): void {
  if (Array.isArray(value)) {
    value.forEach((entry) => walk(entry, media, components))
    return
  }
  if (!value || typeof value !== 'object') return

  Object.entries(value as Record<string, unknown>).forEach(([key, entry]) => {
    if (UPLOAD_KEYS.has(key)) {
      const list = Array.isArray(entry) ? entry : [entry]
      list.forEach((item) => {
        const id = toId(item)
        if (id) media.add(id)
      })
      return
    }
    if (COMPONENT_KEYS.has(key)) {
      const id = toId(entry)
      if (id) components.add(id)
      return
    }
    walk(entry, media, components)
  })
}

function replace(value: unknown, media: Docs, components: Docs): unknown {
  if (Array.isArray(value)) return value.map((entry) => replace(entry, media, components))
  if (!value || typeof value !== 'object') return value

  const out: Record<string, unknown> = {}

  Object.entries(value as Record<string, unknown>).forEach(([key, entry]) => {
    if (UPLOAD_KEYS.has(key)) {
      if (Array.isArray(entry)) {
        out[key] = entry.map((item) => {
          const id = toId(item)
          return (id && media[id]) || item
        })
      } else {
        const id = toId(entry)
        out[key] = (id && media[id]) || entry
      }
      return
    }
    if (COMPONENT_KEYS.has(key)) {
      const id = toId(entry)
      out[key] = (id && components[id]) || entry
      return
    }
    out[key] = replace(entry, media, components)
  })

  return out
}

/**
 * Fetches documents by id, keeping what it already has.
 *
 * `pending` is a ref rather than state so a second render while a request is in
 * flight does not queue the same id twice, and nothing calls `setState` from an
 * effect body — the React Compiler rejects that outright in this project.
 */
function useDocs(ids: string[], collection: string, depth: number): Docs {
  const [docs, setDocs] = useState<Docs>({})
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
        fetch(`/api/${collection}/${id}?depth=${depth}`, { credentials: 'include' })
          .then((res) => (res.ok ? res.json() : null))
          .catch(() => null),
      ),
    ).then((results) => {
      missing.forEach((id) => pending.current.delete(id))
      if (!active) return

      const next: Docs = {}
      results.forEach((doc, index) => {
        if (doc) next[missing[index]!] = doc as Record<string, unknown>
      })
      if (Object.keys(next).length > 0) setDocs((current) => ({ ...current, ...next }))
    })

    return () => {
      active = false
    }
  }, [collection, depth, docs, key])

  return docs
}

/** The values, with uploads and saved compositions resolved into documents. */
export function usePopulatedValues<T>(values: T): T {
  const refs = useMemo(() => {
    const media = new Set<string>()
    const components = new Set<string>()
    walk(values, media, components)
    return { components: [...components], media: [...media] }
  }, [values])

  const mediaDocs = useDocs(refs.media, 'media', 0)
  // `depth: 2` so a composition arrives with its own pictures already resolved.
  const componentDocs = useDocs(refs.components, 'site-components', 2)

  return useMemo(
    () => replace(values, mediaDocs, componentDocs) as T,
    [componentDocs, mediaDocs, values],
  )
}
