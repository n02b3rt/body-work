'use client'

import type { SaveButtonClientProps } from 'payload'

import {
  FormSubmit,
  useConfig,
  useDocumentInfo,
  useEditDepth,
  useForm,
  useFormModified,
  useHotkey,
  useOperation,
  useRouteTransition,
  useTranslation,
} from '@payloadcms/ui'
import { useRouter } from 'next/navigation'
import React, { useRef } from 'react'

import { markMediaGotoLibrary, mediaLibraryPath, consumeMediaGotoLibrary } from './media-goto-library'

/**
 * On create, after a successful save, send the editor to the media library list
 * instead of the new document's edit view (Payload's default).
 */
export function MediaSaveButton({ label: labelProp }: SaveButtonClientProps) {
  const { uploadStatus } = useDocumentInfo()
  const { t } = useTranslation()
  const { submit } = useForm()
  const modified = useFormModified()
  const label = labelProp || t('general:save')
  const ref = useRef<HTMLButtonElement>(null)
  const editDepth = useEditDepth()
  const operation = useOperation()
  const router = useRouter()
  const { startRouteTransition } = useRouteTransition()
  const {
    config: {
      routes: { admin: adminRoute },
    },
  } = useConfig()

  const disabled =
    (operation === 'update' && !modified) || uploadStatus === 'uploading'

  useHotkey(
    {
      cmdCtrlKey: true,
      editDepth,
      keyCodes: ['s'],
    },
    (e) => {
      e.preventDefault()
      e.stopPropagation()
      if (disabled) return
      ref.current?.click()
    },
  )

  const handleSubmit = () => {
    if (uploadStatus === 'uploading') return

    if (operation !== 'create') {
      void submit()
      return
    }

    markMediaGotoLibrary()
    void (async () => {
      const result = await submit({ disableSuccessStatus: true })
      const ok = result?.res && result.res.status < 400
      if (!ok) {
        consumeMediaGotoLibrary()
        return
      }
      const path = mediaLibraryPath(adminRoute)
      startRouteTransition(() => {
        router.replace(path)
      })
    })()
  }

  return (
    <FormSubmit
      buttonId="action-save"
      disabled={disabled}
      onClick={handleSubmit}
      ref={ref}
      size="medium"
      type="button"
    >
      {label}
    </FormSubmit>
  )
}
