'use client'

import type { UIFieldClientComponent } from 'payload'

import { AiProposalCard, AiSuggestButton } from '@/components/admin/ai/AiSuggestButton'
import { callAdminAi, isAiClientError } from '@/lib/ai/client'
import { useDocumentInfo, useForm } from '@payloadcms/ui'
import React, { useState } from 'react'

type DraftSuggestion = {
  title: string
  excerpt: string
  outline: string[]
  paragraphs: string[]
}

function paragraphsToLexical(paragraphs: string[]) {
  return {
    root: {
      type: 'root',
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      version: 1,
      children: paragraphs.map((text) => ({
        type: 'paragraph',
        direction: 'ltr' as const,
        format: '' as const,
        indent: 0,
        version: 1,
        children: [
          {
            type: 'text',
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text,
            version: 1,
          },
        ],
      })),
    },
  }
}

/**
 * Posts: draft title / excerpt / body from a short brief. Never auto-saves.
 */
export const PostDraftAiPanel: UIFieldClientComponent = () => {
  const { id } = useDocumentInfo()
  const { dispatchFields, setModified } = useForm()
  const [brief, setBrief] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [proposal, setProposal] = useState<DraftSuggestion | null>(null)

  async function suggest() {
    setBusy(true)
    setError(null)
    setProposal(null)
    const result = await callAdminAi<DraftSuggestion>({
      task: 'draft-post',
      brief,
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
    dispatchFields({ type: 'UPDATE', path: 'title', value: proposal.title })
    dispatchFields({ type: 'UPDATE', path: 'excerpt', value: proposal.excerpt })
    dispatchFields({
      type: 'UPDATE',
      path: 'content',
      value: paragraphsToLexical(proposal.paragraphs),
    })
    setModified(true)
    setProposal(null)
  }

  return (
    <div className="bw-ai__panel">
      <div className="bw-ai__row">
        <span className="bw-ai__label">Szkic wpisu (AI)</span>
        <AiSuggestButton
          busy={busy}
          disabled={!brief.trim()}
          onClick={() => void suggest()}
        />
      </div>
      <textarea
        className="bw-ai__textarea"
        rows={3}
        value={brief}
        onChange={(e) => setBrief(e.target.value)}
        placeholder="Krótki brief: temat, odbiorca, ton (np. rwa kulszowa — objawy i kiedy do fizjo)."
      />
      {id ? (
        <p className="bw-ai__hint">
          Wstawienie nadpisze tytuł, zajawkę i treść w formularzu — dopiero zapis utrwali zmiany.
        </p>
      ) : (
        <p className="bw-ai__hint">Możesz wygenerować szkic przed pierwszym zapisem.</p>
      )}
      {error && !proposal ? (
        <p className="bw-ai__error" role="alert">
          {error}
        </p>
      ) : null}
      {proposal || error ? (
        <AiProposalCard
          title="Propozycja szkicu"
          error={proposal ? null : error}
          onDiscard={() => {
            setProposal(null)
            setError(null)
          }}
          onInsert={insert}
          insertLabel="Wstaw do formularza"
        >
          {proposal ? (
            <>
              <p>
                <strong>Tytuł:</strong> {proposal.title}
              </p>
              <p>
                <strong>Zajawka:</strong> {proposal.excerpt}
              </p>
              <p>
                <strong>Outline:</strong>
              </p>
              <ul>
                {proposal.outline.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p>
                <strong>Akapity:</strong> {proposal.paragraphs.length}
              </p>
            </>
          ) : null}
        </AiProposalCard>
      ) : null}
    </div>
  )
}
