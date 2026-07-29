'use client'

import type { ArrayFieldClientComponent, FormState } from 'payload'

import {
  DraggableSortable,
  DraggableSortableItem,
  useAllFormFields,
  useField,
  useForm,
} from '@payloadcms/ui'
import React, { useCallback, useMemo, useState } from 'react'

import { useSavedThemeColors } from '@/components/admin/appearance/use-preview-data'
import { themeCssVarStyle } from '@/components/admin/appearance/use-theme-colors'

import { CanvasSection, type SectionRow } from './CanvasSection'
import { ComponentLibrary } from './ComponentLibrary'
import { SectionInspector } from './SectionInspector'
import { indexById, useSiteComponents, type LibraryComponent } from './use-site-components'

/** Row ids are form-state only until the document is saved; this matches Payload's own shape. */
function newRowId(): string {
  const random = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}${Math.random()}`
  return random.replace(/[^a-f0-9]/gi, '').slice(0, 24)
}

function stateValue(state: FormState, path: string): unknown {
  return state?.[path]?.value
}

/**
 * Reads one section's values straight out of the flat form state.
 *
 * Flat lookups rather than `reduceFieldsToValues` on the whole document: the
 * builder only needs six values per row, and this keeps it independent of where
 * the field sits in the document.
 */
function readRow(state: FormState, path: string, index: number): SectionRow {
  const base = `${path}.${index}`
  return {
    component: stateValue(state, `${base}.component`),
    width: stateValue(state, `${base}.width`),
    spacing: stateValue(state, `${base}.spacing`),
    anchor: stateValue(state, `${base}.anchor`),
    hidden: stateValue(state, `${base}.hidden`),
    background: {
      token: stateValue(state, `${base}.background.token`),
      custom: stateValue(state, `${base}.background.custom`),
    },
  }
}

function toDocId(value: unknown): string | null {
  if (typeof value === 'number') return String(value)
  if (typeof value === 'string' && value) return value
  if (value && typeof value === 'object') {
    const record = value as { id?: unknown; value?: unknown }
    if (record.id !== undefined) return toDocId(record.id)
    if (record.value !== undefined) return toDocId(record.value)
  }
  return null
}

/**
 * Page builder for `pages.layout`.
 *
 * Replaces Payload's stock array UI with a canvas: sections are placements of
 * components from "Wygląd → Komponenty", reordered by drag and configured in an
 * inspector. Every mutation goes through the form's own row actions, so undo,
 * validation, drafts and versioning keep working exactly as they do elsewhere.
 */
export const PageBuilder: ArrayFieldClientComponent = (props) => {
  const { field, path: pathFromProps, readOnly, schemaPath: schemaPathFromProps } = props

  const { addFieldRow, dispatchFields, moveFieldRow, removeFieldRow, setModified } = useForm()
  const [formState] = useAllFormFields()
  const { disabled, path, rows = [] } = useField({
    hasRows: true,
    potentiallyStalePath: pathFromProps,
  })

  const schemaPath = schemaPathFromProps ?? field?.name ?? 'layout'
  const locked = Boolean(readOnly || disabled)

  const { docs, error, loading, reload } = useSiteComponents()
  const byId = useMemo(() => indexById(docs), [docs])
  const colors = useSavedThemeColors()

  // Keyed by row id, not index: moving or deleting a row must not silently
  // re-point the inspector at a different section.
  const [selectedId, setSelectedId] = useState<null | string>(null)
  const selectedIndex = rows.findIndex((row) => row.id === selectedId)

  const sections = useMemo(
    () =>
      rows.map((row, index) => {
        const values = readRow(formState, path, index)
        const docId = toDocId(values.component)
        return { docId, id: row.id, index, values }
      }),
    [formState, path, rows],
  )

  const insert = useCallback(
    (doc: LibraryComponent) => {
      if (locked) return
      const id = newRowId()
      const rowIndex = selectedIndex >= 0 ? selectedIndex + 1 : rows.length

      addFieldRow({
        path,
        rowIndex,
        schemaPath,
        subFieldState: {
          id: { initialValue: id, valid: true, value: id },
          component: { initialValue: doc.id, valid: true, value: doc.id },
          width: { initialValue: 'container', valid: true, value: 'container' },
          spacing: { initialValue: 'md', valid: true, value: 'md' },
          hidden: { initialValue: false, valid: true, value: false },
        } as unknown as FormState,
      })
      setSelectedId(id)
    },
    [addFieldRow, locked, path, rows.length, schemaPath, selectedIndex],
  )

  const move = useCallback(
    (from: number, to: number) => {
      if (locked || to < 0 || to >= rows.length || from === to) return
      moveFieldRow({ moveFromIndex: from, moveToIndex: to, path })
    },
    [locked, moveFieldRow, path, rows.length],
  )

  const remove = useCallback(
    (index: number) => {
      if (locked) return
      if (rows[index]?.id === selectedId) setSelectedId(null)
      removeFieldRow({ path, rowIndex: index })
    },
    [locked, path, removeFieldRow, rows, selectedId],
  )

  const duplicate = useCallback(
    (index: number) => {
      if (locked) return
      dispatchFields({ type: 'DUPLICATE_ROW', path, rowIndex: index })
      setModified(true)
    },
    [dispatchFields, locked, path, setModified],
  )

  const toggleHidden = useCallback(
    (index: number, current: boolean) => {
      if (locked) return
      dispatchFields({ type: 'UPDATE', path: `${path}.${index}.hidden`, value: !current })
      setModified(true)
    },
    [dispatchFields, locked, path, setModified],
  )

  return (
    <div className="bw-builder" data-field-path={path}>
      <div className="bw-builder__head">
        <div>
          <h3 className="bw-builder__title">Kreator stron</h3>
          <p className="bw-builder__lead">
            Dodaj sekcje z biblioteki po lewej, przeciągnij, aby zmienić kolejność, kliknij
            sekcję, aby zmienić jej ustawienia.
          </p>
        </div>
        <span className="bw-builder__count">
          {rows.length} {rows.length === 1 ? 'sekcja' : 'sekcji'}
        </span>
      </div>

      <div className="bw-builder__layout">
        <ComponentLibrary
          disabled={locked}
          docs={docs}
          error={error}
          loading={loading}
          onInsert={insert}
          onReload={reload}
        />

        <div className="bw-builder__canvas" style={themeCssVarStyle(colors)}>
          {rows.length === 0 ? (
            <p className="bw-builder__empty">
              Ta strona nie ma jeszcze żadnych sekcji. Wybierz komponent z biblioteki, aby
              zacząć.
            </p>
          ) : (
            <DraggableSortable
              className="bw-builder__sections"
              ids={rows.map((row) => row.id)}
              onDragEnd={({ moveFromIndex, moveToIndex }) => move(moveFromIndex, moveToIndex)}
            >
              {sections.map(({ docId, id, index, values }) => (
                <DraggableSortableItem disabled={locked} id={id} key={id}>
                  {(draggable) => (
                    <CanvasSection
                      doc={docId ? byId[docId] : undefined}
                      dragAttributes={draggable.attributes}
                      dragListeners={draggable.listeners}
                      index={index}
                      isDragging={draggable.isDragging}
                      isSelected={id === selectedId}
                      onDuplicate={() => duplicate(index)}
                      onMove={(to) => move(index, to)}
                      onRemove={() => remove(index)}
                      onSelect={() => setSelectedId(id)}
                      onToggleHidden={() => toggleHidden(index, values.hidden === true)}
                      row={values}
                      setNodeRef={draggable.setNodeRef}
                      total={rows.length}
                      transform={draggable.transform}
                      transition={draggable.transition}
                    />
                  )}
                </DraggableSortableItem>
              ))}
            </DraggableSortable>
          )}
        </div>

        {selectedIndex >= 0 ? (
          <SectionInspector
            docs={docs}
            index={selectedIndex}
            key={selectedId}
            path={path}
            selectedDoc={
              sections[selectedIndex]?.docId
                ? byId[sections[selectedIndex]!.docId!]
                : undefined
            }
          />
        ) : (
          <aside className="bw-builder__inspector bw-builder__inspector--empty">
            <h4 className="bw-builder__panel-title">Ustawienia sekcji</h4>
            <p className="bw-builder__hint">
              Kliknij sekcję na kanwie, aby ustawić jej szerokość, tło, odstęp i kotwicę.
            </p>
          </aside>
        )}
      </div>
    </div>
  )
}
