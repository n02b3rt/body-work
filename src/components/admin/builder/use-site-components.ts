'use client'

import { useCallback, useEffect, useState } from 'react'

/**
 * A saved composition from "Wygląd → Komponenty", as the library panel needs it:
 * the identity and the category it is filed under. The composition's own
 * elements are not fetched here — inserting one only writes a relationship, and
 * the canvas resolves it through `usePopulatedValues`.
 */
export type LibraryComponent = {
  id: string
  category?: null | string
  description?: null | string
  name?: null | string
  slug?: null | string
}

type LibraryState = {
  docs: LibraryComponent[]
  error: null | string
  loading: boolean
}

const LIBRARY_URL = '/api/site-components?limit=200&depth=0&sort=name'

/**
 * The saved compositions, loaded once per builder mount.
 *
 * Editors routinely create one in a second tab and come back, so this exposes
 * `reload` rather than assuming the list is static for the session.
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
    error: null | string
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
