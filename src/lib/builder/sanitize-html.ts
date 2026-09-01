/**
 * Sanitizes the inline HTML an editor produces in the builder's rich-text
 * controls (`heading`/`text`/repeater `html` props) before it is stored.
 *
 * Rendered on the public site via `dangerouslySetInnerHTML`
 * (`src/components/builder/render/elements/`), so this is the one gate that
 * makes that safe. Runs in a `beforeValidate` hook
 * (`src/collections/{Pages,Posts,SiteComponents}.ts`) — server-side, on every
 * save, regardless of what wrote the value — not only from the editor's own
 * sanitisation on the client, which a direct API call bypasses entirely.
 *
 * A small hand-written allowlist rather than `jsdom`: `docs/stack.md` notes
 * jsdom is a **devDependency only**, pulled in for Payload's own
 * `convertHTMLToLexical` and never meant to run in the served app. Access to
 * `builder` is staff-only (`isStaff`), so this defends against a compromised
 * account or a pasted malicious snippet, not anonymous public input — a
 * regex allowlist is proportionate to that threat model.
 */

const ALLOWED_TAGS = new Set(['strong', 'em', 'a', 'br', 'ul', 'ol', 'li', 'p'])
const VOID_TAGS = new Set(['br'])

const TAG_PATTERN = /<\/?([a-z0-9]+)((?:\s+[^<>]*)?)\/?>/gi
const HREF_PATTERN = /href\s*=\s*(?:"([^"]*)"|'([^']*)')/i
const TARGET_PATTERN = /target\s*=\s*(?:"([^"]*)"|'([^']*)')/i

const SAFE_URL = /^(https?:|mailto:|tel:|\/|#)/i

function sanitizeHref(raw: string): string | null {
  const trimmed = raw.trim()
  if (!SAFE_URL.test(trimmed)) return null
  return trimmed.replace(/"/g, '&quot;')
}

/** Rebuilds an `<a ...>` opening tag with only `href` (validated) and a safe `target`/`rel`. */
function rebuildAnchorOpenTag(attrs: string): string {
  const hrefMatch = attrs.match(HREF_PATTERN)
  const href = hrefMatch ? sanitizeHref(hrefMatch[1] ?? hrefMatch[2] ?? '') : null
  const targetMatch = attrs.match(TARGET_PATTERN)
  const target = targetMatch?.[1] ?? targetMatch?.[2]

  const parts = ['a']
  if (href) parts.push(`href="${href}"`)
  if (target === '_blank') parts.push('target="_blank" rel="noopener noreferrer"')
  return `<${parts.join(' ')}>`
}

/**
 * Strips everything outside the allowlist. An unlisted tag is removed but its
 * text content stays (a pasted `<div>` becomes plain text, not two lost
 * paragraphs), and every attribute is dropped except `href`/`target` on `<a>`,
 * rebuilt from scratch rather than filtered in place.
 */
export function sanitizeBuilderHtml(input: unknown): string {
  if (typeof input !== 'string' || input.length === 0) return ''

  // Neutralise anything that could reopen a script context before tags are parsed.
  const withoutDangerous = input.replace(/<\s*(script|style|iframe|object|embed|svg)\b[\s\S]*?<\s*\/\s*\1\s*>/gi, '')

  return withoutDangerous.replace(TAG_PATTERN, (full, rawTag: string, attrs: string) => {
    const tag = rawTag.toLowerCase()
    if (!ALLOWED_TAGS.has(tag)) return ''

    const isClosing = full.startsWith('</')
    if (VOID_TAGS.has(tag)) return '<br>'
    if (isClosing) return `</${tag}>`
    if (tag === 'a') return rebuildAnchorOpenTag(attrs)
    return `<${tag}>`
  })
}
