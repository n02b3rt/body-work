import NextImage from 'next/image'

import { mediaFrom } from '@/lib/media'

import type { ElementProps } from '../BuilderRender'

const ASPECT_RATIO: Record<string, string> = {
  '1/1': '1 / 1',
  '4/3': '4 / 3',
  '16/9': '16 / 9',
}

export function ImageEl({ node, ctx }: ElementProps) {
  const mediaId = typeof node.props.mediaId === 'number' ? node.props.mediaId : null
  const media = mediaId ? ctx.media[mediaId] : undefined
  const resolved = media ? mediaFrom(media, 'content') : null
  const caption = typeof node.props.caption === 'string' ? node.props.caption : ''
  const ratioKey = typeof node.props.aspectRatio === 'string' ? node.props.aspectRatio : 'auto'
  const fit = node.props.fit === 'contain' ? 'contain' : 'cover'
  const ratio = ASPECT_RATIO[ratioKey]

  if (!resolved) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center rounded-md border border-dashed border-line bg-surface-alt text-sm text-muted">
        Wybierz zdjęcie w panelu ustawień
      </div>
    )
  }

  const blur = resolved.blurDataURL
    ? { placeholder: 'blur' as const, blurDataURL: resolved.blurDataURL }
    : {}

  return (
    <figure>
      {ratio ? (
        <span className="relative block w-full overflow-hidden" style={{ aspectRatio: ratio }}>
          <NextImage
            alt={resolved.alt}
            className={fit === 'contain' ? 'object-contain' : 'object-cover'}
            fill
            sizes="100vw"
            src={resolved.url}
            {...blur}
          />
        </span>
      ) : (
        <NextImage
          alt={resolved.alt}
          className="h-auto w-full"
          height={resolved.height ?? 800}
          sizes="100vw"
          src={resolved.url}
          width={resolved.width ?? 1200}
          {...blur}
        />
      )}
      {caption ? <figcaption className="pt-2 text-sm text-muted">{caption}</figcaption> : null}
    </figure>
  )
}
