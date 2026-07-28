'use client'

import React from 'react'

import { ButtonChip } from '@/components/admin/appearance/previews/ButtonChip'
import { CarouselPreview } from '@/components/admin/appearance/previews/CarouselPreview'
import { CtaPreview } from '@/components/admin/appearance/previews/CtaPreview'
import { FeaturesPreview } from '@/components/admin/appearance/previews/FeaturesPreview'
import { GalleryPreview } from '@/components/admin/appearance/previews/GalleryPreview'
import { HeroPreview } from '@/components/admin/appearance/previews/HeroPreview'

import type { LibraryComponent } from './use-site-components'

/**
 * Renders one library component on the canvas.
 *
 * Deliberately the *same* renderers the component editor uses, so a block looks
 * the same wherever it is previewed. They read the settings group named after
 * the component type (`doc.hero`, `doc.cta`, …).
 */
export function SectionPreview({ doc }: { doc: LibraryComponent }) {
  const type = typeof doc.type === 'string' ? doc.type : ''
  const settings = doc[type]

  switch (type) {
    case 'button':
      return (
        <div className="bw-builder__center">
          <ButtonChip data={settings} />
        </div>
      )
    case 'hero':
      return <HeroPreview data={settings} />
    case 'carousel':
      return <CarouselPreview data={settings} />
    case 'gallery':
      return <GalleryPreview data={settings} />
    case 'cta':
      return <CtaPreview data={settings} />
    case 'features':
      return <FeaturesPreview data={settings} />
    default:
      return (
        <p className="bw-builder__notice">
          Nieznany typ komponentu: <code>{type || 'brak'}</code>.
        </p>
      )
  }
}
