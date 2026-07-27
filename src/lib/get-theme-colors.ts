import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { cache } from 'react'

import { buildThemeCss } from './theme-css'

/**
 * Reads the "Schemat kolorów" global and returns it as `:root` CSS.
 * Cached per request; falls back to the token defaults when the global has not
 * been saved yet (or the database is unreachable during a build).
 */
export const getThemeCss = cache(async (): Promise<string> => {
  try {
    const payload = await getPayload({ config: configPromise })
    const themeColors = await payload.findGlobal({
      slug: 'theme-colors',
      depth: 0,
    })
    return buildThemeCss(themeColors as unknown as Record<string, unknown>)
  } catch {
    return buildThemeCss(null)
  }
})
