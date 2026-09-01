'use client'

import { useState } from 'react'

import type { BuilderCollection } from '@/lib/builder/document'

import { saveBuilderDoc } from './save'
import { useBuilderStore } from './store'
import { ViewportSwitch } from './ViewportSwitch'

type ToolbarProps = {
  collection: BuilderCollection
  documentId: number
  title: string
}

export function Toolbar({ collection, documentId, title }: ToolbarProps) {
  const doc = useBuilderStore((state) => state.doc)
  const dirty = useBuilderStore((state) => state.dirty)
  const saving = useBuilderStore((state) => state.saving)
  const lastSavedAt = useBuilderStore((state) => state.lastSavedAt)
  const markSaving = useBuilderStore((state) => state.markSaving)
  const markSaved = useBuilderStore((state) => state.markSaved)
  const undo = useBuilderStore((state) => state.undo)
  const redo = useBuilderStore((state) => state.redo)
  const addSection = useBuilderStore((state) => state.addSection)
  const [error, setError] = useState<string | null>(null)

  const runSave = async (mode: 'draft' | 'publish') => {
    setError(null)
    markSaving(true)
    try {
      await saveBuilderDoc(collection, documentId, doc, mode)
      markSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nieznany błąd zapisu.')
      markSaving(false)
    }
  }

  return (
    <header className="flex items-center gap-3 border-b border-line bg-page px-4 py-2">
      <h1 className="truncate text-sm font-medium text-text-heading">{title}</h1>

      <div className="ml-auto flex items-center gap-2">
        {error ? <span className="text-xs text-error">{error}</span> : null}
        <span className="text-xs text-muted">
          {saving ? 'Zapisywanie…' : dirty ? 'Niezapisane zmiany' : lastSavedAt ? 'Zapisano' : ''}
        </span>

        <button className="rounded-md border border-line px-2 py-1 text-sm" onClick={undo} type="button">
          ↶
        </button>
        <button className="rounded-md border border-line px-2 py-1 text-sm" onClick={redo} type="button">
          ↷
        </button>

        <button
          className="rounded-md border border-line px-3 py-1.5 text-sm"
          onClick={addSection}
          type="button"
        >
          + Sekcja
        </button>

        <ViewportSwitch />

        {collection !== 'site-components' ? (
          <button
            className="rounded-md border border-line px-3 py-1.5 text-sm hover:border-[var(--bw-editor-accent)] disabled:opacity-50"
            disabled={saving}
            onClick={() => runSave('draft')}
            type="button"
          >
            Zapisz szkic
          </button>
        ) : null}
        <button
          className="rounded-md bg-[var(--bw-editor-accent)] px-4 py-1.5 text-sm text-white hover:bg-[var(--bw-editor-accent-hover)] disabled:opacity-50"
          disabled={saving}
          onClick={() => runSave('publish')}
          type="button"
        >
          {collection === 'site-components' ? 'Zapisz' : 'Opublikuj'}
        </button>
      </div>
    </header>
  )
}
