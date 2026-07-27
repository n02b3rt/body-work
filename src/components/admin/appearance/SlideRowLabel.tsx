'use client'

import { useRowLabel } from '@payloadcms/ui'
import React from 'react'

type SlideRow = {
  caption?: string | null
}

/** Carousel rows read better as "Slajd 2 — Sala treningowa". */
export function SlideRowLabel() {
  const { data, rowNumber } = useRowLabel<SlideRow>()
  const index = (rowNumber ?? 0) + 1
  const caption = data?.caption?.trim()

  return <span>{caption ? `Slajd ${index} — ${caption}` : `Slajd ${index}`}</span>
}
