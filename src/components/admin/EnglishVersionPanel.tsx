'use client'

import type { UIFieldClientComponent } from 'payload'

import { useConfig, useDocumentInfo } from '@payloadcms/ui'
import React, { useEffect, useState } from 'react'

type Translation = {
  id: number
  status?: 'draft' | 'published'
  title?: string
  content?: unknown
}

type State =
  | { kind: 'loading' }
  | { kind: 'none' }
  | { kind: 'found'; translation: Translation }
  | { kind: 'error' }

/**
 * "English version" panel at the top of a blog post.
 *
 * Editing the English text lives in its own collection (see `PostTranslations` for why the
 * native locale switcher is not in place yet), and hunting for the right document in a list of
 * sixty is not something to ask of a non-technical editor. So this puts the state of the
 * translation on the post itself, with one button that either opens the existing document or
 * starts a new one already pointed at this post.
 *
 * Read-only: it never writes. Creating goes through Payload's own create view, so validation,
 * permissions and versioning all behave normally.
 */
export const EnglishVersionPanel: UIFieldClientComponent = () => {
  const { id } = useDocumentInfo()
  const { config } = useConfig()
  const adminRoute = config.routes?.admin || '/admin'
  const apiRoute = config.routes?.api || '/api'

  const [state, setState] = useState<State>({ kind: 'loading' })

  useEffect(() => {
    // An unsaved post has nothing to translate yet, and the render below already returns null
    // for that case. Setting state here instead would be a synchronous setState inside an
    // effect, which the React Compiler lint rules reject.
    if (!id) return

    let cancelled = false

    const load = async () => {
      // Yield before touching state: calling this synchronously in the effect body is what the
      // React Compiler lint rules reject, and the flag drops a late response after unmount.
      await Promise.resolve()
      if (cancelled) return

      try {
        const params = new URLSearchParams({
          'where[post][equals]': String(id),
          limit: '1',
          depth: '0',
        })
        const res = await fetch(`${apiRoute}/post-translations?${params.toString()}`, {
          credentials: 'include',
        })
        if (!res.ok) throw new Error(String(res.status))

        const json = (await res.json()) as { docs?: Translation[] }
        if (cancelled) return

        const found = json.docs?.[0]
        setState(found ? { kind: 'found', translation: found } : { kind: 'none' })
      } catch {
        if (!cancelled) setState({ kind: 'error' })
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [apiRoute, id])

  if (!id) return null

  const createHref = `${adminRoute}/c/post-translations/create?post=${id}`

  return (
    <div
      style={{
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: 4,
        padding: '1rem 1.25rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        flexWrap: 'wrap',
      }}
    >
      <div style={{ flex: '1 1 18rem' }}>
        <strong style={{ display: 'block', marginBottom: '.25rem' }}>Wersja angielska</strong>

        {state.kind === 'loading' ? <span>Sprawdzam...</span> : null}

        {state.kind === 'error' ? (
          <span>Nie udało się sprawdzić. Zajrzyj do „Tłumaczenia wpisów”.</span>
        ) : null}

        {state.kind === 'none' ? (
          <span>
            Brak. Ten wpis nie pojawia się na angielskiej wersji strony, dopóki tłumaczenie nie
            będzie gotowe.
          </span>
        ) : null}

        {state.kind === 'found' ? (
          <span>
            {state.translation.status === 'published' && state.translation.content
              ? 'Gotowa i opublikowana. Widoczna na /en.'
              : state.translation.status === 'published'
                ? 'Oznaczona jako gotowa, ale brakuje treści, więc jeszcze nie jest publikowana.'
                : 'Szkic. Nie jest jeszcze widoczna na /en.'}
          </span>
        ) : null}
      </div>

      {state.kind === 'found' ? (
        <a className="btn btn--style-primary" href={`${adminRoute}/c/post-translations/${state.translation.id}`}>
          Edytuj po angielsku
        </a>
      ) : null}

      {state.kind === 'none' ? (
        <a className="btn btn--style-primary" href={createHref}>
          Dodaj wersję angielską
        </a>
      ) : null}
    </div>
  )
}
