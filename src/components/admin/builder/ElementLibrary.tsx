'use client'

import React, { useMemo, useState } from 'react'

import {
  COMPOSITION_CATEGORIES,
  ELEMENT_CATEGORIES,
  ELEMENT_DEFINITIONS,
} from '@/lib/element-catalog'

import type { LibraryComponent } from './use-site-components'

type Props = {
  /** Block slugs allowed where the next element will land (a column takes no columns). */
  available: string[]
  compositions: LibraryComponent[]
  compositionsError: null | string
  compositionsLoading: boolean
  disabled: boolean
  onInsert: (slug: string, seed?: Record<string, unknown>) => void
  onReload: () => void
  /** Where the next click will insert, spelled out so nothing lands by surprise. */
  targetLabel: string
}

function matches(query: string, ...values: (null | string | undefined)[]): boolean {
  if (!query) return true
  const needle = query.trim().toLowerCase()
  return values.some((value) => (value ?? '').toLowerCase().includes(needle))
}

/**
 * The palette: built-in elements grouped by kind, then the editor's own saved
 * compositions.
 *
 * Clicking inserts at the current target rather than starting a drag. Dragging
 * from a scrolling panel into a nested canvas is where builders of this kind
 * usually break down, and reordering on the canvas covers the same ground.
 */
export function ElementLibrary({
  available,
  compositions,
  compositionsError,
  compositionsLoading,
  disabled,
  onInsert,
  onReload,
  targetLabel,
}: Props) {
  const [query, setQuery] = useState('')

  const groups = useMemo(
    () =>
      ELEMENT_CATEGORIES.map((category) => ({
        ...category,
        items: ELEMENT_DEFINITIONS.filter(
          (element) =>
            element.category === category.slug &&
            available.includes(element.slug) &&
            matches(query, element.label, element.hint),
        ),
      })).filter((group) => group.items.length > 0),
    [available, query],
  )

  const savedGroups = useMemo(() => {
    const visible = compositions.filter((doc) =>
      matches(query, doc.name, doc.slug, doc.description),
    )
    const byCategory = new Map<string, LibraryComponent[]>()
    visible.forEach((doc) => {
      const key = doc.category ?? 'other'
      byCategory.set(key, [...(byCategory.get(key) ?? []), doc])
    })
    return [...byCategory.entries()].map(([key, docs]) => ({
      docs,
      label: COMPOSITION_CATEGORIES[key] ?? 'Inne',
    }))
  }, [compositions, query])

  const canInsertSaved = available.includes('savedComponent')

  return (
    <aside className="bw-builder__library">
      <h4 className="bw-builder__panel-title">Biblioteka</h4>
      <p className="bw-builder__hint">
        Kliknij element, aby dodać go do: <strong>{targetLabel}</strong>.
      </p>

      <input
        aria-label="Szukaj elementu"
        className="bw-builder__input"
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Szukaj…"
        value={query}
      />

      <div className="bw-builder__library-list">
        {groups.map((group) => (
          <section className="bw-builder__library-group" key={group.slug}>
            <h5 className="bw-builder__library-heading">{group.label}</h5>
            {group.items.map((element) => (
              <button
                className="bw-builder__library-item"
                disabled={disabled}
                key={element.slug}
                onClick={() => onInsert(element.slug)}
                title={element.hint}
                type="button"
              >
                <span className="bw-builder__library-name">{element.label}</span>
                <span className="bw-builder__library-meta">{element.hint}</span>
              </button>
            ))}
          </section>
        ))}

        {canInsertSaved ? (
          <section className="bw-builder__library-group">
            <h5 className="bw-builder__library-heading">
              Moje komponenty
              <button
                className="bw-builder__link-button"
                onClick={onReload}
                type="button"
              >
                odśwież
              </button>
            </h5>

            {compositionsLoading ? <p className="bw-builder__hint">Wczytywanie…</p> : null}
            {compositionsError ? (
              <p className="bw-builder__notice">{compositionsError}</p>
            ) : null}

            {!compositionsLoading && !compositionsError && compositions.length === 0 ? (
              <p className="bw-builder__hint">
                Nie masz jeszcze zapisanych złożeń. Zbuduj je w{' '}
                <a href="/admin/c/site-components" rel="noreferrer" target="_blank">
                  Wygląd → Komponenty
                </a>
                .
              </p>
            ) : null}

            {savedGroups.map((group) => (
              <div key={group.label}>
                <p className="bw-builder__library-subheading">{group.label}</p>
                {group.docs.map((doc) => (
                  <button
                    className="bw-builder__library-item"
                    disabled={disabled}
                    key={doc.id}
                    onClick={() => onInsert('savedComponent', { component: doc.id })}
                    type="button"
                  >
                    <span className="bw-builder__library-name">{doc.name ?? 'Bez nazwy'}</span>
                    {doc.description ? (
                      <span className="bw-builder__library-meta">{doc.description}</span>
                    ) : null}
                  </button>
                ))}
              </div>
            ))}
          </section>
        ) : null}
      </div>
    </aside>
  )
}
