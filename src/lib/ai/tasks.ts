/**
 * Task runners for admin AI features. Each returns a plain result object for the API route.
 */

import {
  generateGemini,
  parseGeminiJson,
  type GeminiResult,
} from '@/lib/ai/gemini'
import {
  SYSTEM_EDITOR,
  SYSTEM_HELPER,
  SYSTEM_TRANSLATOR,
  draftPostUserPrompt,
  helpChatUserPrompt,
  mediaAltUserPrompt,
  seoCopyUserPrompt,
  suggestLayoutUserPrompt,
  translatePostUserPrompt,
} from '@/lib/ai/prompts'

export type AiTaskResult<T> =
  | { ok: true; data: T; model: string }
  | { ok: false; error: string; unavailable?: boolean; status?: number }

function mapFail(result: Extract<GeminiResult, { ok: false }>): AiTaskResult<never> {
  return {
    ok: false,
    error: result.error,
    unavailable: result.unavailable,
    status: result.status,
  }
}

async function fetchImageAsInline(
  imageUrl: string,
): Promise<{ mimeType: string; data: string } | null> {
  try {
    const absolute = imageUrl.startsWith('http')
      ? imageUrl
      : `${process.env.NEXT_PUBLIC_DASHBOARD_URL || process.env.NEXT_PUBLIC_SERVER_URL || ''}${imageUrl}`
    const res = await fetch(absolute, { cache: 'no-store' })
    if (!res.ok) return null
    const mimeType = res.headers.get('content-type')?.split(';')[0] || 'image/jpeg'
    if (!mimeType.startsWith('image/')) return null
    const buf = Buffer.from(await res.arrayBuffer())
    // Cap ~4MB raw to stay within practical request sizes.
    if (buf.byteLength > 4 * 1024 * 1024) return null
    return { mimeType, data: buf.toString('base64') }
  } catch {
    return null
  }
}

export async function suggestMediaAlt(input: {
  imageUrl: string
  filename: string
  title?: string | null
}): Promise<AiTaskResult<{ alt: string; caption: string | null }>> {
  const inline = await fetchImageAsInline(input.imageUrl)
  if (!inline) {
    return {
      ok: false,
      error: 'Nie udało się pobrać obrazu do analizy (URL lub format).',
    }
  }

  const result = await generateGemini({
    system: SYSTEM_EDITOR,
    json: true,
    parts: [
      { text: mediaAltUserPrompt(input.filename, input.title) },
      { inlineData: inline },
    ],
  })
  if (!result.ok) return mapFail(result)

  const parsed = parseGeminiJson<{ alt?: string; caption?: string | null }>(result.text)
  if (!parsed?.alt?.trim()) {
    return { ok: false, error: 'Model nie zwrócił poprawnego ALT.' }
  }
  return {
    ok: true,
    model: result.model,
    data: {
      alt: parsed.alt.trim(),
      caption:
        typeof parsed.caption === 'string' && parsed.caption.trim()
          ? parsed.caption.trim()
          : null,
    },
  }
}

export async function suggestSeoCopy(input: {
  title: string
  excerpt?: string | null
  contentText?: string | null
  kind: 'post' | 'page'
}): Promise<
  AiTaskResult<{
    metaTitle: string | null
    metaDescription: string
    excerpt: string
  }>
> {
  if (!input.title.trim()) {
    return { ok: false, error: 'Podaj tytuł dokumentu przed propozycją SEO.' }
  }

  const result = await generateGemini({
    system: SYSTEM_EDITOR,
    json: true,
    parts: [{ text: seoCopyUserPrompt(input) }],
  })
  if (!result.ok) return mapFail(result)

  const parsed = parseGeminiJson<{
    metaTitle?: string | null
    metaDescription?: string
    excerpt?: string
  }>(result.text)
  if (!parsed?.metaDescription?.trim() || !parsed.excerpt?.trim()) {
    return { ok: false, error: 'Model nie zwrócił kompletnego SEO / zajawki.' }
  }
  return {
    ok: true,
    model: result.model,
    data: {
      metaTitle:
        typeof parsed.metaTitle === 'string' && parsed.metaTitle.trim()
          ? parsed.metaTitle.trim()
          : null,
      metaDescription: parsed.metaDescription.trim(),
      excerpt: parsed.excerpt.trim(),
    },
  }
}

export async function translatePostDraft(input: {
  title: string
  excerpt?: string | null
  contentText: string
}): Promise<
  AiTaskResult<{ title: string; excerpt: string | null; paragraphs: string[] }>
> {
  if (!input.contentText.trim() && !input.title.trim()) {
    return { ok: false, error: 'Brak treści do tłumaczenia.' }
  }

  const result = await generateGemini({
    system: SYSTEM_TRANSLATOR,
    json: true,
    parts: [{ text: translatePostUserPrompt(input) }],
  })
  if (!result.ok) return mapFail(result)

  const parsed = parseGeminiJson<{
    title?: string
    excerpt?: string | null
    paragraphs?: string[]
  }>(result.text)
  if (!parsed?.title?.trim() || !Array.isArray(parsed.paragraphs)) {
    return { ok: false, error: 'Model nie zwrócił poprawnego tłumaczenia.' }
  }
  return {
    ok: true,
    model: result.model,
    data: {
      title: parsed.title.trim(),
      excerpt:
        typeof parsed.excerpt === 'string' && parsed.excerpt.trim()
          ? parsed.excerpt.trim()
          : null,
      paragraphs: parsed.paragraphs.map((p) => String(p).trim()).filter(Boolean),
    },
  }
}

