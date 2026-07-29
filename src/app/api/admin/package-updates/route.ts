import config from '@payload-config'
import { isAdministrator } from '@/access/roles'
import { getPackageUpdatesReport } from '@/lib/package-updates'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'

async function requireAdministrator() {
  const payload = await getPayload({ config })
  const headers = await getHeaders()
  const { user } = await payload.auth({ headers })

  if (!user || !isAdministrator(user)) {
    return { user: null as null, error: Response.json({ error: 'Forbidden' }, { status: 403 }) }
  }

  return { user, error: null as null }
}

/**
 * GET: cached report (auto-refreshes from npm when the 24h cache is stale).
 * POST: force a fresh check against the npm registry.
 * Administrator only; uses the Payload session cookie.
 */
export async function GET() {
  const { error } = await requireAdministrator()
  if (error) return error

  try {
    const report = await getPackageUpdatesReport({ force: false })
    return Response.json({ report })
  } catch {
    return Response.json(
      { error: 'Nie udało się odczytać raportu aktualizacji.' },
      { status: 500 },
    )
  }
}

export async function POST() {
  const { error } = await requireAdministrator()
  if (error) return error

  try {
    const report = await getPackageUpdatesReport({ force: true })
    return Response.json({ report })
  } catch {
    return Response.json(
      { error: 'Nie udało się sprawdzić wersji pakietów w npm.' },
      { status: 500 },
    )
  }
}
