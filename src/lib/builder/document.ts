/**
 * Resolves the `/edytor/{type}/{slug}` and `/podglad/{type}/{slug}` URL shape
 * into a Payload collection and document.
 *
 * One place for this because both routes (the editor shell and the iframe it
 * points at) need the identical lookup, and because the URL segment
 * ("strony"/"wpisy"/"komponenty") is editor-facing Polish, not a collection
 * slug: keeping the mapping here means neither route hard-codes it twice.
 */

import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'

import { isStaff } from '@/access/roles'
import type { Page, Post, SiteComponent, User } from '@/payload-types'

export const BUILDER_TYPES = {
  strony: { collection: 'pages', label: 'Strona' },
  wpisy: { collection: 'posts', label: 'Wpis' },
  komponenty: { collection: 'site-components', label: 'Komponent' },
} as const

export type BuilderTypeSegment = keyof typeof BUILDER_TYPES
export type BuilderCollection = (typeof BUILDER_TYPES)[BuilderTypeSegment]['collection']

export function isBuilderTypeSegment(value: string): value is BuilderTypeSegment {
  return value in BUILDER_TYPES
}

type BuilderDocByCollection = {
  pages: Page
  posts: Post
  'site-components': SiteComponent
}

export type BuilderDocumentResult<T extends BuilderTypeSegment> = {
  collection: (typeof BUILDER_TYPES)[T]['collection']
  doc: BuilderDocByCollection[(typeof BUILDER_TYPES)[T]['collection']]
}

/** The signed-in user, or `null` if they may not open the builder (staff only, same gate as `/admin`). */
export async function requireBuilderUser(): Promise<User | null> {
  const payload = await getPayload({ config })
  const headers = await getHeaders()
  const { user } = await payload.auth({ headers })
  return user && isStaff(user) ? user : null
}

/** The document a `/edytor` or `/podglad` URL points at, or `null` if the type or slug does not resolve. */
export async function resolveBuilderDocument<T extends BuilderTypeSegment>(
  type: T,
  slug: string,
): Promise<BuilderDocumentResult<T> | null> {
  const entry = BUILDER_TYPES[type]
  if (!entry) return null

  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: entry.collection,
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
    draft: true,
    overrideAccess: true,
  })

  const doc = result.docs[0]
  if (!doc) return null

  return { collection: entry.collection, doc } as BuilderDocumentResult<T>
}
