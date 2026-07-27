'use client'

import { useRowLabel } from '@payloadcms/ui'
import React from 'react'

type CardRow = {
  title?: string | null
}

export function CardRowLabel() {
  const { data, rowNumber } = useRowLabel<CardRow>()
  const index = (rowNumber ?? 0) + 1
  const title = data?.title?.trim()

  return <span>{title ? `Karta ${index}: ${title}` : `Karta ${index}`}</span>
}
