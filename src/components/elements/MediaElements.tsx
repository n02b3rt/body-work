/**
 * Gallery, carousel and video.
 *
 * The two interactive ones resolve their data here and hand plain,
 * serializable props to a `'use client'` view — which is what lets the same
 * component render from a Server Component on the site and from the builder
 * canvas in the panel.
 */

import { asArray, asRecord, aspect, bool, num, str } from '@/lib/component-values'
import { radiusValue, space } from '@/lib/element-styles'
import { mediaFrom } from '@/lib/media'

import { ElementPlaceholder } from './BasicElements'
import { CarouselView, type CarouselSlide } from './CarouselView'
import { GalleryView, type GalleryTile } from './GalleryView'
import { gridColumnsAttr } from './grid'
import type { ElementCtx } from './types'

type ElementProps = { ctx: ElementCtx; data: Record<string, unknown> }

export function GalleryElement({ ctx, data }: ElementProps) {
  const raw = Array.isArray(data.images) ? data.images : [data.images]

  const tiles = raw.reduce<GalleryTile[]>((acc, value) => {
    const image = mediaFrom(value, 'content')
    if (!image) return acc
    const caption = asRecord(value).caption
    acc.push({
      alt: image.alt,
      blurDataURL: image.blurDataURL,
      caption: typeof caption === 'string' ? caption : undefined,
      height: image.height,
      url: image.url,
      width: image.width,
    })
    return acc
  }, [])

  if (tiles.length === 0) {
    return ctx.mode === 'admin' ? <ElementPlaceholder label="Galeria: wybierz zdjęcia" /> : null
  }

  return (
    <GalleryView
      aspectRatio={aspect(data.aspectRatio, '1-1')}
      columns={Number(gridColumnsAttr(data.columns))}
      gap={space(data.gap, 'md')}
      labels={ctx.labels}
      lightbox={bool(data.lightbox) && ctx.mode === 'site'}
      radius={radiusValue(data.radius, 'md')}
      showCaptions={bool(data.showCaptions)}
      tiles={tiles}
    />
  )
}

export function CarouselElement({ ctx, data }: ElementProps) {
  const slides = asArray(data.slides).reduce<CarouselSlide[]>((acc, slide) => {
    const image = mediaFrom(slide.image, 'content', str(slide.caption))
    if (!image) return acc
    acc.push({
      alt: image.alt,
      blurDataURL: image.blurDataURL,
      caption: str(slide.caption) || undefined,
      href: str(slide.href) || undefined,
      newTab: bool(slide.newTab),
      url: image.url,
    })
    return acc
  }, [])

  if (slides.length === 0) {
    return ctx.mode === 'admin' ? <ElementPlaceholder label="Karuzela: dodaj slajdy" /> : null
  }

  const perView = Math.min(Math.max(Math.round(num(Number(data.slidesPerView), 1)), 1), 3)

  return (
    <CarouselView
      aspectRatio={aspect(data.aspectRatio, '16-9')}
      autoplay={bool(data.autoplay)}
      gap={space(data.gap, 'md')}
      interval={num(data.interval, 5)}
      labels={ctx.labels}
      loop={bool(data.loop)}
      mode={ctx.mode}
      radius={radiusValue(data.radius, 'md')}
      showArrows={bool(data.showArrows)}
      showDots={bool(data.showDots)}
      slides={slides}
      slidesPerView={perView}
    />
  )
}

/** `https://youtu.be/ID`, `watch?v=ID`, `/embed/ID` — all of them reach an embed URL. */
function embedUrl(source: string, raw: string): null | string {
  const url = raw.trim()
  if (!url) return null

  if (source === 'youtube') {
    const id =
      url.match(/[?&]v=([\w-]{6,})/)?.[1] ??
      url.match(/youtu\.be\/([\w-]{6,})/)?.[1] ??
      url.match(/embed\/([\w-]{6,})/)?.[1]
    return id ? `https://www.youtube-nocookie.com/embed/${id}` : null
  }

  if (source === 'vimeo') {
    const id = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)?.[1]
    return id ? `https://player.vimeo.com/video/${id}` : null
  }

  return null
}

export function VideoElement({ ctx, data }: ElementProps) {
  const source = str(data.source, 'file')
  const ratio = aspect(data.aspectRatio, '16-9')
  const corner = radiusValue(data.radius, 'md')

  if (source === 'youtube' || source === 'vimeo') {
    const src = embedUrl(source, str(data.url))
    if (!src) {
      return ctx.mode === 'admin' ? <ElementPlaceholder label="Wideo: wklej adres" /> : null
    }

    return (
      <div className="bw-el-video" style={{ aspectRatio: ratio, borderRadius: corner }}>
        <iframe
          allow="accelerometer; clipboard-write; encrypted-media; picture-in-picture"
          allowFullScreen
          src={src}
          title="Wideo"
        />
      </div>
    )
  }

  const file = mediaFrom(data.file, 'hero')
  const poster = mediaFrom(data.poster, 'hero')

  if (!file) {
    return ctx.mode === 'admin' ? <ElementPlaceholder label="Wideo: wybierz plik" /> : null
  }

  return (
    <div className="bw-el-video" style={{ aspectRatio: ratio, borderRadius: corner }}>
      {/* Autoplay is suppressed on the canvas: a looping film under the editor's
        * cursor makes the layout impossible to judge. */}
      <video
        autoPlay={bool(data.autoplay) && ctx.mode === 'site'}
        controls={bool(data.controls)}
        loop={bool(data.loop)}
        muted={bool(data.muted)}
        playsInline
        poster={poster?.url}
        preload="metadata"
        src={file.url}
      />
    </div>
  )
}