export async function draftPostFromBrief(
  brief: string,
): Promise<
  AiTaskResult<{
    title: string
    excerpt: string
    outline: string[]
    paragraphs: string[]
  }>
> {
  if (!brief.trim()) {
    return { ok: false, error: 'Wpisz krótki brief.' }
  }

  const result = await generateGemini({
    system: SYSTEM_EDITOR,
    json: true,
    parts: [{ text: draftPostUserPrompt(brief) }],
  })
  if (!result.ok) return mapFail(result)

  const parsed = parseGeminiJson<{
    title?: string
    excerpt?: string
    outline?: string[]
    paragraphs?: string[]
  }>(result.text)
  if (
    !parsed?.title?.trim() ||
    !parsed.excerpt?.trim() ||
    !Array.isArray(parsed.outline) ||
    !Array.isArray(parsed.paragraphs)
  ) {
    return { ok: false, error: 'Model nie zwrócił kompletnego szkicu.' }
  }
  return {
    ok: true,
    model: result.model,
    data: {
      title: parsed.title.trim(),
      excerpt: parsed.excerpt.trim(),
      outline: parsed.outline.map((x) => String(x).trim()).filter(Boolean),
      paragraphs: parsed.paragraphs.map((x) => String(x).trim()).filter(Boolean),
    },
  }
}

export async function suggestPageLayout(input: {
  pageTitle: string
  brief: string
  components: Array<{ id: string | number; name: string; type: string }>
}): Promise<
  AiTaskResult<{
    sections: Array<{
      componentId: string
      width: 'container' | 'narrow' | 'full'
      spacing: 'none' | 'sm' | 'md' | 'lg'
      reason: string
    }>
  }>
> {
  const result = await generateGemini({
    system: SYSTEM_EDITOR,
    json: true,
    parts: [{ text: suggestLayoutUserPrompt(input) }],
  })
  if (!result.ok) return mapFail(result)

  const parsed = parseGeminiJson<{
    sections?: Array<{
      componentId?: string | number
      width?: string
      spacing?: string
      reason?: string
    }>
  }>(result.text)
  if (!parsed || !Array.isArray(parsed.sections)) {
    return { ok: false, error: 'Model nie zwrócił listy sekcji.' }
  }

  const allowed = new Set(input.components.map((c) => String(c.id)))
  const widths = new Set(['container', 'narrow', 'full'])
  const spacings = new Set(['none', 'sm', 'md', 'lg'])

  const sections = parsed.sections
    .map((s) => {
      const componentId = String(s.componentId ?? '')
      if (!allowed.has(componentId)) return null
      const width = widths.has(String(s.width))
        ? (s.width as 'container' | 'narrow' | 'full')
        : 'container'
      const spacing = spacings.has(String(s.spacing))
        ? (s.spacing as 'none' | 'sm' | 'md' | 'lg')
        : 'md'
      return {
        componentId,
        width,
        spacing,
        reason: typeof s.reason === 'string' ? s.reason : '',
      }
    })
    .filter(Boolean) as Array<{
    componentId: string
    width: 'container' | 'narrow' | 'full'
    spacing: 'none' | 'sm' | 'md' | 'lg'
    reason: string
  }>

  return { ok: true, model: result.model, data: { sections } }
}

export async function helpChat(input: {
  message: string
  history?: Array<{ role: 'user' | 'assistant'; content: string }>
}): Promise<AiTaskResult<{ reply: string }>> {
  if (!input.message.trim()) {
    return { ok: false, error: 'Puste pytanie.' }
  }

  const result = await generateGemini({
    system: SYSTEM_HELPER,
    temperature: 0.3,
    parts: [
      {
        text: helpChatUserPrompt(input.message, input.history ?? []),
      },
    ],
  })
  if (!result.ok) return mapFail(result)
  return {
    ok: true,
    model: result.model,
    data: { reply: result.text.trim() },
  }
}

/** Lexical-ish document from plain paragraphs (minimal tree editors accept). */
export function paragraphsToLexical(paragraphs: string[]): {
  root: {
    type: 'root'
    children: unknown[]
    direction: 'ltr'
    format: ''
    indent: 0
    version: 1
  }
} {
  return {
    root: {
      type: 'root',
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
      children: paragraphs.map((text) => ({
        type: 'paragraph',
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
        children: [
          {
            type: 'text',
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text,
            version: 1,
          },
        ],
      })),
    },
  }
}

/** Flatten Lexical (or similar) to plain paragraphs for translation prompts. */
export function lexicalToPlainParagraphs(node: unknown): string[] {
  const paragraphs: string[] = []

  function walk(n: unknown): void {
    if (!n || typeof n !== 'object') return
    if (Array.isArray(n)) {
      n.forEach(walk)
      return
    }
    const record = n as Record<string, unknown>
    if (record.type === 'paragraph' || record.type === 'heading') {
      const text = collectText(record).trim()
      if (text) paragraphs.push(text)
      return
    }
    if (record.children) walk(record.children)
    if (record.root) walk(record.root)
  }

  function collectText(n: unknown): string {
    if (!n || typeof n !== 'object') return ''
    if (Array.isArray(n)) return n.map(collectText).join('')
    const record = n as Record<string, unknown>
    if (typeof record.text === 'string') return record.text
    if (record.children) return collectText(record.children)
    return ''
  }

  walk(node)
  return paragraphs
}
