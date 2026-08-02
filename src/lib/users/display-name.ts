export type DisplayNameSource = {
  firstName?: string | null
  lastName?: string | null
  username?: string | null
  email?: string | null
}

/** Prefer "Imię Nazwisko", else username, else email. */
export function getDisplayName(user: DisplayNameSource | null | undefined): string {
  if (!user) return ''
  const full = [user.firstName, user.lastName]
    .map((part) => (typeof part === 'string' ? part.trim() : ''))
    .filter(Boolean)
    .join(' ')
  if (full) return full
  if (user.username?.trim()) return user.username.trim()
  if (user.email?.trim()) return user.email.trim()
  return ''
}
