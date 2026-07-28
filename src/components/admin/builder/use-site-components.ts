'use client'

import { useCallback, useEffect, useState } from 'react'

import type { ComponentTypeValue } from '@/fields/component-settings'

/**
 * A component from "Wygląd → Komponenty", as the builder needs it: the
 * identity plus the settings group matching its type, which is what the
 * preview renderers take.
 */
export type LibraryComponent = {
  id: string
  name?: string | null
  type?: ComponentTypeValue | string | null
  slug?: string | null
  description?: string | null
} & Record<string, unknown>

type LibraryState = {
  docs: LibraryComponent[]
  error: string | null
  loading: boolean
}

/** `depth=0` keeps upload/relationship values as ids, which is what the preview helpers read. */
const LIBRARY_URL = '/api/site-components?limit=200&depth=0&sort=name'

/**
 * The component library, loaded once per builder mount.
 *
 * Editors routinely create a component in a second tab and come back, so this
 * exposes `reload` rather than assuming the list is static for the session.
 *
 * `loading` is derived by comparing the request counter against the counter the
 * last result carried, rather than set at the top of the effect: setting state
 * synchronously in an effect body trips the React Compiler's
 * `set-state-in-effect` rule, which this project has been caught by before.
 */
export function useSiteComponents(): LibraryState & { reload: () => void } {
  const [nonce, setNonce] = useState(0)
  const [result, setResult] = useState<{
    docs: LibraryComponent[]
    error: string | null
    nonce: number
  }>({ docs: [], error: null, nonce: -1 })

  useEffect(() => {
    let current = true

    fetch(LIBRARY_URL, { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((json: { docs?: LibraryComponent[] }) => {
        if (current) setResult({ docs: json.docs ?? [], error: null, nonce })
      })
      .catch(() => {
        if (current) {
          setResult({
            docs: [],
            error: 'Nie udało się wczytać biblioteki komponentów.',
            nonce,
          })
        }
      })

    return () => {
      current = false
    }
  }, [nonce])

  const reload = useCallback(() => setNonce((value) => value + 1), [])

  return {
    docs: result.docs,
    error: result.error,
    loading: result.nonce !== nonce,
    reload,
  }
}

/** Index by id, so a section can resolve its component in one lookup. */
export function indexById(docs: LibraryComponent[]): Record<string, LibraryComponent> {
  return docs.reduce<Record<string, LibraryComponent>>((acc, doc) => {
    acc[String(doc.id)] = doc
    return acc
  }, {})
}
