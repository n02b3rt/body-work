'use client'

import type { Media } from '@/payload-types'
import type { ListViewClientProps } from 'payload'
import { Gutter, useConfig } from '@payloadcms/ui'
import Link from 'next/link'
import React, { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react'

import { MediaBrowser } from './MediaBrowser'
import { MediaDetailsPanel } from './MediaDetailsPanel'
import {
  KIND_FOLDER_ORDER,
  KIND_LABELS,
  setPreference,
  SORT_OPTIONS,
  storageKey,
  subscribePreferences,
  type KindFilter,
  type LibraryView,
  type SortKey,
} from './media-library-utils'

const VIEW_KEY = 'bw-media-view'
const DETAILS_KEY = 'bw-media-details'
const GROUP_KEY = 'bw-media-group'

type ApiResponse = {
  docs: Media[]
  totalDocs: number
  totalPages: number
  page: number
}

export function MediaLibrary(props: ListViewClientProps) {
  const { hasCreatePermission, newDocumentURL } = props
  const { config } = useConfig()
  const adminRoute = config.routes?.admin || '/admin'
  const apiRoute = config.routes?.api || '/api'

  const [docs, setDocs] = useState<Media[]>([])
  const [totalDocs, setTotalDocs] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Read straight from localStorage through the store, see `subscribePreferences`. The
  // previous version copied these into state inside an effect, which the React Compiler
  // lint rules reject and which also flashed the defaults on every mount.
  const view = useSyncExternalStore(
    subscribePreferences,
    () => storageKey(VIEW_KEY, 'grid') as LibraryView,
    () => 'grid' as LibraryView,
  )
  const showDetails = useSyncExternalStore(
    subscribePreferences,
    () => storageKey(DETAILS_KEY, '1') === '1',
    () => true,
  )
  const groupByKind = useSyncExternalStore(
    subscribePreferences,
    () => storageKey(GROUP_KEY, '1') === '1',
    () => true,
  )
  const [kind, setKind] = useState<KindFilter>('all')
  const [sort, setSort] = useState<SortKey>('-createdAt')
  const [query, setQuery] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        limit: '48',
        page: String(page),
        depth: '0',
        sort,
      })
      const q = query.trim()
      if (q) {
        params.set('where[or][0][title][contains]', q)
        params.set('where[or][1][filename][contains]', q)
        params.set('where[or][2][alt][contains]', q)
        params.set('where[or][3][slug][contains]', q)
      }
      if (kind !== 'all') params.set('where[kind][equals]', kind)

      const res = await fetch(`${apiRoute}/media?${params.toString()}`, {
        credentials: 'include',
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = (await res.json()) as ApiResponse
      const nextDocs = json.docs || []
      setDocs(nextDocs)
      setTotalDocs(json.totalDocs || 0)
      setTotalPages(json.totalPages || 1)
      setSelectedId((current) => {
        if (current != null && nextDocs.some((d) => d.id === current)) return current
        return nextDocs[0]?.id ?? null
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nie udało się wczytać mediów')
    } finally {
      setLoading(false)
    }
  }, [apiRoute, kind, page, query, sort])

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      // Yield before touching state. Calling `load()` straight from the effect body runs
      // its `setLoading(true)` synchronously, which the React Compiler lint rules reject,
      // `PagesTree` hit the same thing. The flag also closes the unmount race, so a
      // response that lands after the view is gone is dropped instead of applied.
      await Promise.resolve()
      if (cancelled) return
      await load()
    }

    void run()

    return () => {
      cancelled = true
    }
  }, [load])

  const selected = useMemo(
    () => docs.find((d) => d.id === selectedId) || null,
    [docs, selectedId],
  )

  const grouped = useMemo(() => {
    if (!groupByKind || kind !== 'all') {
      return [
        {
          key: String(kind),
          label: kind === 'all' ? 'Wszystkie pliki' : KIND_LABELS[kind],
          items: docs,
        },
      ]
    }
    return KIND_FOLDER_ORDER.map((k) => ({
      key: k,
      label: KIND_LABELS[k],
      items: docs.filter((d) => (d.kind || 'other') === k),
    })).filter((g) => g.items.length > 0)
  }, [docs, groupByKind, kind])

  const createHref = newDocumentURL || `${adminRoute}/c/media/create`

  const changeView = (next: LibraryView) => setPreference(VIEW_KEY, next)

  const toggleDetails = () => setPreference(DETAILS_KEY, showDetails ? '0' : '1')

  const toggleGroup = () => setPreference(GROUP_KEY, groupByKind ? '0' : '1')

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault()
    setPage(1)
    setQuery(searchInput)
  }

  return (
    // Same horizontal inset as DefaultListView (Payload `--gutter-h`). Custom
    // list views replace that shell entirely, so without Gutter content sits
    // flush against the panel edges.
    <Gutter className="bw-media collection-list__wrap">
      <header className="bw-media__header">
        <div className="bw-media__header-text">
          <h1 className="bw-media__title">Media</h1>
          <p className="bw-media__lead">
            Biblioteka plików: siatka, lista i foldery według typu. ALT i slug
            uzupełniają się z nazwy pliku.
          </p>
        </div>
        <div className="bw-media__header-actions">
          {hasCreatePermission ? (
            <Link
              className="bw-media__btn bw-media__btn--primary"
              href={createHref}
            >
              Prześlij plik
            </Link>
          ) : null}
          <button
            type="button"
            className="bw-media__btn"
            onClick={() => void load()}
          >
            Odśwież
          </button>
        </div>
      </header>

      <div className="bw-media__layout">
        <nav className="bw-media__folders" aria-label="Foldery według typu">
          <button
            type="button"
            className={`bw-media__folder${kind === 'all' ? ' is-active' : ''}`}
            onClick={() => {
              setKind('all')
              setPage(1)
            }}
          >
            <span>Wszystkie</span>
            {kind === 'all' && totalDocs > 0 ? <span>{totalDocs}</span> : null}
          </button>
          {KIND_FOLDER_ORDER.map((k) => (
            <button
              key={k}
              type="button"
              className={`bw-media__folder${kind === k ? ' is-active' : ''}`}
              onClick={() => {
                setKind(k)
                setPage(1)
              }}
            >
              <span>{KIND_LABELS[k]}</span>
            </button>
          ))}
        </nav>

        <div className="bw-media__main">
          <div className="bw-media__toolbar">
            <div className="bw-media__toolbar-primary">
              <form className="bw-media__search" onSubmit={submitSearch}>
                <input
                  type="search"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Szukaj tytułu, pliku, ALT…"
                  aria-label="Szukaj w mediach"
                />
                <button type="submit" className="bw-media__btn">
                  Szukaj
                </button>
              </form>

              <label className="bw-media__select">
                <span>Sortowanie</span>
                <select
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value as SortKey)
                    setPage(1)
                  }}
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="bw-media__toolbar-secondary">
              <div className="bw-media__toggles" role="group" aria-label="Widok">
                <button
                  type="button"
                  className={`bw-media__icon-btn${view === 'grid' ? ' is-active' : ''}`}
                  onClick={() => changeView('grid')}
                  aria-pressed={view === 'grid'}
                >
                  Siatka
                </button>
                <button
                  type="button"
                  className={`bw-media__icon-btn${view === 'list' ? ' is-active' : ''}`}
                  onClick={() => changeView('list')}
                  aria-pressed={view === 'list'}
                >
                  Lista
                </button>
                <button
                  type="button"
                  className={`bw-media__icon-btn${groupByKind ? ' is-active' : ''}`}
                  onClick={toggleGroup}
                  aria-pressed={groupByKind}
                >
                  Grupuj
                </button>
                <button
                  type="button"
                  className={`bw-media__icon-btn${showDetails ? ' is-active' : ''}`}
                  onClick={toggleDetails}
                  aria-pressed={showDetails}
                >
                  Szczegóły
                </button>
              </div>
            </div>
          </div>

          {loading ? <p className="bw-media__status">Ładowanie…</p> : null}
          {error ? (
            <p className="bw-media__status bw-media__status--error">{error}</p>
          ) : null}
          {!loading && !error && docs.length === 0 ? (
            <p className="bw-media__status">
              Brak plików.{' '}
              {hasCreatePermission ? (
                <Link href={createHref}>Prześlij pierwszy plik</Link>
              ) : null}
            </p>
          ) : null}

          {!loading && docs.length > 0 ? (
            <div className="bw-media__browser">
              <MediaBrowser
                groups={grouped}
                view={view}
                showGroupTitles={groupByKind && kind === 'all'}
                selectedId={selectedId}
                adminRoute={adminRoute}
                onSelect={setSelectedId}
              />
            </div>
          ) : null}

          <div className="bw-media__footer">
            {totalPages > 1 ? (
              <div className="bw-media__pager">
                <button
                  type="button"
                  className="bw-media__btn"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Poprzednia
                </button>
                <span>
                  Strona {page} / {totalPages} · {totalDocs} plików
                </span>
                <button
                  type="button"
                  className="bw-media__btn"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Następna
                </button>
              </div>
            ) : (
              <p className="bw-media__pager-meta">{totalDocs} plików</p>
            )}
          </div>
        </div>

        {showDetails ? (
          <MediaDetailsPanel
            doc={selected}
            adminRoute={adminRoute}
            onClose={() => {
              setPreference(DETAILS_KEY, '0')
            }}
          />
        ) : null}
      </div>
    </Gutter>
  )
}
