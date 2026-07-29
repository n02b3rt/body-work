import config from '@payload-config'
import { isAdministrator, isStaff } from '@/access/roles'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import type { User } from '@/payload-types'

export async function requireStaffUser(): Promise<
  | { user: User; error: null }
  | { user: null; error: Response }
> {
  const payload = await getPayload({ config })
  const headers = await getHeaders()
  const { user } = await payload.auth({ headers })

  if (!user || !isStaff(user)) {
    return {
      user: null,
      error: Response.json({ error: 'Forbidden' }, { status: 403 }),
    }
  }
  return { user: user as User, error: null }
}

export async function requireAdministratorUser(): Promise<
  | { user: User; error: null }
  | { user: null; error: Response }
> {
  const staff = await requireStaffUser()
  if (staff.error) return staff
  if (!isAdministrator(staff.user)) {
    return {
      user: null,
      error: Response.json({ error: 'Forbidden' }, { status: 403 }),
    }
  }
  return { user: staff.user, error: null }
}
