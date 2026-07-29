/**
 * Thin Gemini client: plain fetch, no SDK (same pattern as Resend in `email.ts`).
 *
 * Without `GEMINI_API_KEY` callers get a typed "unavailable" result so the admin UI can
 * show "AI niedostępne" instead of a 500.
 */

export const GEMINI_PRIMARY_MODEL = 'gemini-3.5-flash'
export const GEMINI_FALLBACK_MODEL = 'gemma-4-26b-a4b-it'

const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'

export type GeminiPart =
  | { text: string }
  | { inlineData: { mimeType: string; data: string } }

export type GeminiGenerateOptions = {
  system?: string
  parts: GeminiPart[]
  /** Prefer JSON object responses. */
  json?: boolean
  temperature?: number
  model?: string
}

export type GeminiResult =
  | { ok: true; text: string; model: string }
  | { ok: false; error: string; status?: number; unavailable?: boolean }

type GeminiApiResponse = {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> }
    finishReason?: string
  }>
  error?: { message?: string; code?: number; status?: string }
}

function apiKey(): string | null {
  const key = process.env.GEMINI_API_KEY?.trim()
  return key || null
}

export function isGeminiConfigured(): boolean {
  return Boolean(apiKey())
}

function extractText(data: GeminiApiResponse): string | null {
  const parts = data.candidates?.[0]?.content?.parts
  if (!parts?.length) return null
  const text = parts
    .map((p) => (typeof p.text === 'string' ? p.text : ''))
    .join('')
    .trim()
  return text || null
}

function toApiParts(parts: GeminiPart[]) {
  return parts.map((part) => {
    if ('text' in part) return { text: part.text }
    return {
      inline_data: {
        mime_type: part.inlineData.mimeType,
        data: part.inlineData.data,
      },
    }
  })
}

async function callModel(
  model: string,
  options: GeminiGenerateOptions,
  key: string,
): Promise<GeminiResult> {
  const url = `${API_BASE}/${encodeURIComponent(model)}:generateContent`
  const body: Record<string, unknown> = {
    contents: [{ role: 'user', parts: toApiParts(options.parts) }],
    generationConfig: {
      temperature: options.temperature ?? 0.4,
      ...(options.json
        ? { responseMimeType: 'application/json' }
        : {}),
    },
  }
  if (options.system) {
    body.systemInstruction = { parts: [{ text: options.system }] }
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 45_000)
  try {
    const res = await fetch(url, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': key,
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    })

    const data = (await res.json().catch(() => ({}))) as GeminiApiResponse

    if (!res.ok) {
      const message =
        data.error?.message ||
        (res.status === 429
          ? 'Limit zapytań Gemini wyczerpany. Spróbuj za chwilę.'
          : `Gemini HTTP ${res.status}`)
      return { ok: false, error: message, status: res.status }
    }

    const text = extractText(data)
    if (!text) {
      return {
        ok: false,
        error: 'Pusta odpowiedź modelu.',
        status: res.status,
      }
    }
    return { ok: true, text, model }
  } catch (err) {
    const message =
      err instanceof Error && err.name === 'AbortError'
        ? 'Timeout połączenia z Gemini.'
        : err instanceof Error
          ? err.message
          : 'Nie udało się połączyć z Gemini.'
    return { ok: false, error: message }
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Generate text (or JSON string) from Gemini. On 429, retries once with Gemma 4.
 */
export async function generateGemini(
  options: GeminiGenerateOptions,
): Promise<GeminiResult> {
  const key = apiKey()
  if (!key) {
    return {
      ok: false,
      unavailable: true,
      error:
        'AI niedostępne: brak GEMINI_API_KEY. Dodaj klucz z Google AI Studio do .env.',
    }
  }

  const primary = options.model || GEMINI_PRIMARY_MODEL
  const first = await callModel(primary, options, key)
  if (first.ok) return first
  if (first.status === 429 && primary !== GEMINI_FALLBACK_MODEL) {
    const fallback = await callModel(GEMINI_FALLBACK_MODEL, options, key)
    if (fallback.ok) return fallback
    return fallback
  }
  return first
}

/** Parse a JSON object from a model response; strips optional markdown fences. */
export function parseGeminiJson<T>(raw: string): T | null {
  const trimmed = raw.trim()
  const unfenced = trimmed
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()
  try {
    return JSON.parse(unfenced) as T
  } catch {
    const start = unfenced.indexOf('{')
    const end = unfenced.lastIndexOf('}')
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(unfenced.slice(start, end + 1)) as T
      } catch {
        return null
      }
    }
    return null
  }
}
