'use client'

import type { BlocksFieldClientComponent, ClientBlock, ClientField, FormState } from 'payload'

import { useAllFormFields, useField, useForm } from '@payloadcms/ui'
import { reduceFieldsToValues } from 'payload/shared'
import React, { useCallback, useMemo, useState } from 'react'

import { useSavedThemeColors } from '@/components/admin/appearance/use-preview-data'
import { themeCssVarStyle } from '@/components/admin/appearance/use-theme-colors'
import { elementCtx } from '@/components/elements/types'
import { asArray } from '@/lib/component-values'
import { elementLabel } from '@/lib/element-catalog'

import { CanvasList, type ListActions } from './CanvasList'
import { ElementLibrary } from './ElementLibrary'
import { InspectorPanel } from './InspectorPanel'
import {
  blockBySlug,
  blockSchemaPath,
  locateInElements,
  nestedBlocks,
  newRowId,
} from './model'
import { usePopulatedValues } from './use-canvas-data'
import { useSiteComponents } from './use-site-components'
import { VIEWPORTS, ViewportSwitch, type ViewportKey } from './ViewportSwitch'

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
 * The builder for a saved composition (`site-components.content`).
 *
 * The same canvas as the page builder, minus sections: a composition *is* the
 * contents of one, so it is placed inside a page's section rather than carrying
 * a band of its own. The library, the inspector and every row action are shared
 * with `PageBuilder`.
 */
export const ComponentBuilder: BlocksFieldClientComponent = (props) => {
  const { field, path: pathFromProps, readOnly, schemaPath: schemaPathFromProps } = props

  const { addFieldRow, dispatchFields, moveFieldRow, removeFieldRow, setModified } = useForm()
  const [formState] = useAllFormFields()
  const { disabled, path } = useField({
    hasRows: true,
    potentiallyStalePath: pathFromProps,
  })

  const schemaPath = schemaPathFromProps ?? field?.name ?? 'content'
  const locked = Boolean(readOnly || disabled)

  const [selectedId, setSelectedId] = useState<null | string>(null)
  const [viewport, setViewport] = useState<ViewportKey>('desktop')
  const [insertOverride, setInsertOverride] = useState<InsertTarget | null>(null)

  const colors = useSavedThemeColors()
  const library = useSiteComponents()

  const blockList = useMemo(() => (field?.blocks ?? []) as ClientBlock[], [field?.blocks])
  const nested = useMemo(() => nestedBlocks(blockList), [blockList])

  const elements = useMemo(() => {
    const values = reduceFieldsToValues(formState, true) as Record<string, unknown>
    return asArray(atPath(values, path))
  }, [formState, path])

  const populated = usePopulatedValues(elements)
  const located = useMemo(
    () => (selectedId ? locateInElements(elements, selectedId, path, schemaPath) : null),
    [elements, path, schemaPath, selectedId],
  )

  const actions = useMemo<ListActions>(
    () => ({
      duplicate: (listPath, index) => {
        if (locked) return
        dispatchFields({ type: 'DUPLICATE_ROW', path: listPath, rowIndex: index })
        setModified(true)
      },
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
    if (insertOverride) return { ...insertOverride, label: 'wybrane miejsce' }
    return { index: elements.length, label: 'koniec komponentu', nested: false, path, schemaPath }
  }, [elements.length, insertOverride, located, path, schemaPath])

  const insert = useCallback(
    (slug: string, seed?: Record<string, unknown>) => {
      if (locked || !target) return
      const id = newRowId()
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

  const inspector = useMemo(() => {
    if (located?.kind !== 'element') return null
    const block = blockBySlug(located.nested ? nested : blockList, located.blockType)
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
  }, [blockList, located, locked, nested])

  const ctx = useMemo(() => elementCtx({ mode: 'admin' }), [])
  const availableBlocks = useMemo(
    () => (target?.nested ? nested : blockList).map((block) => block.slug),
    [blockList, nested, target?.nested],
  )

  return (
    <div className="bw-builder" data-field-path={path}>
      <div className="bw-builder__head">
        <div>
          <h3 className="bw-builder__title">Kreator komponentu</h3>
          <p className="bw-builder__lead">
            Ułóż złożenie z elementów. Gotowy komponent wstawisz potem jednym kliknięciem w
            kreatorze stron.
          </p>
        </div>
        <div className="bw-builder__head-tools">
          <ViewportSwitch onChange={setViewport} value={viewport} />
        </div>
      </div>

      <div className="bw-builder__layout">
        <ElementLibrary
          available={availableBlocks}
          compositions={library.docs}
          compositionsError={library.error}
          compositionsLoading={library.loading}
          disabled={locked}
          onInsert={insert}
          onReload={library.reload}
          targetLabel={target?.label ?? 'koniec komponentu'}
        />

        <div className="bw-builder__canvas" style={themeCssVarStyle(colors)}>
          <div
            className="bw-canvas__viewport"
            data-viewport={viewport}
            style={{ maxWidth: VIEWPORTS[viewport].width }}
          >
            <div className="bw-canvas__band">
              <div className="bw-el-root bw-el-stack bw-canvas__inner">
                <CanvasList
                  actions={actions}
                  ctx={ctx}
                  elements={populated}
                  nested={false}
                  path={path}
                  readOnly={locked}
                  schemaPath={schemaPath}
                  selectedId={selectedId}
                />
              </div>
            </div>
          </div>
        </div>

        {inspector ?? (
          <aside className="bw-builder__inspector bw-builder__inspector--empty">
            <h4 className="bw-builder__panel-title">Ustawienia</h4>
            <p className="bw-builder__hint">
              Kliknij element na kanwie, aby zobaczyć jego parametry.
            </p>
          </aside>
        )}
      </div>
    </div>
  )
}
