'use client'

import { DraggableSortable, DraggableSortableItem } from '@payloadcms/ui'
import React from 'react'

import { ElementBody, ElementFrame } from '@/components/elements/ElementTree'
import type { ElementCtx } from '@/components/elements/types'
import { asArray, str } from '@/lib/component-values'
import { resolveContainerStyle, space } from '@/lib/element-styles'
import { elementLabel } from '@/lib/element-catalog'

import { columnContentPaths } from './model'

export type ListActions = {
  duplicate: (path: string, index: number) => void
  insertInto: (path: string, schemaPath: string, index: number, nested: boolean) => void
  move: (path: string, from: number, to: number) => void
  remove: (path: string, index: number) => void
  select: (id: string) => void
}

type Props = {
  actions: ListActions
  ctx: ElementCtx
  /** Populated element rows: uploads and compositions already resolved. */
  elements: unknown
  nested: boolean
  path: string
  readOnly: boolean
  schemaPath: string
  selectedId: null | string
}

/**
 * One list of elements on the canvas.
 *
 * Renders the **same components the site renders**, wrapped in a selectable
 * shell. `columns` is handled here rather than by `ElementBody`, because each
 * column has to become its own drop target — that is the whole point of having
 * a container element.
 */
export function CanvasList({
  actions,
  ctx,
  elements,
  nested,
  path,
  readOnly,
  schemaPath,
  selectedId,
}: Props) {
  const list = asArray(elements)

  if (list.length === 0) {
    return (
      <button
        className="bw-canvas__empty"
        disabled={readOnly}
        onClick={() => actions.insertInto(path, schemaPath, 0, nested)}
        type="button"
      >
        Kliknij, aby dodawać tu elementy
      </button>
    )
  }

  return (
    <DraggableSortable
      className="bw-canvas__list bw-el-stack"
      ids={list.map((element, index) => str(element.id) || `row-${index}`)}
      onDragEnd={({ moveFromIndex, moveToIndex }) =>
        actions.move(path, moveFromIndex, moveToIndex)
      }
    >
      {list.map((element, index) => {
        const id = str(element.id) || `row-${index}`
        const blockType = str(element.blockType)

        return (
          <DraggableSortableItem disabled={readOnly} id={id} key={id}>
            {(draggable) => (
              <div
                className={[
                  'bw-node',
                  id === selectedId ? 'bw-node--selected' : '',
                  draggable.isDragging ? 'bw-node--dragging' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={(event) => {
                  event.stopPropagation()
                  actions.select(id)
                }}
                ref={draggable.setNodeRef}
                style={{ transform: draggable.transform, transition: draggable.transition }}
              >
                <div className="bw-node__bar">
                  <button
                    className="bw-node__grip"
                    type="button"
                    {...draggable.attributes}
                    {...draggable.listeners}
                    aria-label="Przeciągnij"
                  >
                    ⋮⋮
                  </button>
                  <span className="bw-node__label">{elementLabel(blockType)}</span>
                  <span className="bw-node__actions">
                    <button
                      aria-label="W górę"
                      className="bw-node__button"
                      disabled={readOnly || index === 0}
                      onClick={(event) => {
                        event.stopPropagation()
                        actions.move(path, index, index - 1)
                      }}
                      type="button"
                    >
                      ↑
                    </button>
                    <button
                      aria-label="W dół"
                      className="bw-node__button"
                      disabled={readOnly || index === list.length - 1}
                      onClick={(event) => {
                        event.stopPropagation()
                        actions.move(path, index, index + 1)
                      }}
                      type="button"
                    >
                      ↓
                    </button>
                    <button
                      aria-label="Duplikuj"
                      className="bw-node__button"
                      disabled={readOnly}
                      onClick={(event) => {
                        event.stopPropagation()
                        actions.duplicate(path, index)
                      }}
                      type="button"
                    >
                      ⧉
                    </button>
                    <button
                      aria-label="Usuń"
                      className="bw-node__button bw-node__button--danger"
                      disabled={readOnly}
                      onClick={(event) => {
                        event.stopPropagation()
                        actions.remove(path, index)
                      }}
                      type="button"
                    >
                      ✕
                    </button>
                  </span>
                </div>

                <div className="bw-node__body">
                  {blockType === 'columns' ? (
                    <ColumnsNode
                      actions={actions}
                      ctx={ctx}
                      data={element}
                      index={index}
                      listPath={path}
                      listSchemaPath={schemaPath}
                      readOnly={readOnly}
                      selectedId={selectedId}
                    />
                  ) : (
                    <ElementFrame blockType={blockType} data={element}>
                      <ElementBody ctx={ctx} data={element} />
                    </ElementFrame>
                  )}
                </div>
              </div>
            )}
          </DraggableSortableItem>
        )
      })}
    </DraggableSortable>
  )
}

/** A columns row, with every column a list of its own. */
function ColumnsNode({
  actions,
  ctx,
  data,
  index,
  listPath,
  listSchemaPath,
  readOnly,
  selectedId,
}: {
  actions: ListActions
  ctx: ElementCtx
  data: Record<string, unknown>
  index: number
  listPath: string
  listSchemaPath: string
  readOnly: boolean
  selectedId: null | string
}) {
  const columns = asArray(data.columns)

  const template = columns
    .map((column) => {
      const weight = str(column.weight, '1')
      return weight === 'auto' ? 'auto' : `${Number(weight) || 1}fr`
    })
    .join(' ')

  return (
    <ElementFrame blockType="columns" data={data}>
      <div
        className="bw-el-columns"
        data-align={str(data.verticalAlign, 'start')}
        data-stack={str(data.stackOn, 'mobile')}
        style={{ gap: space(data.gap, 'md'), gridTemplateColumns: template }}
      >
        {columns.map((column, columnIndex) => {
          const paths = columnContentPaths(listPath, listSchemaPath, index, columnIndex)
          const self = str(column.verticalAlign, 'inherit')

          return (
            <div
              className="bw-el-column bw-canvas__column"
              key={str(column.id) || columnIndex}
              style={{
                ...resolveContainerStyle(column),
                alignSelf: self === 'inherit' ? undefined : self,
              }}
            >
              <CanvasList
                actions={actions}
                ctx={ctx}
                elements={column.content}
                nested
                path={paths.path}
                readOnly={readOnly}
                schemaPath={paths.schemaPath}
                selectedId={selectedId}
              />
            </div>
          )
        })}
      </div>
    </ElementFrame>
  )
}
