'use client'

import React from 'react'

import { componentTypeLabel } from '@/fields/component-settings'
import { sectionSpacing, sectionWidth } from '@/lib/page-sections'
import { resolveColorChoice } from '@/lib/theme-css'

import { SectionPreview } from './SectionPreview'
import type { LibraryComponent } from './use-site-components'

export type SectionRow = {
  component?: unknown
  width?: unknown
  spacing?: unknown
  background?: unknown
  anchor?: unknown
  hidden?: unknown
}

type Props = {
  doc?: LibraryComponent
  index: number
  isSelected: boolean
  onDuplicate: () => void
  onMove: (to: number) => void
  onRemove: () => void
  onSelect: () => void
  onToggleHidden: () => void
  row: SectionRow
  total: number
  dragAttributes?: React.HTMLAttributes<unknown>
  dragListeners?: Record<string, unknown>
  isDragging?: boolean
  setNodeRef?: (node: HTMLElement | null) => void
  transform?: string
  transition?: string
}

/**
 * One placed section on the canvas: its component rendered with the placement's
 * own width, spacing and background, plus the controls for moving it.
 *
 * The frame mirrors what `PageSections` renders publicly, so the canvas is a
 * fair preview of the page rather than a list of loose blocks.
 */
export function CanvasSection({
  doc,
  dragAttributes,
  dragListeners,
  index,
  isDragging,
  isSelected,
  onDuplicate,
  onMove,
  onRemove,
  onSelect,
  onToggleHidden,
  row,
  setNodeRef,
  total,
  transform,
  transition,
}: Props) {
  const hidden = row.hidden === true
  const background = resolveColorChoice(
    row.background as { token?: string | null; custom?: string | null } | null,
    null,
  )

  const className = [
    'bw-builder__section',
    isSelected ? 'is-selected' : '',
    hidden ? 'is-hidden' : '',
    isDragging ? 'is-dragging' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className={className}
      ref={setNodeRef}
      style={{ transform, transition, zIndex: isDragging ? 2 : undefined }}
    >
      <div className="bw-builder__section-bar">
        <button
          className="bw-builder__drag"
          title="Przeciągnij, aby zmienić kolejność"
          type="button"
          {...dragAttributes}
          {...dragListeners}
        >
          ⠿
        </button>

        <button className="bw-builder__section-id" onClick={onSelect} type="button">
          <span className="bw-builder__section-name">
            {doc?.name ?? 'Brak komponentu'}
          </span>
          <span className="bw-builder__section-type">
            {doc ? componentTypeLabel(doc.type) : 'nieprzypisany'}
          </span>
        </button>

        <div className="bw-builder__section-actions">
          <button
            className="bw-builder__icon-btn"
            disabled={index === 0}
            onClick={() => onMove(index - 1)}
            title="W górę"
            type="button"
          >
            ↑
          </button>
          <button
            className="bw-builder__icon-btn"
            disabled={index === total - 1}
            onClick={() => onMove(index + 1)}
            title="W dół"
            type="button"
          >
            ↓
          </button>
          <button
            className="bw-builder__icon-btn"
            onClick={onDuplicate}
            title="Duplikuj sekcję"
            type="button"
          >
            ⧉
          </button>
          <button
            className={`bw-builder__icon-btn${hidden ? ' is-active' : ''}`}
            onClick={onToggleHidden}
            title={hidden ? 'Pokaż sekcję' : 'Ukryj sekcję'}
            type="button"
          >
            {hidden ? '◌' : '●'}
          </button>
          {doc ? (
            <a
              className="bw-builder__icon-btn"
              href={`/admin/c/site-components/${doc.id}`}
              rel="noreferrer"
              target="_blank"
              title="Edytuj komponent w bibliotece"
            >
              ✎
            </a>
          ) : null}
          <button
            className="bw-builder__icon-btn bw-builder__icon-btn--danger"
            onClick={onRemove}
            title="Usuń sekcję"
            type="button"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Clicking anywhere on the block selects it, which is how the inspector
        * is reached. It is a div rather than a button so the preview inside
        * keeps its own markup. */}
      <div
        className="bw-builder__section-body"
        onClick={onSelect}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            onSelect()
          }
        }}
        role="button"
        style={{ background, padding: `${sectionSpacing(row.spacing)} 0` }}
        tabIndex={0}
      >
        <div className="bw-builder__section-inner" style={{ maxWidth: sectionWidth(row.width) }}>
          {doc ? (
            <SectionPreview doc={doc} />
          ) : (
            <p className="bw-builder__notice">
              Komponent został usunięty z biblioteki albo nie został jeszcze wybrany.
              Wybierz nowy w ustawieniach sekcji.
            </p>
          )}
        </div>
      </div>

      {hidden ? <p className="bw-builder__section-flag">Sekcja ukryta: nie publikuje się.</p> : null}
    </div>
  )
}
