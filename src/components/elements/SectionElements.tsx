/**
 * The ready-made section elements: hero band, CTA strip, feature cards and the
 * accordion's data resolution.
 *
 * These carried over from the old `site-components` types, minus the
 * relationship to a "button component": buttons are plain array rows now.
 */

import NextImage from 'next/image'
import type { ReactNode } from 'react'

import {
  asArray,
  color,
  columnCount,
  flexAlign,
  num,
  sectionHeight,
  str,
  textAlign,
} from '@/lib/component-values'
import { radiusValue, space } from '@/lib/element-styles'
import { mediaFrom } from '@/lib/media'

import { AccordionView, type AccordionItem } from './AccordionView'
import { ElementPlaceholder } from './BasicElements'
import { ElementButton } from './ElementButton'
import { ElementLink } from './ElementLink'
import { gridColumnsAttr } from './grid'
import { Icon } from './Icon'
import type { ElementCtx } from './types'

type ElementProps = { ctx: ElementCtx; data: Record<string, unknown> }

const CTA_PADDING = {
  sm: '1.5rem 1.75rem',
  md: '2.5rem 2rem',
  lg: '4rem 2.5rem',
} as const

export function HeroElement({ ctx, data }: ElementProps) {
  const image = mediaFrom(data.image, 'hero')
  const heading = str(data.heading)
  const subheading = str(data.subheading)
  const buttons = asArray(data.buttons)

  const overlay = Math.min(Math.max(num(data.overlayOpacity, 45), 0), 100) / 100

  return (
    <div
      className="bw-el-hero"
      style={{ borderRadius: radiusValue(data.radius, 'md'), minHeight: sectionHeight(data.height) }}
    >
      {image ? (
        <span className="bw-el-hero__media">
          <NextImage
            alt={image.alt}
            fill
            sizes="100vw"
            src={image.url}
            {...(image.blurDataURL
              ? { blurDataURL: image.blurDataURL, placeholder: 'blur' as const }
              : {})}
          />
        </span>
      ) : null}

      {image && overlay > 0 ? (
        <span
          aria-hidden="true"
          className="bw-el-hero__overlay"
          style={{
            background: color({ token: 'surface.overlay' }, 'surface.overlay'),
            opacity: overlay,
          }}
        />
      ) : null}

      <div
        className="bw-el-hero__body"
        style={{
          alignItems: flexAlign(data.align),
          color: color(data.textColor, 'text.inverted'),
          textAlign: textAlign(data.align),
        }}
      >
        {heading ? (
          <h2 className="bw-el-heading" data-size="xl">
            {heading}
          </h2>
        ) : null}
        {subheading ? <p style={{ margin: 0, maxWidth: '42rem' }}>{subheading}</p> : null}
        {buttons.length > 0 ? (
          <div className="bw-el-buttons" style={{ gap: space('sm') }}>
            {buttons.map((button, index) => (
              <ElementButton data={button} key={index} mode={ctx.mode} />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}

export function CtaElement({ ctx, data }: ElementProps) {
  const heading = str(data.heading)
  const text = str(data.text)
  const buttons = asArray(data.buttons)
  const paddingKey = str(data.padding, 'md') as keyof typeof CTA_PADDING

  return (
    <div
      style={{
        alignItems: flexAlign(data.align),
        background: color(data.background, 'brand.secondary'),
        borderRadius: radiusValue(data.radius, 'lg'),
        color: color(data.textColor, 'text.inverted'),
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        padding: CTA_PADDING[paddingKey] ?? CTA_PADDING.md,
        textAlign: textAlign(data.align),
        width: '100%',
      }}
    >
      {heading ? (
        <h2 className="bw-el-heading" data-size="md">
          {heading}
        </h2>
      ) : null}
      {text ? <p style={{ margin: 0, maxWidth: '42rem' }}>{text}</p> : null}
      {buttons.length > 0 ? (
        <div className="bw-el-buttons" style={{ gap: space('sm') }}>
          {buttons.map((button, index) => (
            <ElementButton data={button} key={index} mode={ctx.mode} />
          ))}
        </div>
      ) : null}
    </div>
  )
}

export function FeaturesElement({ ctx, data }: ElementProps) {
  const items = asArray(data.items)
  if (items.length === 0) {
    return ctx.mode === 'admin' ? <ElementPlaceholder label="Karty: dodaj pozycje" /> : null
  }

  const corner = radiusValue(data.radius, 'md')
  const cardBackground = color(data.cardBackground, 'surface.surface')
  const cardBorder = color(data.cardBorder, 'surface.border')
  const titleColor = color(data.titleColor, 'text.heading')
  const iconColor = color(data.iconColor, 'brand.primary')
  const cardAlign = str(data.cardAlign, 'left')

  return (
    <div
      className="bw-el-grid"
      data-cols={gridColumnsAttr(columnCount(data.columns))}
      style={{ gap: space(data.gap, 'md') }}
    >
      {items.map((item, index) => {
        const title = str(item.title)
        const text = str(item.text)
        const image = mediaFrom(item.image, 'card', title)

        return (
          <Card
            align={cardAlign}
            background={cardBackground}
            border={cardBorder}
            href={item.href}
            key={index}
            mode={ctx.mode}
            newTab={item.newTab}
            radius={corner}
          >
            {image ? (
              <NextImage
                alt={image.alt}
                height={64}
                sizes="64px"
                src={image.url}
                style={{ borderRadius: corner, height: '4rem', objectFit: 'cover', width: '4rem' }}
                width={64}
              />
            ) : (
              <Icon color={iconColor} name={item.icon} size={28} />
            )}
            {title ? (
              <strong className="bw-el-card__title" style={{ color: titleColor }}>
                {title}
              </strong>
            ) : null}
            {text ? <span className="bw-el-card__text">{text}</span> : null}
          </Card>
        )
      })}
    </div>
  )
}

function Card({
  align,
  background,
  border,
  children,
  href,
  mode,
  newTab,
  radius,
}: {
  align: string
  background?: string
  border?: string
  children: ReactNode
  href: unknown
  mode: ElementCtx['mode']
  newTab: unknown
  radius: string
}) {
  const centred = align === 'center'
  const style = {
    alignItems: centred ? ('center' as const) : undefined,
    background,
    border: `1px solid ${border ?? 'transparent'}`,
    borderRadius: radius,
    textAlign: centred ? ('center' as const) : undefined,
  }

  if (!href) {
    return (
      <div className="bw-el-card" data-align={align} style={style}>
        {children}
      </div>
    )
  }

  // `ElementLink` renders a `span` in the builder, which `.bw-el-card`'s own
  // `display: flex` makes behave exactly like the `div` above.
  return (
    <ElementLink className="bw-el-card" href={href} mode={mode} newTab={newTab} style={style}>
      {children}
    </ElementLink>
  )
}

export function AccordionElement({ ctx, data }: ElementProps) {
  const items = asArray(data.items).reduce<AccordionItem[]>((acc, item) => {
    const title = str(item.title)
    if (!title) return acc
    acc.push({ content: item.content, title })
    return acc
  }, [])

  if (items.length === 0) {
    return ctx.mode === 'admin' ? <ElementPlaceholder label="Lista: dodaj pozycje" /> : null
  }

  return (
    <AccordionView
      allowMultiple={data.allowMultiple === true}
      borderColor={color(data.borderColor, 'surface.border')}
      items={items}
      openFirst={data.openFirst === true}
      radius={radiusValue(data.radius, 'md')}
      titleColor={color(data.titleColor, 'text.heading')}
    />
  )
}
