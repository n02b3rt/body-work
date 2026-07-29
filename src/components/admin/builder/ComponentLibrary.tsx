'use client'

import React, { useMemo, useState } from 'react'

import { COMPONENT_TYPES } from '@/fields/component-settings'

import type { LibraryComponent } from './use-site-components'

type Props = {
  docs: LibraryComponent[]
  error: string | null
  loading: boolean
  onInsert: (doc: LibraryComponent) => void
  onReload: () => void
  disabled?: boolean
}

/**
 * The palette editors add sections from: every document in
 * "Zarządzanie → Wygląd → Komponenty", grouped by type.
 */
export function ComponentLibrary({
  disabled,
  docs,
  error,
  loading,
  onInsert,
  onReload,
}: Props) {
  const [query, setQuery] = useState('')

  const groups = useMemo(() => {
    const needle = query.trim().toLowerCase()
    const matches = needle
      ? docs.filter((doc) =>
          `${doc.name ?? ''} ${doc.slug ?? ''} ${doc.description ?? ''}`
            .toLowerCase()
            .includes(needle),
        )
      : docs

    return COMPONENT_TYPES.map((type) => ({
      type,
      items: matches.filter((doc) => doc.type === type.value),
    })).filter((group) => group.items.length > 0)
  }, [docs, query])

  return (
    <aside className="bw-builder__library">
      <div className="bw-builder__library-head">
        <h4 className="bw-builder__panel-title">Biblioteka</h4>
        <button
          className="bw-builder__ghost-btn"
          onClick={onReload}
          title="Odśwież listę komponentów"
          type="button"
        >
          Odśwież
        </button>
      </div>

      <input
        className="bw-builder__search"
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Szukaj komponentu"
        type="search"
        value={query}
      />

      {loading ? <p className="bw-builder__hint">Wczytywanie…</p> : null}
      {error ? <p className="bw-builder__hint bw-builder__hint--error">{error}</p> : null}

      {!loading && !error && docs.length === 0 ? (
        <p className="bw-builder__hint">
          Nie ma jeszcze żadnych komponentów. Dodaj pierwszy w Zarządzanie → Wygląd →
          Komponenty.
        </p>
      ) : null}

      {!loading && !error && docs.length > 0 && groups.length === 0 ? (
        <p className="bw-builder__hint">Brak komponentów pasujących do wyszukiwania.</p>
      ) : null}

      <div className="bw-builder__library-groups">
        {groups.map(({ items, type }) => (
          <section className="bw-builder__library-group" key={type.value}>
            <h5 className="bw-builder__library-group-title">{type.label}</h5>
            <ul className="bw-builder__library-list">
              {items.map((doc) => (
                <li key={doc.id}>
                  <button
                    className="bw-builder__library-item"
                    disabled={disabled}
                    onClick={() => onInsert(doc)}
                    title={doc.description ?? type.hint}
                    type="button"
                  >
                    <span className="bw-builder__library-item-name">
                      {doc.name ?? 'Bez nazwy'}
                    </span>
                    <span className="bw-builder__library-item-add" aria-hidden="true">
                      +
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <a
        className="bw-builder__library-link"
        href="/admin/c/site-components/create"
        rel="noreferrer"
        target="_blank"
      >
        Nowy komponent
      </a>
    </aside>
  )
}
