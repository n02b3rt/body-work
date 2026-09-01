'use client'

/**
 * Persists the editor's tree through Payload's own REST API, same-origin
 * cookie session — not the Local API (server-only) and not the admin panel's
 * form state (`/edytor` is not a Payload document view, it has none).
 *
 * `pages`/`posts` carry `versions: { drafts: true }`: `?draft=true` writes a
 * new draft version and leaves the published row untouched, which is what
 * "Zapisz szkic" means. Publishing is a second, explicit write with
 * `_status: 'published'` — matching `docs/page-builder.md`'s own gotcha that
 * unpublishing is `_status: 'draft'` **without** `draft: true`, the same
 * asymmetry in reverse. `site-components` has no versions at all: it only
 * ever gets the plain, undrafted write.
 */

import type { BuilderCollection } from '@/lib/builder/document'
import type { BuilderDoc } from '@/lib/builder/types'

export type SaveMode = 'draft' | 'publish'

async function patchDoc(
  collection: BuilderCollection,
  id: number | string,
  body: Record<string, unknown>,
  draft: boolean,
): Promise<void> {
  const query = draft ? '?draft=true' : ''
  const response = await fetch(`/api/${collection}/${id}${query}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(`Zapis nie powiódł się (${response.status}): ${text.slice(0, 300)}`)
  }
}

export async function saveBuilderDoc(
  collection: BuilderCollection,
  id: number | string,
  doc: BuilderDoc,
  mode: SaveMode,
): Promise<void> {
  if (collection === 'site-components') {
    await patchDoc(collection, id, { builder: doc }, false)
    return
  }

  if (mode === 'draft') {
    await patchDoc(collection, id, { builder: doc }, true)
    return
  }

  await patchDoc(collection, id, { builder: doc, _status: 'published' }, false)
}
