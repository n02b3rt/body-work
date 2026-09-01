import { mediaFrom } from '@/lib/media'

import type { ElementProps } from '../BuilderRender'

function embedUrl(source: string, url: string): string | null {
  try {
    if (source === 'youtube') {
      const parsed = new URL(url)
      const id = parsed.hostname.includes('youtu.be')
        ? parsed.pathname.slice(1)
        : parsed.searchParams.get('v')
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : null
    }
    if (source === 'vimeo') {
      const parsed = new URL(url)
      const id = parsed.pathname.split('/').filter(Boolean).pop()
      return id ? `https://player.vimeo.com/video/${id}` : null
    }
  } catch {
    return null
  }
  return null
}

export function Video({ node, ctx }: ElementProps) {
  const source = typeof node.props.source === 'string' ? node.props.source : 'upload'
  const url = typeof node.props.url === 'string' ? node.props.url : ''
  const posterId = typeof node.props.posterId === 'number' ? node.props.posterId : null
  const poster = posterId ? ctx.media[posterId] : undefined
  const posterUrl = poster ? mediaFrom(poster, 'content')?.url : undefined

  if (source === 'upload') {
    const mediaId = typeof node.props.mediaId === 'number' ? node.props.mediaId : null
    const media = mediaId ? ctx.media[mediaId] : undefined
    const resolved = media ? mediaFrom(media, 'content') : null
    if (!resolved) {
      return (
        <div className="flex aspect-video items-center justify-center rounded-md border border-dashed border-line bg-surface-alt text-sm text-muted">
          Wybierz plik wideo w panelu ustawień
        </div>
      )
    }
    return (
      <video className="w-full rounded-md" controls poster={posterUrl} preload="metadata" src={resolved.url} />
    )
  }

  const embed = embedUrl(source, url)
  if (!embed) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-md border border-dashed border-line bg-surface-alt text-sm text-muted">
        Wklej poprawny adres {source === 'youtube' ? 'YouTube' : 'Vimeo'}
      </div>
    )
  }

  return (
    <div className="relative aspect-video overflow-hidden rounded-md">
      <iframe
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 h-full w-full"
        loading="lazy"
        src={embed}
        title="Wideo"
      />
    </div>
  )
}
