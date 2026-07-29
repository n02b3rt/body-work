import config from '@payload-config'
import { isAdministrator, isStaff } from '@/access/roles'
import {
  checkUserAvailability,
  isUsersCollectionEmpty,
} from '@/lib/users'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'

/**
 * GET ?email=&username=&excludeId=
 * Live uniqueness check for first-user, admin create, and own-profile edit.
 * Allowed when: users collection is empty, caller is administrator, or
 * caller is staff checking only their own `excludeId`.
 */
export async function GET(request: Request) {
  const payload = await getPayload({ config })
  const headers = await getHeaders()
  const { user } = await payload.auth({ headers })
  const empty = await isUsersCollectionEmpty(payload)

  const url = new URL(request.url)
  const email = url.searchParams.get('email')
  const username = url.searchParams.get('username')
  const excludeId = url.searchParams.get('excludeId')

  const isAdmin = Boolean(user && isAdministrator(user))
  const isSelfCheck =
    Boolean(user && isStaff(user) && excludeId != null && String(user.id) === String(excludeId))

  if (!empty && !isAdmin && !isSelfCheck) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (!email && !username) {
    return Response.json(
      { error: 'Podaj email lub username.' },
      { status: 400 },
    )
  }

  try {
    const result = await checkUserAvailability(payload, {
      email,
      username,
      excludeId,
    })
    return Response.json(result)
  } catch {
    return Response.json(
      { error: 'Nie udało się sprawdzić dostępności.' },
      { status: 500 },
    )
  }
}
