'use client'

import type { UIFieldClientComponent } from 'payload'

import { AiProposalCard, AiSuggestButton } from '@/components/admin/ai/AiSuggestButton'
import { callAdminAi, isAiClientError } from '@/lib/ai/client'
import { useDocumentInfo, useForm } from '@payloadcms/ui'
import React, { useState } from 'react'

type AltSuggestion = { alt: string; caption: string | null }

/**
 * Media edit view: propose ALT (and optional caption) from the uploaded image via Gemini vision.
 */
export const MediaAiPanel: UIFieldClientComponent = () => {
  const { id, initialData } = useDocumentInfo()
  const { dispatchFields, setModified, getDataByPath } = useForm()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [proposal, setProposal] = useState<AltSuggestion | null>(null)

  const url =
    (getDataByPath?.('url') as string | undefined) ||
    (initialData?.url as string | undefined) ||
    ''
  const filename =
    (getDataByPath?.('filename') as string | undefined) ||
    (initialData?.filename as string | undefined) ||
    'image'
  const title =
    (getDataByPath?.('title') as string | undefined) ||
    (initialData?.title as string | undefined) ||
    null

  async function suggest() {
    if (!url) {
      setError('Brak URL obrazu — zapisz plik albo wybierz obraz.')
      return
    }
    setBusy(true)
    setError(null)
    setProposal(null)
    const result = await callAdminAi<AltSuggestion>({
      task: 'media-alt',
      imageUrl: url,
      filename,
      title,
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
    dispatchFields({ type: 'UPDATE', path: 'alt', value: proposal.alt })
    if (proposal.caption) {
      dispatchFields({ type: 'UPDATE', path: 'caption', value: proposal.caption })
    }
    setModified(true)
    setProposal(null)
  }

  if (!id && !url) {
    return null
  }

  return (
    <div className="bw-ai__panel">
      <div className="bw-ai__row">
        <span className="bw-ai__label">Asystent ALT</span>
        <AiSuggestButton busy={busy} onClick={() => void suggest()} />
      </div>
      {error && !proposal ? (
        <p className="bw-ai__error" role="alert">
          {error}
        </p>
      ) : null}
      {proposal || error ? (
        <AiProposalCard
          title="Propozycja ALT"
          error={proposal ? null : error}
          onDiscard={() => {
            setProposal(null)
            setError(null)
          }}
          onInsert={insert}
        >
          {proposal ? (
            <>
              <p>
                <strong>ALT:</strong> {proposal.alt}
              </p>
              {proposal.caption ? (
                <p>
                  <strong>Podpis:</strong> {proposal.caption}
                </p>
              ) : null}
            </>
          ) : null}
        </AiProposalCard>
      ) : null}
    </div>
  )
}
