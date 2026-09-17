import NextImage from 'next/image'

import { mediaFrom } from '@/lib/media'

import type { ElementProps } from '../BuilderRender'

export function Gallery({ node, ctx }: ElementProps) {
  const ids = Array.isArray(node.props.mediaIds) ? (node.props.mediaIds as number[]) : []
  if (ids.length === 0) {
    return (
      <div className="flex aspect-[3/1] items-center justify-center rounded-md border border-dashed border-line bg-surface-alt text-sm text-muted">
        Wybierz zdjęcia w panelu ustawień
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {ids.map((id) => {
        const media = ctx.media[id]
        const resolved = media ? mediaFrom(media, 'card') : null
        if (!resolved) return null
        return (
          <span className="relative block aspect-square overflow-hidden rounded-md" key={id}>
            <NextImage alt={resolved.alt} className="object-cover" fill sizes="50vw" src={resolved.url} />
          </span>
        )
      })}
    </div>
  )
}
