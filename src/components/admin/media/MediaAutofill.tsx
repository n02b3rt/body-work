'use client'

import type { UIFieldClientComponent } from 'payload'

import {
  mediaKindFromMime,
  suggestAltFromFilename,
  suggestSlugFromFilename,
} from '@/lib/media-filename'
import { useForm, useFormFields } from '@payloadcms/ui'
import React, { useEffect, useRef } from 'react'

function asNonEmpty(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value : undefined
}

/**
 * When the editor picks a file (before save), fill title / ALT / slug / kind from
 * the filename and MIME. Server hooks still do the same on submit as a safety net.
 */
export const MediaAutofill: UIFieldClientComponent = () => {
  const { dispatchFields, setModified, getDataByPath } = useForm()
  const file = useFormFields(([fields]) => fields.file?.value)
  const lastKey = useRef<string | null>(null)

  useEffect(() => {
    if (!(file instanceof File)) {
      lastKey.current = null
      return
    }

    const key = `${file.name}:${file.size}:${file.lastModified}:${file.type}`
    if (lastKey.current === key) return
    lastKey.current = key

    const suggestedTitle = suggestAltFromFilename(file.name)
    const suggestedSlug = suggestSlugFromFilename(file.name)
    const suggestedKind = mediaKindFromMime(file.type || undefined)
    const decorative = Boolean(getDataByPath?.('isDecorative'))

    let changed = false

    if (!asNonEmpty(getDataByPath?.('title')) && suggestedTitle) {
      dispatchFields({ type: 'UPDATE', path: 'title', value: suggestedTitle })
      changed = true
    }

    if (!decorative && !asNonEmpty(getDataByPath?.('alt')) && suggestedTitle) {
      dispatchFields({ type: 'UPDATE', path: 'alt', value: suggestedTitle })
      changed = true
    }

    if (!asNonEmpty(getDataByPath?.('slug')) && suggestedSlug) {
      dispatchFields({ type: 'UPDATE', path: 'slug', value: suggestedSlug })
      changed = true
    }

    // Kind always follows MIME on file pick — classification is derived, not editorial.
    dispatchFields({ type: 'UPDATE', path: 'kind', value: suggestedKind })
    changed = true

    if (changed) setModified(true)
  }, [dispatchFields, file, getDataByPath, setModified])

  return null
}
