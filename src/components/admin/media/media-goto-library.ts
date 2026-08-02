/** sessionStorage flag: after media create, land on the library list instead of the edit view. */
export const MEDIA_GOTO_LIBRARY_KEY = 'bw-media-goto-library'

export function markMediaGotoLibrary(): void {
  if (typeof window === 'undefined') return
  window.sessionStorage.setItem(MEDIA_GOTO_LIBRARY_KEY, '1')
}

export function consumeMediaGotoLibrary(): boolean {
  if (typeof window === 'undefined') return false
  if (window.sessionStorage.getItem(MEDIA_GOTO_LIBRARY_KEY) !== '1') return false
  window.sessionStorage.removeItem(MEDIA_GOTO_LIBRARY_KEY)
  return true
}

export function mediaLibraryPath(adminRoute: string): string {
  const base = adminRoute.replace(/\/$/, '') || '/admin'
  return `${base}/c/media`
}
