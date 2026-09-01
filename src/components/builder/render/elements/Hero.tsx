import NextImage from 'next/image'

import { mediaFrom } from '@/lib/media'

import type { ElementProps } from '../BuilderRender'

type HeroButton = { label?: string; href?: string }

export function Hero({ node, ctx }: ElementProps) {
  const mediaId = typeof node.props.mediaId === 'number' ? node.props.mediaId : null
  const media = mediaId ? ctx.media[mediaId] : undefined
  const resolved = media ? mediaFrom(media, 'hero') : null
  const heading = typeof node.props.heading === 'string' ? node.props.heading : ''
  const subheading = typeof node.props.subheading === 'string' ? node.props.subheading : ''
  const buttons = Array.isArray(node.props.buttons) ? (node.props.buttons as HeroButton[]) : []

  return (
    <div className="relative flex min-h-[420px] items-center overflow-hidden rounded-md">
      {resolved ? (
        <NextImage
          alt={resolved.alt}
          className="absolute inset-0 object-cover"
          fill
          priority
          sizes="100vw"
          src={resolved.url}
        />
      ) : (
        <div className="absolute inset-0 bg-surface-alt" />
      )}
      <div className="absolute inset-0 bg-brand-navy/40" aria-hidden="true" />
      <div className="relative z-10 mx-auto flex max-w-[720px] flex-col items-center gap-4 px-6 text-center text-inverted">
        {heading ? (
          <h2 className="text-h-hero" dangerouslySetInnerHTML={{ __html: heading }} />
        ) : null}
        {subheading ? (
          <p className="text-body" dangerouslySetInnerHTML={{ __html: subheading }} />
        ) : null}
        {buttons.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            {buttons.map((button, index) => (
              <a
                className="inline-flex items-center rounded-md bg-brand px-6 py-3 text-btn uppercase tracking-wide text-inverted hover:bg-brand-hover"
                href={button.href || '#'}
                key={index}
              >
                {button.label}
              </a>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}
