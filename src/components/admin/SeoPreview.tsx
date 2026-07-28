'use client'

import type { UIFieldClientComponent } from 'payload'

import { useDocumentInfo, useFormFields } from '@payloadcms/ui'
import React from 'react'

/**
 * What the SEO fields will actually produce, shown live above them.
 *
 * The three fields in "Metadane" are **overrides**, so leaving them blank is the normal, correct
 * state: the title falls back to the document's own title and the description to its excerpt.
 * Explaining that in the field descriptions was not enough, and fairly so. An empty box still
 * reads as an oversight, and the client asked twice why nothing was filled in.
 *
 * Writing the values into the fields instead would be worse: the excerpt and the search
 * description would drift apart, and an editor would have two places to keep in step. So this
 * shows the result rather than duplicating the data. Type in a field and the preview follows;
 * clear it and the inherited text comes back.
 *
 * Read-only, and it never writes to the form. That matters here: there is no admin account on
 * this install yet, so this has not been seen rendered, and a component that only reads cannot
 * break saving, validation or versioning if a detail of the markup is wrong.
 */

/** Roughly where Google truncates, in characters. Not a hard limit, it measures pixels. */
const TITLE_LIMIT = 60
const DESCRIPTION_LIMIT = 155

function asText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

export const SeoPreview: UIFieldClientComponent = () => {
  const { collectionSlug } = useDocumentInfo()

  const fields = useFormFields(([state]) => ({
    docTitle: asText(state?.title?.value),
    excerpt: asText(state?.excerpt?.value),
    slug: asText(state?.slug?.value),
    metaTitle: asText(state?.['meta.title']?.value),
    metaDescription: asText(state?.['meta.description']?.value),
    noIndex: Boolean(state?.['meta.noIndex']?.value),
  }))

  const title = fields.metaTitle || fields.docTitle
  const description = fields.metaDescription || fields.excerpt

  // Posts live under /blog, pages at the root. Anything else is not worth guessing at.
  const prefix = collectionSlug === 'posts' ? '/blog/' : '/'
  const path = fields.slug ? prefix + fields.slug : prefix

  const titleSource = fields.metaTitle ? 'z pola „Tytuł SEO”' : 'z tytułu dokumentu'
  const descriptionSource = fields.metaDescription ? 'z pola „Opis SEO”' : 'z zajawki wpisu'

  const over = (text: string, limit: number) => text.length > limit

  return (
    <div
      style={{
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: 4,
        padding: '1rem 1.25rem',
        marginBottom: '1.5rem',
        background: 'var(--theme-elevation-50)',
      }}
    >
      <strong style={{ display: 'block', marginBottom: '.75rem' }}>Podgląd w wyszukiwarce</strong>

      {title || description ? (
        <div style={{ maxWidth: '38rem' }}>
          <div style={{ fontSize: '.8125rem', color: 'var(--theme-success-500)' }}>
            body-work.pl{path}
          </div>

          <div
            style={{
              fontSize: '1.125rem',
              lineHeight: 1.3,
              margin: '.25rem 0',
              color: 'var(--theme-text)',
            }}
          >
            {title || <em style={{ opacity: 0.6 }}>bez tytułu</em>}
          </div>

          <div style={{ fontSize: '.875rem', lineHeight: 1.5, opacity: 0.85 }}>
            {description || (
              <em style={{ opacity: 0.6 }}>
                Brak opisu. Uzupełnij zajawkę wpisu albo pole „Opis SEO”.
              </em>
            )}
          </div>
        </div>
      ) : (
        <span style={{ opacity: 0.75 }}>
          Wpisz tytuł dokumentu, a podgląd pojawi się tutaj.
        </span>
      )}

      <ul
        style={{
          listStyle: 'none',
          margin: '.9rem 0 0',
          padding: 0,
          fontSize: '.8125rem',
          opacity: 0.8,
          display: 'grid',
          gap: '.2rem',
        }}
      >
        <li>
          Tytuł: {titleSource}, {title.length} znaków
          {over(title, TITLE_LIMIT) ? ` (Google skróci powyżej ~${TITLE_LIMIT})` : ''}
        </li>
        <li>
          Opis: {descriptionSource}, {description.length} znaków
          {over(description, DESCRIPTION_LIMIT)
            ? ` (Google skróci powyżej ~${DESCRIPTION_LIMIT})`
            : ''}
        </li>
        {fields.noIndex ? (
          <li style={{ color: 'var(--theme-warning-500)' }}>
            Ten dokument jest ukryty przed wyszukiwarkami, więc powyższe się nie pokaże.
          </li>
        ) : null}
      </ul>
    </div>
  )
}
