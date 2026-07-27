import type { MediaKind } from '@/lib/media-filename'
import type { Media } from '@/payload-types'

export type { MediaKind }

export type LibraryView = 'grid' | 'list'
export type SortKey = '-createdAt' | 'createdAt' | 'filename' | '-filename' | '-filesize' | 'title'

export type KindFilter = 'all' | MediaKind

export const KIND_LABELS: Record<MediaKind, string> = {
  image: 'Obrazy',
  video: 'Wideo',
  document: 'Dokumenty',
  other: 'Inne',
}

export const KIND_FOLDER_ORDER: MediaKind[] = ['image', 'video', 'document', 'other']

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: '-createdAt', label: 'Najnowsze' },
  { value: 'createdAt', label: 'Najstarsze' },
  { value: 'filename', label: 'Nazwa A–Z' },
  { value: '-filename', label: 'Nazwa Z–A' },
  { value: 'title', label: 'Tytuł A–Z' },
  { value: '-filesize', label: 'Największe' },
]

export function formatBytes(bytes: number | null | undefined): string {
  if (bytes == null || !Number.isFinite(bytes)) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function formatDimensions(
  width: number | null | undefined,
  height: number | null | undefined,
): string {
  if (!width || !height) return '—'
  return `${width} × ${height}`
}

export function mediaDisplayTitle(doc: Media): string {
  return doc.title || doc.filename || doc.alt || `Plik #${doc.id}`
}

export function mediaThumbUrl(doc: Media): string | null {
  const sizes = doc.sizes
  // `thumbnail` is this project's name for the 400px variant; the media-library branch
  // called it `thumb`. Both are accepted so the grid keeps working either way.
  const sized = sizes && typeof sizes === 'object' ? (sizes as Record<string, unknown>) : null
  const thumb = sized ? (sized.thumbnail ?? sized.thumb ?? null) : null
  if (thumb && typeof thumb === 'object' && thumb && 'url' in thumb && typeof thumb.url === 'string') {
    return thumb.url
  }
  if (doc.thumbnailURL) return doc.thumbnailURL
  if (doc.mimeType?.startsWith('image/') && doc.url) return doc.url
  return null
}

export function isProbablyImage(doc: Media): boolean {
  return doc.kind === 'image' || Boolean(doc.mimeType?.startsWith('image/'))
}

export function isProbablyVideo(doc: Media): boolean {
  return doc.kind === 'video' || Boolean(doc.mimeType?.startsWith('video/'))
}

export function storageKey(key: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback
  try {
    return localStorage.getItem(key) || fallback
  } catch {
    return fallback
  }
}

export function persistKey(key: string, value: string): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, value)
  } catch {
    // ignore quota / private mode
  }
}

/**
 * The three view preferences (grid/list, details pane, group-by-kind) live in localStorage,
 * which is external mutable state — so components read them through `useSyncExternalStore`
 * rather than copying them into `useState` inside an effect. The React Compiler lint rules
 * this project runs reject the latter (`react-hooks/set-state-in-effect`), and the store
 * also keeps the server render and the first client render agreed: `getServerSnapshot`
 * returns the fallback, so there is nothing to mismatch.
 *
 * Same pattern as `PromoBar` and `AdminNav`.
 */
const listeners = new Set<() => void>()

export function subscribePreferences(onChange: () => void): () => void {
  listeners.add(onChange)
  return () => {
    listeners.delete(onChange)
  }
}

export function setPreference(key: string, value: string): void {
  persistKey(key, value)
  for (const listener of listeners) listener()
}
