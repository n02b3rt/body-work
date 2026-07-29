'use client'

import { useField } from '@payloadcms/ui'
import React from 'react'

import { componentTypeLabel } from '@/fields/component-settings'
import {
  SECTION_SPACING_OPTIONS,
  SECTION_WIDTH_OPTIONS,
} from '@/lib/page-sections'
import { normalizeHexColor, THEME_COLOR_OPTIONS } from '@/lib/theme-tokens'

import type { LibraryComponent } from './use-site-components'

type Props = {
  docs: LibraryComponent[]
  index: number
  path: string
  selectedDoc?: LibraryComponent
}

/**
 * Settings for the selected section.
 *
 * Every control goes through `useField` on the row's own sub-path, so values
 * land in the same form state Payload submits: no parallel store, and the
 * document's "unsaved changes" state stays honest.
 */
export function SectionInspector({ docs, index, path, selectedDoc }: Props) {
  const rowPath = `${path}.${index}`

  return (
    <aside className="bw-builder__inspector">
      <h4 className="bw-builder__panel-title">
        Sekcja {index + 1}
        {selectedDoc ? (
          <span className="bw-builder__panel-sub">{componentTypeLabel(selectedDoc.type)}</span>
        ) : null}
      </h4>

      <ComponentSelect docs={docs} path={`${rowPath}.component`} />
      <SelectControl
        label="Szerokość sekcji"
        options={SECTION_WIDTH_OPTIONS}
        path={`${rowPath}.width`}
        fallback="container"
      />
      <SelectControl
        label="Odstęp pionowy"
        options={SECTION_SPACING_OPTIONS}
        path={`${rowPath}.spacing`}
        fallback="md"
      />
      <BackgroundControl path={`${rowPath}.background`} />
      <TextControl
        hint="Linkuj do sekcji adresem /strona#kotwica."
        label="Kotwica (#)"
        path={`${rowPath}.anchor`}
      />
      <CheckboxControl label="Ukryj sekcję (nie publikuj)" path={`${rowPath}.hidden`} />

      {selectedDoc ? (
        <a
          className="bw-builder__library-link"
          href={`/admin/c/site-components/${selectedDoc.id}`}
          rel="noreferrer"
          target="_blank"
        >
          Edytuj „{selectedDoc.name ?? 'komponent'}”
        </a>
      ) : null}
    </aside>
  )
}

function ComponentSelect({ docs, path }: { docs: LibraryComponent[]; path: string }) {
  const { setValue, value } = useField<string | number>({ path })

  return (
    <label className="bw-builder__control">
      <span className="bw-builder__control-label">Komponent</span>
      <select
        className="bw-builder__input"
        onChange={(event) => setValue(event.target.value || null)}
        value={value === undefined || value === null ? '' : String(value)}
      >
        <option value="">Wybierz komponent…</option>
        {docs.map((doc) => (
          <option key={doc.id} value={String(doc.id)}>
            {doc.name ?? 'Bez nazwy'} ({componentTypeLabel(doc.type)})
          </option>
        ))}
      </select>
    </label>
  )
}

function SelectControl({
  fallback,
  label,
  options,
  path,
}: {
  fallback: string
  label: string
  options: readonly { label: string; value: string }[]
  path: string
}) {
  const { setValue, value } = useField<string>({ path })

  return (
    <label className="bw-builder__control">
      <span className="bw-builder__control-label">{label}</span>
      <select
        className="bw-builder__input"
        onChange={(event) => setValue(event.target.value)}
        value={typeof value === 'string' && value ? value : fallback}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

/**
 * The background is a `colorChoice` group, so it is two fields: a palette token
 * and a custom hex that only applies when the token is `custom`.
 */
function BackgroundControl({ path }: { path: string }) {
  const token = useField<string>({ path: `${path}.token` })
  const custom = useField<string>({ path: `${path}.custom` })
  const tokenValue = typeof token.value === 'string' && token.value ? token.value : 'none'

  return (
    <div className="bw-builder__control">
      <span className="bw-builder__control-label">Tło sekcji</span>
      <select
        className="bw-builder__input"
        onChange={(event) => token.setValue(event.target.value)}
        value={tokenValue}
      >
        <option value="none">Brak / przezroczyste</option>
        {THEME_COLOR_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
        <option value="custom">Własny (HEX)</option>
      </select>

      {tokenValue === 'custom' ? (
        <div className="bw-builder__color-row">
          <input
            aria-label="Wybierz kolor tła"
            className="bw-builder__color-swatch"
            onChange={(event) => custom.setValue(event.target.value)}
            type="color"
            value={normalizeHexColor(custom.value) ?? '#ffffff'}
          />
          <input
            className="bw-builder__input"
            onChange={(event) => custom.setValue(event.target.value)}
            placeholder="#0f766e"
            value={typeof custom.value === 'string' ? custom.value : ''}
          />
        </div>
      ) : null}
    </div>
  )
}

function TextControl({
  hint,
  label,
  path,
}: {
  hint?: string
  label: string
  path: string
}) {
  const { setValue, value } = useField<string>({ path })

  return (
    <label className="bw-builder__control">
      <span className="bw-builder__control-label">{label}</span>
      <input
        className="bw-builder__input"
        onChange={(event) => setValue(event.target.value)}
        value={typeof value === 'string' ? value : ''}
      />
      {hint ? <span className="bw-builder__control-hint">{hint}</span> : null}
    </label>
  )
}

function CheckboxControl({ label, path }: { label: string; path: string }) {
  const { setValue, value } = useField<boolean>({ path })

  return (
    <label className="bw-builder__control bw-builder__control--inline">
      <input
        checked={value === true}
        onChange={(event) => setValue(event.target.checked)}
        type="checkbox"
      />
      <span className="bw-builder__control-label">{label}</span>
    </label>
  )
}
