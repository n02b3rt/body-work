'use client'

import { useState } from 'react'

import type { ElementProps } from '../BuilderRender'

type AccordionItem = { title?: string; html?: string }

export function Accordion({ node }: ElementProps) {
  const items = Array.isArray(node.props.items) ? (node.props.items as AccordionItem[]) : []
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  if (items.length === 0) return null

  return (
    <div className="flex flex-col divide-y divide-line rounded-md border border-line">
      {items.map((item, index) => {
        const open = openIndex === index
        return (
          <div key={index}>
            <button
              aria-expanded={open}
              className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left text-body font-medium text-text-heading"
              onClick={() => setOpenIndex(open ? null : index)}
              type="button"
            >
              {item.title}
              <span aria-hidden="true">{open ? '−' : '+'}</span>
            </button>
            {open ? (
              <div
                className="px-4 pb-4 text-body text-muted"
                dangerouslySetInnerHTML={{ __html: typeof item.html === 'string' ? item.html : '' }}
              />
            ) : null}
          </div>
        )
      })}
    </div>
  )
}
