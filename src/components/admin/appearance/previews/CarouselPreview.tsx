'use client'

import React from 'react'

import { toId, useMediaDocs } from '../use-preview-data'
import { asArray, asRecord, aspect, bool, gap, num, radius, str } from './helpers'
import { MediaImage } from './MediaImage'

export function CarouselPreview({ data }: { data: unknown }) {
  const carousel = asRecord(data)
  const slides = asArray(carousel.slides)
  const ids = slides.map((slide) => toId(slide.image)).filter((id): id is string => Boolean(id))
  const media = useMediaDocs(ids)

  const perView = Math.min(Math.max(num(Number(carousel.slidesPerView), 1), 1), 3)
  const corner = radius(carousel.radius, 'md')
  const ratio = aspect(carousel.aspectRatio, '16-9')
  const visible = slides.slice(0, perView === 1 ? 1 : perView)

  return (
    <div className="bw-preview-carousel">
      <div className="bw-preview-carousel__stage">
        <div
          className="bw-preview-carousel__track"
          style={{
            gap: gap(carousel.gap),
            gridTemplateColumns: `repeat(${perView}, minmax(0, 1fr))`,
          }}
        >
          {visible.length > 0 ? (
            visible.map((slide, index) => {
              const id = toId(slide.image)
              return (
                <figure className="bw-preview-carousel__slide" key={index}>
                  <MediaImage
                    aspectRatio={ratio}
                    media={id ? media[id] : undefined}
                    placeholder="Slajd bez zdjęcia"
                    radius={corner}
                  />
                  {str(slide.caption) ? (
                    <figcaption className="bw-preview-carousel__caption">
                      {str(slide.caption)}
                    </figcaption>
                  ) : null}
                </figure>
              )
            })
          ) : (
            <MediaImage
              aspectRatio={ratio}
              placeholder="Dodaj pierwszy slajd"
              radius={corner}
            />
          )}
        </div>

        {bool(carousel.showArrows) ? (
          <>
            <span className="bw-preview-carousel__arrow bw-preview-carousel__arrow--prev">
              ‹
            </span>
            <span className="bw-preview-carousel__arrow bw-preview-carousel__arrow--next">
              ›
            </span>
          </>
        ) : null}
      </div>

      {bool(carousel.showDots) ? (
        <div className="bw-preview-carousel__dots">
          {(slides.length > 0 ? slides : [null]).map((_, index) => (
            <span
              className={`bw-preview-carousel__dot${index === 0 ? ' is-active' : ''}`}
              key={index}
            />
          ))}
        </div>
      ) : null}

      <p className="bw-preview-carousel__meta">
        {slides.length} {slides.length === 1 ? 'slajd' : 'slajdów'}
        {bool(carousel.autoplay)
          ? ` · auto co ${num(carousel.interval, 5)} s`
          : ' · przewijanie ręczne'}
        {bool(carousel.loop) ? ' · zapętlone' : ''}
      </p>
    </div>
  )
}
