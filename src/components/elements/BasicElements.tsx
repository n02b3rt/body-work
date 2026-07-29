/**
 * The everyday elements: heading, text, picture, buttons, icon list, divider,
 * spacer.
 *
 * No `'use client'` and no Tailwind: these render inside the builder canvas as
 * well as on the site, and the admin panel loads neither next-intl's provider
 * nor Tailwind's utilities. Layout comes from `src/styles/elements.css`, the
 * editor's own choices from inline styles.
 */

import { RichText } from '@payloadcms/richtext-lexical/react'
import type { CSSProperties } from 'react'

import { asArray, bool, color, columnCount, num, str } from '@/lib/component-values'
import { elementJustify, radiusValue, space } from '@/lib/element-styles'

import { ElementButton } from './ElementButton'
import { ElementLink } from './ElementLink'
import { Icon } from './Icon'
import { Picture } from './Picture'
import type { ElementCtx } from './types'

type ElementProps = { ctx: ElementCtx; data: Record<string, unknown> }

export function HeadingElement({ data }: ElementProps) {
  const text = str(data.text)
  if (!text) return null

  const level = str(data.level, 'h2')
  const Tag = (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(level) ? level : 'h2') as 'h2'

  return (
    <Tag
      className="bw-el-heading"
      data-size={str(data.size, 'lg')}
      style={{ color: color(data.color, 'text.heading') }}
    >
      {text}
    </Tag>
  )
}

export function TextElement({ data }: ElementProps) {
  const content = data.content
  if (!content || typeof content !== 'object') return null

  return (
    <div
      className={['bw-el-text', bool(data.measure) ? 'bw-el-text--prose' : '']
        .filter(Boolean)
        .join(' ')}
    >
      <RichText data={content as Parameters<typeof RichText>[0]['data']} />
    </div>
  )
}

export function ImageElement({ ctx, data }: ElementProps) {
  const caption = str(data.caption)
  const corner = radiusValue(data.radius, 'none')

  const picture = (
    <Picture
      aspectRatio={data.aspectRatio}
      fallbackAlt={caption}
      fit={data.fit}
      media={data.image}
      radius={corner}
      size="content"
      sizes="(min-width: 1024px) 50vw, 100vw"
    />
  )

  if (!picture) return null

  return (
    <figure className="bw-el-figure">
      {data.href ? (
        <ElementLink href={data.href} mode={ctx.mode} newTab={data.newTab}>
          {picture}
        </ElementLink>
      ) : (
        picture
      )}
      {caption ? <figcaption className="bw-el-caption">{caption}</figcaption> : null}
    </figure>
  )
}

export function ButtonsElement({ ctx, data }: ElementProps) {
  const items = asArray(data.items)
  if (items.length === 0) return null

  return (
    <div
      className="bw-el-buttons"
      style={{ gap: space(data.gap, 'sm'), justifyContent: elementJustify(data.align) }}
    >
      {items.map((item, index) => (
        <ElementButton data={item} key={index} mode={ctx.mode} />
      ))}
    </div>
  )
}

export function IconListElement({ ctx, data }: ElementProps) {
  const items = asArray(data.items)
  if (items.length === 0) return null

  const iconColor = color(data.iconColor, 'brand.primary')

  return (
    <ul
      className="bw-el-grid bw-el-iconlist"
      data-cols={String(columnCount(data.columns, 1))}
      style={{ gap: space(data.gap, 'sm') }}
    >
      {items.map((item, index) => {
        const label = str(item.text)
        return (
          <li className="bw-el-iconlist__item" key={index}>
            <Icon color={iconColor} name={item.icon} />
            {item.href ? (
              <ElementLink href={item.href} mode={ctx.mode} newTab={item.newTab}>
                {label}
              </ElementLink>
            ) : (
              <span>{label}</span>
            )}
          </li>
        )
      })}
    </ul>
  )
}

export function DividerElement({ data }: ElementProps) {
  const width = Math.min(Math.max(num(data.widthPercent, 100), 5), 100)
  const thickness = Math.min(Math.max(num(data.thickness, 1), 1), 20)

  return (
    <hr
      className="bw-el-divider"
      style={{
        borderTop: `${thickness}px ${str(data.lineStyle, 'solid')} ${
          color(data.color, 'surface.border') ?? 'currentColor'
        }`,
        width: `${width}%`,
      }}
    />
  )
}

export function SpacerElement({ data }: ElementProps) {
  const height = Math.min(Math.max(num(data.height, 48), 0), 400)
  const mobile = data.heightMobile === null || data.heightMobile === undefined
    ? null
    : Math.min(Math.max(num(data.heightMobile, height), 0), 400)

  return (
    <div
      aria-hidden="true"
      className="bw-el-spacer"
      style={
        {
          '--bw-spacer-h': `${height}px`,
          ...(mobile === null ? {} : { '--bw-spacer-h-mobile': `${mobile}px` }),
        } as CSSProperties
      }
    />
  )
}

/** Shown on the canvas when an element has nothing to draw yet. */
export function ElementPlaceholder({ label }: { label: string }) {
  return <div className="bw-el-placeholder">{label}</div>
}
