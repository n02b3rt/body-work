'use client'

import type { ArrayFieldClientComponent, ClientField, FormState } from 'payload'

import {
  DraggableSortable,
  DraggableSortableItem,
  useAllFormFields,
  useField,
  useForm,
} from '@payloadcms/ui'
import { reduceFieldsToValues } from 'payload/shared'
import React, { useCallback, useMemo, useState } from 'react'

import { useSavedThemeColors } from '@/components/admin/appearance/use-preview-data'
import { themeCssVarStyle } from '@/components/admin/appearance/use-theme-colors'
import { elementCtx } from '@/components/elements/types'
import { asArray, str } from '@/lib/component-values'
import { elementLabel } from '@/lib/element-catalog'
import { sectionSpacing, sectionWidth } from '@/lib/page-sections'
import { resolveColorChoice } from '@/lib/theme-css'

import { CanvasList, type ListActions } from './CanvasList'
import { ElementLibrary } from './ElementLibrary'
import { InspectorPanel } from './InspectorPanel'
import {
  blockBySlug,
  blockSchemaPath,
  blocksOf,
  findField,
  locateInSections,
  nestedBlocks,
  newRowId,
} from './model'
import { usePopulatedValues } from './use-canvas-data'
import { useSiteComponents } from './use-site-components'
import { VIEWPORTS, ViewportSwitch, type ViewportKey } from './ViewportSwitch'

/** Reads the field's own value out of the reduced form values. */
function atPath(values: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (!acc || typeof acc !== 'object') return undefined
    return (acc as Record<string, unknown>)[key]
  }, values)
}

type InsertTarget = {
  index: number
  nested: boolean
  path: string
  schemaPath: string
}

