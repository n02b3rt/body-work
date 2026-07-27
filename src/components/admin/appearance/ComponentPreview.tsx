'use client'

import type { UIFieldClientComponent } from 'payload'

import { useAllFormFields } from '@payloadcms/ui'
import { reduceFieldsToValues } from 'payload/shared'
import React from 'react'

import { COMPONENT_TYPES } from '@/fields/component-settings'

import { ButtonChip } from './previews/ButtonChip'
import { CarouselPreview } from './previews/CarouselPreview'
import { CtaPreview } from './previews/CtaPreview'
import { FeaturesPreview } from './previews/FeaturesPreview'
import { GalleryPreview } from './previews/GalleryPreview'
import { HeroPreview } from './previews/HeroPreview'
import { themeCssVarStyle } from './use-theme-colors'
import { useSavedThemeColors } from './use-preview-data'

/** Live render of the component being edited, using the saved theme palette. */
export const ComponentPreview: UIFieldClientComponent = () => {
  const [fields] = useAllFormFields()
  const colors = useSavedThemeColors()

  const data = React.useMemo(
    () => reduceFieldsToValues(fields, true) as Record<string, unknown>,
    [fields],
  )

  const type = typeof data.type === 'string' ? data.type : 'button'
  const definition = COMPONENT_TYPES.find((entry) => entry.value === type)

  return (
    <div className="bw-appearance-block">
      <div className="bw-appearance-block__head">
        <h3 className="bw-appearance-block__title">Podgląd komponentu</h3>
        <p className="bw-appearance-block__lead">
          {definition?.hint ??
            'Podgląd odświeża się na bieżąco: kolory pochodzą z zapisanego schematu kolorów.'}
        </p>
      </div>

      <div className="bw-preview-canvas" style={themeCssVarStyle(colors)}>
        {type === 'button' ? (
          <div className="bw-preview-canvas__center">
            <ButtonChip data={data.button} />
          </div>
        ) : null}
        {type === 'hero' ? <HeroPreview data={data.hero} /> : null}
        {type === 'carousel' ? <CarouselPreview data={data.carousel} /> : null}
        {type === 'gallery' ? <GalleryPreview data={data.gallery} /> : null}
        {type === 'cta' ? <CtaPreview data={data.cta} /> : null}
        {type === 'features' ? <FeaturesPreview data={data.features} /> : null}
      </div>
    </div>
  )
}
