'use client'

import { callAdminAi, isAiClientError } from '@/lib/ai/client'
import React, { useState } from 'react'

type ChatMessage = { role: 'user' | 'assistant'; content: string }

/**
 * Floating help chat for the Payload admin. Advice only — never mutates CMS data.
 * Mounted via `admin.components.providers`.
 */
export function AiHelpProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])

  async function send() {
    const text = input.trim()
    if (!text || busy) return
    const nextHistory = [...messages, { role: 'user' as const, content: text }]
    setMessages(nextHistory)
    setInput('')
    setBusy(true)
    setError(null)
    const result = await callAdminAi<{ reply: string }>({
      task: 'help-chat',
      message: text,
      history: messages,
    })
    setBusy(false)
    if (isAiClientError(result)) {
      setError(result.error)
      return
    }
    setMessages([...nextHistory, { role: 'assistant', content: result.data.reply }])
  }

  return (
    <>
      {children}
      <div className="bw-ai-help">
        {open ? (
          <div className="bw-ai-help__panel" role="dialog" aria-label="Asystent panelu">
            <div className="bw-ai-help__head">
              <strong>Asystent panelu</strong>
              <button
                type="button"
                className="bw-ai-help__icon-btn"
                onClick={() => setOpen(false)}
                aria-label="Zamknij"
              >
                ×
              </button>
            </div>
            <p className="bw-ai-help__lead">
              Pytaj o nawigację, media, tłumaczenia, SEO, kreator. Nie wykonuje zmian za Ciebie.
            </p>
            <div className="bw-ai-help__messages">
              {messages.length === 0 ? (
                <p className="bw-ai-help__empty">Np. „Jak dodać wersję angielską wpisu?”</p>
              ) : null}
              {messages.map((m, i) => (
                <div
                  key={`${m.role}-${i}`}
                  className={
                    m.role === 'user'
                      ? 'bw-ai-help__msg bw-ai-help__msg--user'
                      : 'bw-ai-help__msg bw-ai-help__msg--assistant'
                  }
                >
                  {m.content}
                </div>
              ))}
            </div>
            {error ? (
              <p className="bw-ai__error" role="alert">
                {error}
              </p>
            ) : null}
            <form
              className="bw-ai-help__form"
              onSubmit={(e) => {
                e.preventDefault()
                void send()
              }}
            >
              <input
                className="bw-ai-help__input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Twoje pytanie…"
                disabled={busy}
              />
              <button type="submit" className="bw-ai__btn bw-ai__btn--primary" disabled={busy}>
                {busy ? '…' : 'Wyślij'}
              </button>
            </form>
          </div>
        ) : null}
        <button
          type="button"
          className="bw-ai-help__fab"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Asystent AI"
        >
          AI
        </button>
      </div>
    </>
  )
}
