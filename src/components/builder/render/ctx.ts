/**
 * What a renderer needs to draw a tree, resolved once before rendering starts.
 *
 * `media`/`components` are resolved **into** this context rather than fetched
 * by individual element components, because `savedComponent` (reference mode)
 * and `image`/`gallery`/`video` all need the same two lookups and neither the
 * canvas nor the public site should fetch per-node.
 *
 * **Known limitation, not yet closed:** the canvas renders with the site's own
 * `md:`/`lg:` (viewport media query) utility classes, so the desktop/tablet/
 * mobile switch narrows the canvas wrapper but does not itself trigger a
 * breakpoint-gated layout change the way a real device width would. Verify a
 * responsive layout with `/podglad/{type}/{slug}` at an actual narrow browser
 * width, or on a device, until this gets a container-query variant pass.
 */

import type { Media } from '@/payload-types'
import type { BuilderDoc } from '@/lib/builder/types'

export type RenderMode = 'canvas' | 'site'

export type RenderCtx = {
  mode: RenderMode
  media: Record<number, Media>
  /** `site-components` document id -> its own resolved tree, for `savedComponent` reference nodes. */
  components: Record<string, BuilderDoc>
  /** Guards a reference resolving back into itself, directly or through a chain. */
  depth: number
}

export function baseRenderCtx(mode: RenderMode): RenderCtx {
  return { mode, media: {}, components: {}, depth: 0 }
}
