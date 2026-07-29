import type { Payload } from 'payload'

import { usernameAlternatives } from './username'

export type AvailabilityResult = {
  emailTaken: boolean
  usernameTaken: boolean
  suggestions: string[]
}

/**
 * Check whether email and/or username are already used on the users collection.
 * When username is taken, returns alternative suggestions (not yet claimed).
 */
export async function checkUserAvailability(
  payload: Payload,
  options: {
    email?: string | null
    username?: string | null
    /** Exclude this user id (edit own profile). */
    excludeId?: number | string | null
  },
): Promise<AvailabilityResult> {
  const email = options.email?.trim().toLowerCase() || ''
  const username = options.username?.trim().toLowerCase() || ''
  const excludeId = options.excludeId

  let emailTaken = false
  let usernameTaken = false

  if (email) {
    const where: Record<string, unknown> = { email: { equals: email } }
    if (excludeId != null && excludeId !== '') {
      where.id = { not_equals: excludeId }
    }
    const found = await payload.find({
      collection: 'users',
      where: where as never,
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    emailTaken = found.totalDocs > 0
  }

  if (username) {
    const where: Record<string, unknown> = { username: { equals: username } }
    if (excludeId != null && excludeId !== '') {
      where.id = { not_equals: excludeId }
    }
    const found = await payload.find({
      collection: 'users',
      where: where as never,
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    usernameTaken = found.totalDocs > 0
  }

  const suggestions: string[] = []
  if (username && usernameTaken) {
    const candidates = usernameAlternatives(username, email || null, [username])
    for (const candidate of candidates) {
      const found = await payload.find({
        collection: 'users',
        where: {
          username: { equals: candidate },
          ...(excludeId != null && excludeId !== ''
            ? { id: { not_equals: excludeId } }
            : {}),
        } as never,
        limit: 1,
        depth: 0,
        overrideAccess: true,
      })
      if (found.totalDocs === 0) suggestions.push(candidate)
      if (suggestions.length >= 5) break
    }
  }

  return { emailTaken, usernameTaken, suggestions }
}

/** True when the users collection has zero documents (first-user setup). */
export async function isUsersCollectionEmpty(payload: Payload): Promise<boolean> {
  const found = await payload.find({
    collection: 'users',
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  return found.totalDocs === 0
}
