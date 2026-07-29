'use client'

import Autoplay from 'embla-carousel-autoplay'
import useEmblaCarousel from 'embla-carousel-react'
import NextImage from 'next/image'
import { useCallback, useEffect, useState } from 'react'

import { ElementLink } from './ElementLink'
import type { ElementLabels, ElementMode } from './types'

export type CarouselSlide = {
  alt: string
  blurDataURL?: string
  caption?: string
  href?: string
  newTab?: boolean
  url: string
}

type Props = {
  aspectRatio: string
  autoplay: boolean
  gap: string
  interval: number
  labels: ElementLabels
  loop: boolean
  mode: ElementMode
  radius: string
  showArrows: boolean
  showDots: boolean
  slides: CarouselSlide[]
  slidesPerView: number
}

const BASIS: Record<number, string> = {
  1: '100%',
  2: '50%',
  3: '33.3333%',
}

/** Embla-backed slider, wired the same way as the hand-built carousels on the site. */
export function CarouselView({
  aspectRatio,
  autoplay,
  gap,
  interval,
  labels,
  loop,
  mode,
  radius,
  showArrows,
  showDots,
  slides,
  slidesPerView,
}: Props) {
  // Autoplay would fight the editor on the canvas, so it only runs on the site.
  const [plugin] = useState(() =>
    autoplay && mode === 'site'
      ? [Autoplay({ delay: Math.max(interval, 1) * 1000, stopOnInteraction: false })]
      : [],
  )
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: 'start', loop }, plugin)
  const [selected, setSelected] = useState(0)

  const onSelect = useCallback((api: { selectedScrollSnap: () => number }) => {
    setSelected(api.selectedScrollSnap())
  }, [])

  // Subscribe only: reading the snap synchronously here would be a `setState` in
  // an effect body, which the React Compiler rejects outright in this project.
  useEffect(() => {
    if (!emblaApi) return
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)
    return () => {
      emblaApi.off('select', onSelect)
      emblaApi.off('reInit', onSelect)
    }
  }, [emblaApi, onSelect])

  const basis = BASIS[slidesPerView] ?? BASIS[1]!
  const sizes =
    slidesPerView >= 3
      ? '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw'
      : slidesPerView === 2
        ? '(min-width: 640px) 50vw, 100vw'
        : '100vw'

  return (
    <div className="bw-el-carousel">
      <div className="bw-el-carousel__viewport" ref={emblaRef}>
        <div className="bw-el-carousel__track" style={{ gap }}>
          {slides.map((slide, index) => {
            const picture = (
              <span className="bw-el-frame" style={{ aspectRatio, borderRadius: radius }}>
                <NextImage
                  alt={slide.alt}
                  fill
                  sizes={sizes}
                  src={slide.url}
                  {...(slide.blurDataURL
                    ? { blurDataURL: slide.blurDataURL, placeholder: 'blur' as const }
                    : {})}
                />
              </span>
            )

            return (
              <figure
                className="bw-el-carousel__slide bw-el-figure"
                key={`${slide.url}-${index}`}
                style={{ flexBasis: `calc(${basis} - ${gap})` }}
              >
                {slide.href ? (
                  <ElementLink href={slide.href} mode={mode} newTab={slide.newTab}>
                    {picture}
                  </ElementLink>
                ) : (
                  picture
                )}
                {slide.caption ? (
                  <figcaption className="bw-el-caption">{slide.caption}</figcaption>
                ) : null}
              </figure>
            )
          })}
        </div>
      </div>

      {showArrows && slides.length > slidesPerView ? (
        <div className="bw-el-carousel__nav">
          <button
            aria-label={labels.previous}
            className="bw-el-carousel__arrow"
            onClick={() => emblaApi?.scrollPrev()}
            type="button"
          >
            ‹
          </button>
          <button
            aria-label={labels.next}
            className="bw-el-carousel__arrow"
            onClick={() => emblaApi?.scrollNext()}
            type="button"
          >
            ›
          </button>
        </div>
      ) : null}

      {showDots && slides.length > slidesPerView ? (
        <div className="bw-el-carousel__dots">
          {slides.map((slide, index) => (
            <button
              aria-current={index === selected}
              aria-label={`${labels.slide} ${index + 1}`}
              className="bw-el-carousel__dot"
              key={`${slide.url}-dot-${index}`}
              onClick={() => emblaApi?.scrollTo(index)}
              type="button"
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}
