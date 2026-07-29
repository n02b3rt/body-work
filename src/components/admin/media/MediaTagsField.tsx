'use client'

import type { TextFieldClientComponent } from 'payload'

import { FieldDescription, FieldError, FieldLabel, useField } from '@payloadcms/ui'
import React, { useCallback, useState } from 'react'

function normalizeTag(raw: string): string {
  return raw.trim().replace(/\s+/g, ' ')
}

function parseTags(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((item): item is string => typeof item === 'string')
    .map(normalizeTag)
    .filter(Boolean)
}

/**
 * Comma-separated tags with chip UI: typing `,` (or Enter) commits the current
 * token into a tagged pill; Backspace on an empty input removes the last tag.
 */
export const MediaTagsField: TextFieldClientComponent = ({ field, path, readOnly }) => {
  const { setValue, showError, errorMessage, value } = useField<string[]>({ path })
  const tags = parseTags(value)
  const [draft, setDraft] = useState('')
  const description = field?.admin?.description

  const commit = useCallback(
    (raw: string) => {
      const next = normalizeTag(raw)
      if (!next) return
      const lower = next.toLowerCase()
      if (tags.some((tag) => tag.toLowerCase() === lower)) {
        setDraft('')
        return
      }
      setValue([...tags, next])
      setDraft('')
    },
    [setValue, tags],
  )

  const removeAt = useCallback(
    (index: number) => {
      setValue(tags.filter((_, i) => i !== index))
    },
    [setValue, tags],
  )

  return (
    <div className="field-type text bw-media-tags">
      <FieldLabel label={field?.label} path={path} required={field?.required} />
      <div
        className={`bw-media-tags__box${readOnly ? ' is-readonly' : ''}`}
        onClick={(event) => {
          if (readOnly) return
          const input = (event.currentTarget as HTMLElement).querySelector('input')
          input?.focus()
        }}
      >
        {tags.map((tag, index) => (
          <span className="bw-media-tags__chip" key={`${tag}-${index}`}>
            <span className="bw-media-tags__chip-label">{tag}</span>
            {readOnly ? null : (
              <button
                aria-label={`Usuń tag ${tag}`}
                className="bw-media-tags__chip-remove"
                onClick={(event) => {
                  event.stopPropagation()
                  removeAt(index)
                }}
                type="button"
              >
                ×
              </button>
            )}
          </span>
        ))}
        {readOnly ? null : (
          <input
            aria-label={typeof field?.label === 'string' ? field.label : 'Tagi'}
            className="bw-media-tags__input"
            disabled={readOnly}
            onBlur={() => commit(draft)}
            onChange={(event) => {
              const next = event.target.value
              if (next.includes(',')) {
                const parts = next.split(',')
                const head = parts.slice(0, -1)
                const tail = parts[parts.length - 1] ?? ''
                head.forEach((part) => commit(part))
                setDraft(tail)
                return
              }
              setDraft(next)
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ',') {
                event.preventDefault()
                commit(draft)
                return
              }
              if (event.key === 'Backspace' && !draft && tags.length > 0) {
                event.preventDefault()
                removeAt(tags.length - 1)
              }
            }}
            placeholder={tags.length === 0 ? 'np. fizjoterapia, sala,' : ''}
            type="text"
            value={draft}
          />
        )}
      </div>
      {showError ? <FieldError message={errorMessage} path={path} showError /> : null}
      {description ? (
        <FieldDescription description={description} path={path} />
      ) : null}
    </div>
  )
}
