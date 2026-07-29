'use client'

import React from 'react'

type Props = {
  label?: string
  busy?: boolean
  disabled?: boolean
  onClick: () => void
  className?: string
}

/** Shared “Zaproponuj (AI)” control for admin assistive features. */
export function AiSuggestButton({
  label = 'Zaproponuj (AI)',
  busy,
  disabled,
  onClick,
  className,
}: Props) {
  return (
    <button
      type="button"
      className={className ? `bw-ai__btn ${className}` : 'bw-ai__btn'}
      disabled={disabled || busy}
      onClick={onClick}
    >
      {busy ? 'Generowanie…' : label}
    </button>
  )
}

type ProposalProps = {
  title: string
  children: React.ReactNode
  error?: string | null
  onInsert: () => void
  onDiscard: () => void
  insertLabel?: string
}

/** Preview card: Insert / Discard — never silent overwrite. */
export function AiProposalCard({
  title,
  children,
  error,
  onInsert,
  onDiscard,
  insertLabel = 'Wstaw',
}: ProposalProps) {
  return (
    <div className="bw-ai__proposal" role="region" aria-label={title}>
      <div className="bw-ai__proposal-head">
        <strong>{title}</strong>
      </div>
      {error ? (
        <p className="bw-ai__error" role="alert">
          {error}
        </p>
      ) : (
        <div className="bw-ai__proposal-body">{children}</div>
      )}
      <div className="bw-ai__proposal-actions">
        {!error ? (
          <button type="button" className="bw-ai__btn bw-ai__btn--primary" onClick={onInsert}>
            {insertLabel}
          </button>
        ) : null}
        <button type="button" className="bw-ai__btn" onClick={onDiscard}>
          Odrzuć
        </button>
      </div>
    </div>
  )
}
