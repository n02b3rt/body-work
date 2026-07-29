'use client'

import { RichText } from '@payloadcms/richtext-lexical/react'
import { useState } from 'react'

export type AccordionItem = {
  content?: unknown
  title: string
}

type Props = {
  allowMultiple: boolean
  borderColor?: string
  items: AccordionItem[]
  openFirst: boolean
  radius: string
  titleColor?: string
}

/** FAQ-style disclosure list. Interactive in the builder too: harmless, and it
 *  is the only way to check the copy in the closed state actually fits. */
export function AccordionView({
  allowMultiple,
  borderColor,
  items,
  openFirst,
  radius,
  titleColor,
}: Props) {
  const [open, setOpen] = useState<number[]>(openFirst ? [0] : [])

  const toggle = (index: number) => {
    setOpen((current) => {
      if (current.includes(index)) return current.filter((entry) => entry !== index)
      return allowMultiple ? [...current, index] : [index]
    })
  }

  return (
    <div
      className="bw-el-accordion"
      style={{ border: `1px solid ${borderColor ?? 'currentColor'}`, borderRadius: radius }}
    >
      {items.map((item, index) => {
        const expanded = open.includes(index)
        return (
          <div
            className="bw-el-accordion__item"
            key={index}
            style={
              index > 0 ? { borderTop: `1px solid ${borderColor ?? 'currentColor'}` } : undefined
            }
          >
            <button
              aria-expanded={expanded}
              className="bw-el-accordion__trigger"
              onClick={() => toggle(index)}
              style={{ color: titleColor }}
              type="button"
            >
              <span>{item.title}</span>
              <svg
                aria-hidden="true"
                className="bw-el-accordion__chevron"
                fill="none"
                height={18}
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                viewBox="0 0 24 24"
                width={18}
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            {expanded && item.content ? (
              <div className="bw-el-accordion__panel bw-el-text">
                <RichText data={item.content as Parameters<typeof RichText>[0]['data']} />
              </div>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}
