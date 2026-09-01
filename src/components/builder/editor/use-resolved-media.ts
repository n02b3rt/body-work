'use client'

import { useEffect, useRef, useState } from 'react'

import { collectMediaIds, type BuilderDoc } from '@/lib/builder/types'
import type { Media } from '@/payload-types'

/**
 * Fetches whatever `Media` documents the tree currently references, so the
 * canvas can render real pictures instead of ids. Cached across renders (a
 * `Map` in a ref) so switching an image and switching it back does not
 * re-fetch — Payload's own REST `where` filter batches the fetch to one
 * request per set of newly-seen ids, not one request per image.
 */
export function useResolvedMedia(doc: BuilderDoc): Record<number, Media> {
  const cache = useRef(new Map<number, Media>())
  const [, forceRender] = useState(0)

  useEffect(() => {
    const ids = collectMediaIds(doc)
    const missing = ids.filter((id) => !cache.current.has(id))
    if (missing.length === 0) return

    let cancelled = false
    const params = new URLSearchParams()
    params.set('where[id][in]', missing.join(','))
    params.set('limit', String(missing.length))
    params.set('depth', '0')

    fetch(`/api/media?${params.toString()}`, { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : { docs: [] }))
      .then((data: { docs?: Media[] }) => {
        if (cancelled) return
        for (const doc of data.docs ?? []) cache.current.set(doc.id, doc)
        forceRender((n) => n + 1)
      })
      .catch(() => {
        // A media fetch failure should not crash the canvas: the affected
        // images just keep showing their "pick a photo" placeholder.
      })

    return () => {
      cancelled = true
    }
  }, [doc])

  return Object.fromEntries(cache.current)
}
