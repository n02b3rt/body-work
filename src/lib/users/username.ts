import { stripPolish } from './slugify-pl'

export type UsernameSource = {
  firstName?: string | null
  lastName?: string | null
  email?: string | null
}

/** Local part of an email, ASCII-only, for username fallbacks. */
export function emailLocalPart(email: string | null | undefined): string {
  if (!email) return ''
  const at = email.indexOf('@')
  const local = at >= 0 ? email.slice(0, at) : email
  return stripPolish(local)
}

/**
 * Default username from last name + first letter of first name
 * (e.g. Jan Kowalski → kowalskij). Falls back to first name, then email local-part.
 */
export function suggestUsername(source: UsernameSource): string {
  const last = stripPolish(source.lastName ?? '')
  const first = stripPolish(source.firstName ?? '')
  const firstInitial = first.charAt(0)

  if (last && firstInitial) return `${last}${firstInitial}`
  if (last) return last
  if (first) return first
  return emailLocalPart(source.email)
}

const MAX_ALTERNATIVES = 5

/**
 * Alternatives when `base` is taken: email local-part, then base2, base3, …
 * `taken` may include usernames already known to be occupied (including base).
 */
export function usernameAlternatives(
  base: string,
  email: string | null | undefined,
  taken: Iterable<string> = [],
): string[] {
  const takenSet = new Set(
    [...taken].map((u) => u.toLowerCase()).filter(Boolean),
  )
  const candidates: string[] = []
  const push = (value: string) => {
    const v = value.toLowerCase()
    if (!v || takenSet.has(v) || candidates.includes(v)) return
    candidates.push(v)
  }

  const local = emailLocalPart(email)
  if (local) push(local)

  const stem = stripPolish(base) || local || 'user'
  let n = 2
  while (candidates.length < MAX_ALTERNATIVES && n < 100) {
    push(`${stem}${n}`)
    n += 1
  }

  return candidates.slice(0, MAX_ALTERNATIVES)
}

/** Username format: lowercase letters and digits, min 2 chars. */
export function isValidUsernameFormat(value: string): boolean {
  return /^[a-z0-9]{2,}$/.test(value)
}
