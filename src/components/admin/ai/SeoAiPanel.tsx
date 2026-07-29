'use client'

import type { UIFieldClientComponent } from 'payload'

import { AiProposalCard, AiSuggestButton } from '@/components/admin/ai/AiSuggestButton'
import { callAdminAi, isAiClientError } from '@/lib/ai/client'
import { useForm } from '@payloadcms/ui'
import React, { useState } from 'react'

type SeoSuggestion = {
  metaTitle: string | null
  metaDescription: string
  excerpt: string
}

function plainFromUnknown(value: unknown): string {
  if (!value) return ''
  if (typeof value === 'string') return value
  const paragraphs: string[] = []
  const walk = (n: unknown) => {
    if (!n || typeof n !== 'object') return
    if (Array.isArray(n)) {
      n.forEach(walk)
      return
    }
    const r = n as Record<string, unknown>
    if (r.type === 'paragraph' || r.type === 'heading') {
      const text = collect(r).trim()
      if (text) paragraphs.push(text)
      return
    }
    if (r.children) walk(r.children)
    if (r.root) walk(r.root)
  }
  const collect = (n: unknown): string => {
    if (!n || typeof n !== 'object') return ''
    if (Array.isArray(n)) return n.map(collect).join('')
    const r = n as Record<string, unknown>
    if (typeof r.text === 'string') return r.text
    if (r.children) return collect(r.children)
    return ''
  }
  walk(value)
  return paragraphs.join('\n\n')
}

/**
 * Posts / pages: propose meta title, meta description, and excerpt. Insert is explicit.
 */
export const SeoAiPanel: UIFieldClientComponent = () => {
  const { dispatchFields, setModified, getDataByPath } = useForm()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [proposal, setProposal] = useState<SeoSuggestion | null>(null)

  async function suggest() {
    const title = String(getDataByPath?.('title') ?? '')
    const excerpt = (getDataByPath?.('excerpt') as string | undefined) || null
    const content = getDataByPath?.('content')
    const kind = getDataByPath?.('layout') != null ? 'page' : 'post'

    setBusy(true)
    setError(null)
    setProposal(null)
    const result = await callAdminAi<SeoSuggestion>({
      task: 'seo-copy',
      title,
      excerpt,
      contentText: plainFromUnknown(content),
      kind,
    })
    setBusy(false)
    if (isAiClientError(result)) {
      setError(result.error)
      return
    }
    setProposal(result.data)
  }

  function insert() {
    if (!proposal) return
    if (proposal.metaTitle) {
      dispatchFields({ type: 'UPDATE', path: 'meta.title', value: proposal.metaTitle })
    }
    dispatchFields({
      type: 'UPDATE',
      path: 'meta.description',
      value: proposal.metaDescription,
    })
    // Pages may not have excerpt — only set when the field exists in form state.
    try {
      dispatchFields({ type: 'UPDATE', path: 'excerpt', value: proposal.excerpt })
    } catch {
      // ignore
    }
    setModified(true)
    setProposal(null)
  }

  return (
    <div className="bw-ai__panel">
      <div className="bw-ai__row">
        <span className="bw-ai__label">Asystent SEO / zajawka</span>
        <AiSuggestButton busy={busy} onClick={() => void suggest()} />
      </div>
      {error && !proposal ? (
        <p className="bw-ai__error" role="alert">
          {error}
        </p>
      ) : null}
      {proposal || error ? (
        <AiProposalCard
          title="Propozycja SEO"
          error={proposal ? null : error}
          onDiscard={() => {
            setProposal(null)
            setError(null)
          }}
          onInsert={insert}
        >
          {proposal ? (
            <>
              {proposal.metaTitle ? (
                <p>
                  <strong>Tytuł SEO:</strong> {proposal.metaTitle}
                </p>
              ) : null}
              <p>
                <strong>Opis SEO:</strong> {proposal.metaDescription}
              </p>
              <p>
                <strong>Zajawka:</strong> {proposal.excerpt}
              </p>
            </>
          ) : null}
        </AiProposalCard>
      ) : null}
    </div>
  )
}
