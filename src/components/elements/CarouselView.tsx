'use client'

import NextImage from 'next/image'

import { useScrollCarousel } from '@/components/ui/use-scroll-carousel'

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

/** Slider on the browser's own scroller, wired the same way as the hand-built carousels on
 * the site. See `src/components/ui/use-scroll-carousel.ts`. */
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
  const {
    active: selected,
    ref: viewportRef,
    scrollPrev,
    scrollNext,
    scrollTo,
  } = useScrollCarousel({
    autoplayMs: autoplay && mode === 'site' ? Math.max(interval, 1) * 1000 : undefined,
    count: slides.length,
    loop,
    // The only carousel here that draws dots, so the only one that pays for tracking them.
    trackActive: showDots,
  })

  // Looping needs a second, identical copy to wrap into, so the track renders every slide
  // twice and the duplicates are hidden from assistive technology. Without loop the track is
  // just the slides and the scroller stops at both ends.
  const track = loop ? [...slides, ...slides] : slides
  const basis = BASIS[slidesPerView] ?? BASIS[1]!
  const sizes =
    slidesPerView >= 3
      ? '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw'
      : slidesPerView === 2
        ? '(min-width: 640px) 50vw, 100vw'
        : '100vw'

  return (
    <div className="bw-el-carousel">
      <div className="bw-el-carousel__viewport" ref={viewportRef}>
        <div className="bw-el-carousel__track" style={{ gap }}>
          {track.map((slide, index) => {
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
                aria-hidden={index >= slides.length}
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
            onClick={scrollPrev}
            type="button"
          >
            ‹
          </button>
          <button
            aria-label={labels.next}
            className="bw-el-carousel__arrow"
            onClick={scrollNext}
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
              onClick={() => scrollTo(index)}
              type="button"
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}
