import type { Access, FieldAccess } from 'payload'

export type UserRole = 'administrator' | 'moderator' | 'redaktor' | 'klient'

type UserLike = {
  id: number | string
  role?: UserRole | string | null
} | null | undefined

export function getUserRole(user: UserLike): UserRole | null {
  if (!user?.role) return null
  return user.role as UserRole
}

export function isAdministrator(user: UserLike): boolean {
  return getUserRole(user) === 'administrator'
}

export function isModerator(user: UserLike): boolean {
  return getUserRole(user) === 'moderator'
}

export function isRedaktor(user: UserLike): boolean {
  return getUserRole(user) === 'redaktor'
}

/** Staff who may open the Payload admin panel */
export function isStaff(user: UserLike): boolean {
  const role = getUserRole(user)
  return role === 'administrator' || role === 'moderator' || role === 'redaktor'
}

export const anyone: Access = () => true

export const authenticated: Access = ({ req: { user } }) => Boolean(user)

export const administrators: Access = ({ req: { user } }) => isAdministrator(user)

export const staff: Access = ({ req: { user } }) => isStaff(user)

export const administratorsAndModerators: Access = ({ req: { user } }) => {
  const role = getUserRole(user)
  return role === 'administrator' || role === 'moderator'
}

/** Admin panel gate — clients never enter /admin */
export const canAccessAdmin: Access = ({ req: { user } }) => isStaff(user)

export const administratorsField: FieldAccess = ({ req: { user } }) => isAdministrator(user)
