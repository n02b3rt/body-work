'use client'

import type { BeforeDocumentControlsClientProps } from 'payload'

import { useConfig, useDocumentInfo, useRouteTransition } from '@payloadcms/ui'
import { useRouter } from 'next/navigation'
import React, { useEffect } from 'react'

import { consumeMediaGotoLibrary, mediaLibraryPath } from './media-goto-library'

/**
 * If create saved with the library-redirect marker and Payload navigated to the
 * new document edit view first, bounce to the media library list instead.
 */
export function MediaGotoLibrary(_props: BeforeDocumentControlsClientProps) {
  const { id } = useDocumentInfo()
  const router = useRouter()
  const { startRouteTransition } = useRouteTransition()
  const {
    config: {
      routes: { admin: adminRoute },
    },
  } = useConfig()

  useEffect(() => {
    if (!id) return
    if (!consumeMediaGotoLibrary()) return
    const path = mediaLibraryPath(adminRoute)
    startRouteTransition(() => {
      router.replace(path)
    })
  }, [adminRoute, id, router, startRouteTransition])

  return null
}
