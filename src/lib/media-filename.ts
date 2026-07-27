import { formatSlug } from '@/lib/format-slug'

/** Strip path + extension from an upload filename. */
export function basenameWithoutExt(filename: string): string {
  const base = filename.replace(/^.*[\\/]/, '')
  return base.includes('.') ? base.replace(/\.[^.]+$/, '') : base
}

/** Turn a filename into a short human-readable phrase for ALT / title. */
export function humanizeFilename(filename: string): string {
  const raw = basenameWithoutExt(filename)
    .replace(/[_]+/g, ' ')
    .replace(/[-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (!raw) return ''

  return raw
    .split(' ')
    .filter(Boolean)
    .map((word) => {
      if (/^\d+$/.test(word)) return word
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    })
    .join(' ')
}

/** Default ALT text from filename (manual review still expected). */
export function suggestAltFromFilename(filename: string): string {
  return humanizeFilename(filename)
}

/** Default URL/filename slug from an upload name. */
export function suggestSlugFromFilename(filename: string): string {
  return formatSlug(basenameWithoutExt(filename))
}

export type MediaKind = 'image' | 'video' | 'document' | 'other'

export function mediaKindFromMime(mimetype: string | null | undefined): MediaKind {
  if (!mimetype) return 'other'
  if (mimetype.startsWith('image/')) return 'image'
  if (mimetype.startsWith('video/')) return 'video'
  if (
    mimetype === 'application/pdf' ||
    mimetype.startsWith('application/') ||
    mimetype.startsWith('text/')
  ) {
    return 'document'
  }
  return 'other'
}
