'use client'

import type { UIFieldClientComponent } from 'payload'

import { AiProposalCard, AiSuggestButton } from '@/components/admin/ai/AiSuggestButton'
import { callAdminAi, isAiClientError } from '@/lib/ai/client'
import { useConfig, useDocumentInfo, useForm } from '@payloadcms/ui'
import React, { useEffect, useState } from 'react'

type Translation = {
  id: number
  status?: 'draft' | 'published'
  title?: string
  content?: unknown
}

type State =
  | { kind: 'loading' }
  | { kind: 'none' }
  | { kind: 'found'; translation: Translation }
  | { kind: 'error' }

type TranslateSuggestion = {
  title: string
  excerpt: string | null
  paragraphs: string[]
}

function plainFromContent(value: unknown): string {
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
 * English version status + optional AI draft translation (creates/updates via REST after confirm).
 */
export const EnglishVersionPanel: UIFieldClientComponent = () => {
  const { id } = useDocumentInfo()
  const { getDataByPath } = useForm()
  const { config } = useConfig()
  const adminRoute = config.routes?.admin || '/admin'
  const apiRoute = config.routes?.api || '/api'

  const [state, setState] = useState<State>({ kind: 'loading' })
  const [busy, setBusy] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [proposal, setProposal] = useState<TranslateSuggestion | null>(null)

  useEffect(() => {
    if (!id) return

    let cancelled = false

    const load = async () => {
      await Promise.resolve()
      if (cancelled) return

      try {
        const params = new URLSearchParams({
          'where[post][equals]': String(id),
          limit: '1',
          depth: '0',
        })
        const res = await fetch(`${apiRoute}/post-translations?${params.toString()}`, {
          credentials: 'include',
        })
        if (!res.ok) throw new Error(String(res.status))

        const json = (await res.json()) as { docs?: Translation[] }
        if (cancelled) return

        const found = json.docs?.[0]
        setState(found ? { kind: 'found', translation: found } : { kind: 'none' })
      } catch {
        if (!cancelled) setState({ kind: 'error' })
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [apiRoute, id])

  if (!id) return null

  const createHref = `${adminRoute}/c/post-translations/create?post=${id}`

  async function suggestTranslate() {
    setBusy(true)
    setError(null)
    setProposal(null)
    const title = String(getDataByPath?.('title') ?? '')
    const excerpt = (getDataByPath?.('excerpt') as string | undefined) || null
    const contentText = plainFromContent(getDataByPath?.('content'))
    const result = await callAdminAi<TranslateSuggestion>({
      task: 'translate-post',
      title,
      excerpt,
      contentText,
    })
    setBusy(false)
    if (isAiClientError(result)) {
      setError(result.error)
      return
    }
    setProposal(result.data)
  }

  async function applyTranslation() {
    if (!proposal || !id) return
    setSaving(true)
    setError(null)
    const payload = {
      post: Number(id),
      title: proposal.title,
      excerpt: proposal.excerpt,
      content: paragraphsToLexical(proposal.paragraphs),
      status: 'draft',
    }

    try {
      if (state.kind === 'found') {
        const res = await fetch(`${apiRoute}/post-translations/${state.translation.id}`, {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = (await res.json()) as { doc?: Translation } & Translation
        const doc = json.doc || json
        setState({ kind: 'found', translation: doc as Translation })
      } else {
        const res = await fetch(`${apiRoute}/post-translations`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = (await res.json()) as { doc?: Translation } & Translation
        const doc = (json.doc || json) as Translation
        setState({ kind: 'found', translation: doc })
      }
      setProposal(null)
    } catch {
      setError('Nie udało się zapisać szkicu tłumaczenia.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bw-ai__english">
      <div
        style={{
          border: '1px solid var(--theme-elevation-150)',
          borderRadius: 4,
          padding: '1rem 1.25rem',
          marginBottom: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: '1 1 18rem' }}>
          <strong style={{ display: 'block', marginBottom: '.25rem' }}>Wersja angielska</strong>

          {state.kind === 'loading' ? <span>Sprawdzam...</span> : null}

          {state.kind === 'error' ? (
            <span>Nie udało się sprawdzić. Zajrzyj do „Tłumaczenia wpisów”.</span>
          ) : null}

          {state.kind === 'none' ? (
            <span>
              Brak. Ten wpis nie pojawia się na angielskiej wersji strony, dopóki tłumaczenie nie
              będzie gotowe.
            </span>
          ) : null}

          {state.kind === 'found' ? (
            <span>
              {state.translation.status === 'published' && state.translation.content
                ? 'Gotowa i opublikowana. Widoczna na /en.'
                : state.translation.status === 'published'
                  ? 'Oznaczona jako gotowa, ale brakuje treści, więc jeszcze nie jest publikowana.'
                  : 'Szkic. Nie jest jeszcze widoczna na /en.'}
            </span>
          ) : null}
        </div>

        {state.kind === 'found' ? (
          <a
            className="btn btn--style-primary"
            href={`${adminRoute}/c/post-translations/${state.translation.id}`}
          >
            Edytuj po angielsku
          </a>
        ) : null}

        {state.kind === 'none' ? (
          <a className="btn btn--style-primary" href={createHref}>
            Dodaj wersję angielską
          </a>
        ) : null}

        <AiSuggestButton
          label="Szkic EN (AI)"
          busy={busy || saving}
          onClick={() => void suggestTranslate()}
        />
      </div>

      {error && !proposal ? (
        <p className="bw-ai__error" role="alert">
          {error}
        </p>
      ) : null}

      {proposal || error ? (
        <AiProposalCard
          title="Propozycja tłumaczenia EN"
          error={proposal ? null : error}
          insertLabel={
            state.kind === 'found' ? 'Zapisz do istniejącego szkicu' : 'Utwórz szkic EN'
          }
          onDiscard={() => {
            setProposal(null)
            setError(null)
          }}
          onInsert={() => {
            void applyTranslation()
          }}
        >
          {proposal ? (
            <>
              <p>
                <strong>Title:</strong> {proposal.title}
              </p>
              {proposal.excerpt ? (
                <p>
                  <strong>Excerpt:</strong> {proposal.excerpt}
                </p>
              ) : null}
              <p>
                <strong>Paragraphs:</strong> {proposal.paragraphs.length}
              </p>
              <p className="bw-ai__hint">
                Po wstawieniu otwórz dokument EN i popraw — AI nie publikuje automatycznie.
              </p>
            </>
          ) : null}
        </AiProposalCard>
      ) : null}
    </div>
  )
}
