import { requireAdministratorUser, requireStaffUser } from '@/lib/ai/auth'
import { isGeminiConfigured } from '@/lib/ai/gemini'
import {
  draftPostFromBrief,
  helpChat,
  readPackageBlurbs,
  suggestLibraryBlurb,
  suggestLibraryBlurbsBatch,
  suggestMediaAlt,
  suggestPageLayout,
  suggestSeoCopy,
  translatePostDraft,
} from '@/lib/ai/tasks'

type TaskBody = {
  task?: string
  [key: string]: unknown
}

function failResult(result: {
  ok: false
  error: string
  unavailable?: boolean
  status?: number
}) {
  const status = result.unavailable ? 503 : result.status === 429 ? 429 : 502
  return Response.json(
    { error: result.error, unavailable: Boolean(result.unavailable) },
    { status },
  )
}

/**
 * Unified admin AI endpoint. Body: `{ task, ...params }`.
 * Staff for editorial tasks; administrator for library blurbs.
 */
export async function POST(request: Request) {
  let body: TaskBody
  try {
    body = (await request.json()) as TaskBody
  } catch {
    return Response.json({ error: 'Nieprawidłowy JSON.' }, { status: 400 })
  }

  const task = typeof body.task === 'string' ? body.task : ''
  if (!task) {
    return Response.json({ error: 'Brak pola task.' }, { status: 400 })
  }

  if (!isGeminiConfigured() && task !== 'status') {
    return Response.json(
      {
        error:
          'AI niedostępne: brak GEMINI_API_KEY. Dodaj klucz z Google AI Studio do .env.',
        unavailable: true,
      },
      { status: 503 },
    )
  }

  if (task === 'status') {
    const auth = await requireStaffUser()
    if (auth.error) return auth.error
    return Response.json({ configured: isGeminiConfigured() })
  }

  const adminTasks = new Set(['library-blurb', 'library-blurbs', 'library-blurbs-get'])
  if (adminTasks.has(task)) {
    const auth = await requireAdministratorUser()
    if (auth.error) return auth.error
  } else {
    const auth = await requireStaffUser()
    if (auth.error) return auth.error
  }

  switch (task) {
    case 'media-alt': {
      const imageUrl = String(body.imageUrl ?? '')
      const filename = String(body.filename ?? 'image')
      const title = body.title != null ? String(body.title) : null
      const result = await suggestMediaAlt({ imageUrl, filename, title })
      if (!result.ok) return failResult(result)
      return Response.json({ data: result.data, model: result.model })
    }
    case 'seo-copy': {
      const result = await suggestSeoCopy({
        title: String(body.title ?? ''),
        excerpt: body.excerpt != null ? String(body.excerpt) : null,
        contentText: body.contentText != null ? String(body.contentText) : null,
        kind: body.kind === 'page' ? 'page' : 'post',
      })
      if (!result.ok) return failResult(result)
      return Response.json({ data: result.data, model: result.model })
    }
    case 'library-blurb': {
      const result = await suggestLibraryBlurb({
        name: String(body.name ?? ''),
        kind: body.kind === 'dev' ? 'dev' : 'runtime',
        npmDescription:
          body.npmDescription != null ? String(body.npmDescription) : null,
      })
      if (!result.ok) return failResult(result)
      return Response.json({ data: result.data, model: result.model })
    }
    case 'library-blurbs': {
      const packages = Array.isArray(body.packages)
        ? (body.packages as Array<{
            name?: string
            kind?: string
            npmDescription?: string | null
          }>)
            .filter((p) => p && typeof p.name === 'string')
            .map((p) => ({
              name: String(p.name),
              kind: (p.kind === 'dev' ? 'dev' : 'runtime') as 'runtime' | 'dev',
              npmDescription:
                p.npmDescription != null ? String(p.npmDescription) : null,
            }))
        : []
      const result = await suggestLibraryBlurbsBatch(packages, {
        onlyMissing: body.onlyMissing !== false,
        limit: typeof body.limit === 'number' ? body.limit : 12,
      })
      if (!result.ok) return failResult(result)
      return Response.json({ data: result.data, model: result.model })
    }
    case 'library-blurbs-get': {
      const blurbs = await readPackageBlurbs()
      return Response.json({ data: { blurbs } })
    }
    case 'translate-post': {
      const result = await translatePostDraft({
        title: String(body.title ?? ''),
        excerpt: body.excerpt != null ? String(body.excerpt) : null,
        contentText: String(body.contentText ?? ''),
      })
      if (!result.ok) return failResult(result)
      return Response.json({ data: result.data, model: result.model })
    }
    case 'draft-post': {
      const result = await draftPostFromBrief(String(body.brief ?? ''))
      if (!result.ok) return failResult(result)
      return Response.json({ data: result.data, model: result.model })
    }
    case 'suggest-layout': {
      const components = Array.isArray(body.components)
        ? (body.components as Array<{
            id?: string | number
            name?: string
            type?: string
          }>)
            .filter((c) => c && c.id != null)
            .map((c) => ({
              id: c.id as string | number,
              name: String(c.name ?? c.id),
              type: String(c.type ?? 'unknown'),
            }))
        : []
      const result = await suggestPageLayout({
        pageTitle: String(body.pageTitle ?? ''),
        brief: String(body.brief ?? ''),
        components,
      })
      if (!result.ok) return failResult(result)
      return Response.json({ data: result.data, model: result.model })
    }
    case 'help-chat': {
      const history = Array.isArray(body.history)
        ? (body.history as Array<{ role?: string; content?: string }>)
            .filter(
              (h) =>
                (h.role === 'user' || h.role === 'assistant') &&
                typeof h.content === 'string',
            )
            .map((h) => ({
              role: h.role as 'user' | 'assistant',
              content: String(h.content),
            }))
        : []
      const result = await helpChat({
        message: String(body.message ?? ''),
        history,
      })
      if (!result.ok) return failResult(result)
      return Response.json({ data: result.data, model: result.model })
    }
    default:
      return Response.json({ error: `Nieznane zadanie: ${task}` }, { status: 400 })
  }
}

export async function GET() {
  const auth = await requireStaffUser()
  if (auth.error) return auth.error
  return Response.json({ configured: isGeminiConfigured() })
}
