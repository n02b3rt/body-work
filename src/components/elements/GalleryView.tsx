'use client'

import NextImage from 'next/image'
import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

import { gridColumnsAttr } from './grid'
import type { ElementLabels } from './types'

export type GalleryTile = {
  alt: string
  blurDataURL?: string
  caption?: string
  height?: number
  url: string
  width?: number
}

type Props = {
  aspectRatio: string
  columns: number
  gap: string
  labels: ElementLabels
  /** Off in the builder: clicking a tile there selects the element instead. */
  lightbox: boolean
  radius: string
  showCaptions: boolean
  tiles: GalleryTile[]
}

/**
 * The gallery grid plus its lightbox.
 *
 * The overlay is **portalled to `document.body`**: `.bw-el-root` sets
 * `container-type`, which makes it a containing block for `position: fixed`
 * children, so an overlay rendered in place would be trapped inside the section
 * instead of covering the window.
 */
export function GalleryView({
  aspectRatio,
  columns,
  gap,
  labels,
  lightbox,
  radius,
  showCaptions,
  tiles,
}: Props) {
  const [openIndex, setOpenIndex] = useState<null | number>(null)
  const [mounted, setMounted] = useState(false)
  const open = openIndex !== null ? tiles[openIndex] : undefined

  const close = useCallback(() => setOpenIndex(null), [])
  const step = useCallback(
    (delta: number) =>
      setOpenIndex((current) =>
        current === null ? null : (current + delta + tiles.length) % tiles.length,
      ),
    [tiles.length],
  )

  // A separate effect from the key handler: `setState` in an effect *body* is a
  // build error here (React Compiler's `set-state-in-effect`), so the portal
  // target is settled once on mount and nothing else touches it.
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (openIndex === null) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
      if (event.key === 'ArrowRight') step(1)
      if (event.key === 'ArrowLeft') step(-1)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [close, openIndex, step])

  const sizes =
    columns >= 3
      ? '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw'
      : '(min-width: 640px) 50vw, 100vw'

  return (
    <>
      <div className="bw-el-grid" data-cols={gridColumnsAttr(columns)} style={{ gap }}>
        {tiles.map((tile, index) => {
          const picture = (
            <span className="bw-el-frame" style={{ aspectRatio, borderRadius: radius }}>
              <NextImage
                alt={tile.alt}
                fill
                sizes={sizes}
                src={tile.url}
                {...(tile.blurDataURL
                  ? { blurDataURL: tile.blurDataURL, placeholder: 'blur' as const }
                  : {})}
              />
            </span>
          )

          return (
            <figure className="bw-el-figure" key={`${tile.url}-${index}`}>
              {lightbox ? (
                <button
                  aria-label={`${labels.enlarge}${tile.alt ? `: ${tile.alt}` : ''}`}
                  className="bw-el-zoom"
                  onClick={() => setOpenIndex(index)}
                  type="button"
                >
                  {picture}
                </button>
              ) : (
                picture
              )}
              {showCaptions && tile.caption ? (
                <figcaption className="bw-el-caption">{tile.caption}</figcaption>
              ) : null}
            </figure>
          )
        })}
      </div>

      {mounted && open
        ? createPortal(
            <div
              aria-label={labels.lightbox}
              aria-modal="true"
              className="bw-el-lightbox"
              onClick={close}
              role="dialog"
            >
              <div
                className="bw-el-lightbox__stage"
                onClick={(event) => event.stopPropagation()}
              >
                <NextImage
                  alt={open.alt}
                  height={open.height ?? 900}
                  sizes="(min-width: 1024px) 1024px, 100vw"
                  src={open.url}
                  width={open.width ?? 1600}
                />
              </div>

              {open.caption ? (
                <p className="bw-el-lightbox__caption">{open.caption}</p>
              ) : null}

              <div className="bw-el-lightbox__controls">
                {tiles.length > 1 ? (
                  <>
                    <button
                      aria-label={labels.previous}
                      className="bw-el-lightbox__button"
                      onClick={(event) => {
                        event.stopPropagation()
                        step(-1)
                      }}
                      type="button"
                    >
                      ‹
                    </button>
                    <button
                      aria-label={labels.next}
                      className="bw-el-lightbox__button"
                      onClick={(event) => {
                        event.stopPropagation()
                        step(1)
                      }}
                      type="button"
                    >
                      ›
                    </button>
                  </>
                ) : null}
                <button
                  aria-label={labels.close}
                  className="bw-el-lightbox__button"
                  onClick={close}
                  type="button"
                >
                  ✕
                </button>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  )
}
