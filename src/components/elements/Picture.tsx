/**
 * One picture, drawn the same way in the builder canvas and on the site.
 *
 * `next/image` works in both: the admin panel is served by the same Next app, so
 * `/_next/image` is reachable there too and `images.localPatterns` already
 * allows `/api/media/file/**`.
 *
 * Two modes, decided by whether a crop was asked for: a fixed aspect ratio fills
 * its frame (`fill` + `object-fit`), and "oryginalne" lays the file out at its
 * own proportions.
 */

import NextImage from 'next/image'

import { ASPECT_RATIO_VALUES } from '@/lib/component-styles'
import { mediaFrom, type SizeName } from '@/lib/media'

type Props = {
  aspectRatio?: unknown
  className?: string
  fallbackAlt?: string
  fit?: unknown
  media: unknown
  /** Passed to `next/image`; the caller knows how wide the frame really is. */
  sizes?: string
  size?: SizeName
  radius?: string
}

export function Picture({
  aspectRatio,
  className,
  fallbackAlt = '',
  fit,
  media,
  radius,
  size = 'content',
  sizes = '100vw',
}: Props) {
  const image = mediaFrom(media, size, fallbackAlt)
  if (!image) return null

  const ratioKey = typeof aspectRatio === 'string' ? aspectRatio : 'auto'
  const ratio =
    ratioKey in ASPECT_RATIO_VALUES
      ? ASPECT_RATIO_VALUES[ratioKey as keyof typeof ASPECT_RATIO_VALUES]
      : null

  const blur = image.blurDataURL
    ? { blurDataURL: image.blurDataURL, placeholder: 'blur' as const }
    : {}

  if (!ratio) {
    return (
      <span
        className={['bw-el-frame', 'bw-el-frame--auto', className].filter(Boolean).join(' ')}
        style={{ borderRadius: radius }}
      >
        <NextImage
          alt={image.alt}
          height={image.height ?? 800}
          sizes={sizes}
          src={image.url}
          width={image.width ?? 1200}
          {...blur}
        />
      </span>
    )
  }

  return (
    <span
      className={['bw-el-frame', className].filter(Boolean).join(' ')}
      data-fit={fit === 'contain' ? 'contain' : 'cover'}
      style={{ aspectRatio: ratio, borderRadius: radius }}
    >
      <NextImage alt={image.alt} fill sizes={sizes} src={image.url} {...blur} />
    </span>
  )
}
