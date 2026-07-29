/**
 * Client helper for `/api/admin/ai`. Keep Node/fs out of this file.
 */

export type AiClientError = {
  error: string
  unavailable?: boolean
  status: number
}

export async function callAdminAi<T>(
  body: Record<string, unknown>,
): Promise<{ data: T; model?: string } | AiClientError> {
  try {
    const res = await fetch('/api/admin/ai', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const json = (await res.json().catch(() => ({}))) as {
      data?: T
      model?: string
      error?: string
      unavailable?: boolean
    }
    if (!res.ok) {
      return {
        error: json.error || `Błąd AI (${res.status})`,
        unavailable: json.unavailable,
        status: res.status,
      }
    }
    return { data: json.data as T, model: json.model }
  } catch {
    return {
      error: 'Nie udało się połączyć z API AI.',
      status: 0,
    }
  }
}

export function isAiClientError(
  value: unknown,
): value is AiClientError {
  return Boolean(value && typeof value === 'object' && 'error' in value && !('data' in value))
}