/**
 * The page builder for `pages.layout`.
 *
 * Three panes: the element library, a canvas that renders the *same* components
 * the public site renders, and an inspector driven by Payload's own
 * `RenderFields`. Every mutation goes through the form's row actions
 * (`addFieldRow`, `moveFieldRow`, `removeFieldRow`, `DUPLICATE_ROW`), which is
 * what Payload's stock array and blocks fields do — so validation, drafts,
 * versions and the "unsaved changes" prompt keep working, and removing this
 * component leaves the data editable in the stock UI.
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

  const [selectedId, setSelectedId] = useState<null | string>(null)
  const [viewport, setViewport] = useState<ViewportKey>('desktop')
  const [insertOverride, setInsertOverride] = useState<InsertTarget | null>(null)

  const colors = useSavedThemeColors()
  const library = useSiteComponents()

  // ------------------------------------------------------------------ schema
  const sectionFields = useMemo(
    () => ((field?.fields ?? []) as ClientField[]).filter((entry) => entry.type !== 'ui'),
    [field?.fields],
  )
  const blocks = useMemo(
    () => blocksOf(findField(sectionFields, 'content')),
    [sectionFields],
  )
  const nested = useMemo(() => nestedBlocks(blocks), [blocks])
  const sectionOwnFields = useMemo(
    () => sectionFields.filter((entry) => !('name' in entry && entry.name === 'content')),
    [sectionFields],
  )

  // ------------------------------------------------------------------ values
  const sections = useMemo(() => {
    const values = reduceFieldsToValues(formState, true) as Record<string, unknown>
    return asArray(atPath(values, path))
  }, [formState, path])

  const populated = usePopulatedValues(sections)
  const located = useMemo(
    () => (selectedId ? locateInSections(sections, selectedId, path, schemaPath) : null),
    [path, schemaPath, sections, selectedId],
  )

  // ----------------------------------------------------------------- actions
  const addSection = useCallback(() => {
    if (locked) return
    const id = newRowId()
    addFieldRow({
      path,
      rowIndex: rows.length,
      schemaPath,
      subFieldState: {
        id: { initialValue: id, valid: true, value: id },
      } as unknown as FormState,
    })
    setSelectedId(id)
    setInsertOverride(null)
  }, [addFieldRow, locked, path, rows.length, schemaPath])

  const actions = useMemo<ListActions>(
    () => ({
      duplicate: (listPath, index) => {
        if (locked) return
        dispatchFields({ type: 'DUPLICATE_ROW', path: listPath, rowIndex: index })
        setModified(true)
      },
      // Clicking an empty column only moves the insertion point; the library is
      // what actually adds the element.
      insertInto: (listPath, listSchemaPath, index, isNested) => {
        setSelectedId(null)
        setInsertOverride({ index, nested: isNested, path: listPath, schemaPath: listSchemaPath })
      },
      move: (listPath, from, to) => {
        if (locked || from === to || to < 0) return
        moveFieldRow({ moveFromIndex: from, moveToIndex: to, path: listPath })
      },
      remove: (listPath, index) => {
        if (locked) return
        removeFieldRow({ path: listPath, rowIndex: index })
        setSelectedId(null)
      },
      select: (id) => {
        setSelectedId(id)
        setInsertOverride(null)
      },
    }),
    [dispatchFields, locked, moveFieldRow, removeFieldRow, setModified],
  )

  /** Where the next library click lands, and how it is described to the editor. */
  const target = useMemo<(InsertTarget & { label: string }) | null>(() => {
    if (located?.kind === 'element') {
      return {
        index: located.index + 1,
        label: `pod: ${elementLabel(located.blockType)}`,
        nested: located.nested,
        path: located.listPath,
        schemaPath: located.listSchemaPath,
      }
    }

    if (located?.kind === 'section') {
      return {
        index: asArray(sections[located.index]?.content).length,
        label: `Sekcja ${located.index + 1}`,
        nested: false,
        path: `${path}.${located.index}.content`,
        schemaPath: `${schemaPath}.content`,
      }
    }

    if (insertOverride) return { ...insertOverride, label: 'wybrane miejsce' }

    if (sections.length > 0) {
      const index = sections.length - 1
      return {
        index: asArray(sections[index]?.content).length,
        label: `Sekcja ${index + 1}`,
        nested: false,
        path: `${path}.${index}.content`,
        schemaPath: `${schemaPath}.content`,
      }
    }

    return null
  }, [insertOverride, located, path, schemaPath, sections])

  const insert = useCallback(
    (slug: string, seed?: Record<string, unknown>) => {
      if (locked || !target) return
      const id = newRowId()

      // Seeding the row is what lets "Moje komponenty" insert an already-chosen
      // composition; the debounced form-state request fills in the defaults for
      // every field left out here.
      const subFieldState: Record<string, unknown> = {
        id: { initialValue: id, valid: true, value: id },
      }
      Object.entries(seed ?? {}).forEach(([key, value]) => {
        subFieldState[key] = { initialValue: value, valid: true, value }
      })

      addFieldRow({
        blockType: slug,
        path: target.path,
        rowIndex: target.index,
        schemaPath: target.schemaPath,
        subFieldState: subFieldState as unknown as FormState,
      })
      setInsertOverride(null)
      setSelectedId(id)
    },
    [addFieldRow, locked, target],
  )

  const moveSection = useCallback(
    (from: number, to: number) => {
      if (locked || to < 0 || to >= rows.length || from === to) return
      moveFieldRow({ moveFromIndex: from, moveToIndex: to, path })
    },
    [locked, moveFieldRow, path, rows.length],
  )

  const removeSection = useCallback(
    (index: number) => {
      if (locked) return
      removeFieldRow({ path, rowIndex: index })
      setSelectedId(null)
    },
    [locked, path, removeFieldRow],
  )

  const toggleSectionHidden = useCallback(
    (index: number, current: boolean) => {
      if (locked) return
      dispatchFields({ type: 'UPDATE', path: `${path}.${index}.hidden`, value: !current })
      setModified(true)
    },
    [dispatchFields, locked, path, setModified],
  )

  // --------------------------------------------------------------- inspector
  const inspector = useMemo(() => {
    if (!located) return null

    if (located.kind === 'section') {
      return (
        <InspectorPanel
          fields={sectionOwnFields}
          key={located.id}
          path={located.path}
          readOnly={locked}
          schemaPath={schemaPath}
          subtitle="Sekcja"
          title={`Sekcja ${located.index + 1}`}
        />
      )
    }

    const block = blockBySlug(located.nested ? nested : blocks, located.blockType)
    if (!block) return null

    return (
      <InspectorPanel
        fields={block.fields as ClientField[]}
        key={located.id}
        path={located.path}
        readOnly={locked}
        schemaPath={blockSchemaPath(located.listSchemaPath, located.blockType)}
        subtitle="Element"
        title={elementLabel(located.blockType)}
      />
    )
  }, [blocks, located, locked, nested, schemaPath, sectionOwnFields])

  const ctx = useMemo(() => elementCtx({ mode: 'admin' }), [])
  const availableBlocks = useMemo(
    () => (target?.nested ? nested : blocks).map((block) => block.slug),
    [blocks, nested, target?.nested],
  )

  return (
    <div className="bw-builder" data-field-path={path}>
      <div className="bw-builder__head">
        <div>
          <h3 className="bw-builder__title">Kreator stron</h3>
          <p className="bw-builder__lead">
            Dodaj elementy z biblioteki, przeciągnij, aby zmienić kolejność, kliknij element,
            aby ustawić jego parametry.
          </p>
        </div>
        <div className="bw-builder__head-tools">
          <ViewportSwitch onChange={setViewport} value={viewport} />
          <span className="bw-builder__count">
            {rows.length} {rows.length === 1 ? 'sekcja' : 'sekcji'}
          </span>
        </div>
      </div>

      <div className="bw-builder__layout">
        <ElementLibrary
          available={availableBlocks}
          compositions={library.docs}
          compositionsError={library.error}
          compositionsLoading={library.loading}
          disabled={locked || !target}
          onInsert={insert}
          onReload={library.reload}
          targetLabel={target?.label ?? 'najpierw dodaj sekcję'}
        />

        <div className="bw-builder__canvas" style={themeCssVarStyle(colors)}>
          <div
            className="bw-canvas__viewport"
            data-viewport={viewport}
            style={{ maxWidth: VIEWPORTS[viewport].width }}
          >
            {rows.length === 0 ? (
              <p className="bw-builder__empty">
                Ta strona nie ma jeszcze sekcji. Dodaj pierwszą, aby zacząć układać treść.
              </p>
            ) : (
              <DraggableSortable
                className="bw-builder__sections"
                ids={rows.map((row) => row.id)}
                onDragEnd={({ moveFromIndex, moveToIndex }) =>
                  moveSection(moveFromIndex, moveToIndex)
                }
              >
                {rows.map((row, index) => {
                  const raw = sections[index] ?? {}
                  const section = populated[index] ?? {}

                  return (
                    <DraggableSortableItem disabled={locked} id={row.id} key={row.id}>
                      {(draggable) => (
                        <section
                          className={[
                            'bw-canvas__section',
                            row.id === selectedId ? 'bw-canvas__section--selected' : '',
                            raw.hidden === true ? 'bw-canvas__section--hidden' : '',
                          ]
                            .filter(Boolean)
                            .join(' ')}
                          onClick={() => {
                            setSelectedId(row.id)
                            setInsertOverride(null)
                          }}
                          ref={draggable.setNodeRef}
                          style={{
                            transform: draggable.transform,
                            transition: draggable.transition,
                          }}
                        >
                          <header className="bw-canvas__bar">
                            <button
                              aria-label="Przeciągnij sekcję"
                              className="bw-node__grip"
                              type="button"
                              {...draggable.attributes}
                              {...draggable.listeners}
                            >
                              ⋮⋮
                            </button>
                            <span className="bw-node__label">
                              {str(raw.name) || `Sekcja ${index + 1}`}
                            </span>
                            <span className="bw-node__actions">
                              <button
                                aria-label="W górę"
                                className="bw-node__button"
                                disabled={locked || index === 0}
                                onClick={(event) => {
                                  event.stopPropagation()
                                  moveSection(index, index - 1)
                                }}
                                type="button"
                              >
                                ↑
                              </button>
                              <button
                                aria-label="W dół"
                                className="bw-node__button"
                                disabled={locked || index === rows.length - 1}
                                onClick={(event) => {
                                  event.stopPropagation()
                                  moveSection(index, index + 1)
                                }}
                                type="button"
                              >
                                ↓
                              </button>
                              <button
                                aria-label={
                                  raw.hidden === true ? 'Pokaż sekcję' : 'Ukryj sekcję'
                                }
                                className="bw-node__button"
                                disabled={locked}
                                onClick={(event) => {
                                  event.stopPropagation()
                                  toggleSectionHidden(index, raw.hidden === true)
                                }}
                                type="button"
                              >
                                {raw.hidden === true ? '◌' : '●'}
                              </button>
                              <button
                                aria-label="Usuń sekcję"
                                className="bw-node__button bw-node__button--danger"
                                disabled={locked}
                                onClick={(event) => {
                                  event.stopPropagation()
                                  removeSection(index)
                                }}
                                type="button"
                              >
                                ✕
                              </button>
                            </span>
                          </header>

                          <div
                            className="bw-canvas__band"
                            style={{
                              background: resolveColorChoice(
                                raw.background as {
                                  custom?: null | string
                                  token?: null | string
                                },
                                null,
                              ),
                              padding: `${sectionSpacing(raw.spacing)} 0`,
                            }}
                          >
                            <div
                              className="bw-el-root bw-el-stack bw-canvas__inner"
                              style={{ maxWidth: sectionWidth(raw.width) }}
                            >
                              <CanvasList
                                actions={actions}
                                ctx={ctx}
                                elements={section.content}
                                nested={false}
                                path={`${path}.${index}.content`}
                                readOnly={locked}
                                schemaPath={`${schemaPath}.content`}
                                selectedId={selectedId}
                              />
                            </div>
                          </div>
                        </section>
                      )}
                    </DraggableSortableItem>
                  )
                })}
              </DraggableSortable>
            )}

            <button
              className="bw-canvas__add-section"
              disabled={locked}
              onClick={addSection}
              type="button"
            >
              + Dodaj sekcję
            </button>
          </div>
        </div>

        {inspector ?? (
          <aside className="bw-builder__inspector bw-builder__inspector--empty">
            <h4 className="bw-builder__panel-title">Ustawienia</h4>
            <p className="bw-builder__hint">
              Kliknij sekcję lub element na kanwie, aby zobaczyć jego parametry.
            </p>
          </aside>
        )}
      </div>
    </div>
  )
}
