/**
 * Resolves a `BuilderDoc` for rendering: every `Media` it references, and
 * every `savedComponent` reference's own tree, fetched in one pass through
 * Payload's Local API (server-side only — the canvas does the equivalent
 * fetch over REST, see `use-resolved-media.ts`).
 *
 * `json` fields are opaque to Payload's `depth`-based population: unlike the
 * old builder's `upload`/`relationship` fields, an id sitting inside
 * `props.mediaId` is never walked or populated automatically, however deep
 * `depth` is set. This is that walk, done once, explicitly.
 */

import type { Payload } from 'payload'

import { coerceBuilderDoc, collectMediaIds, type BuilderDoc } from './types'
import { MAX_COMPOSITION_DEPTH } from './elements/registry'
import type { Media, SiteComponent } from '@/payload-types'

function collectComponentRefs(doc: BuilderDoc): string[] {
  const ids = new Set<string>()
  for (const node of Object.values(doc.nodes)) {
    if (node.type === 'savedComponent' && node.ref?.component) ids.add(node.ref.component)
  }
  return [...ids]
}

export type ResolvedForRender = {
  media: Record<number, Media>
  components: Record<string, BuilderDoc>
}

/**
 * Breadth-first: resolves `doc`'s own media and component refs, then each
 * referenced component's media and further refs, capped at
 * `MAX_COMPOSITION_DEPTH` so a composition that ends up inside itself cannot
 * recurse forever.
 */
export async function resolveForRender(payload: Payload, doc: BuilderDoc): Promise<ResolvedForRender> {
  const media: Record<number, Media> = {}
  const components: Record<string, BuilderDoc> = {}

  let frontier: BuilderDoc[] = [doc]
  let depth = 0

  while (frontier.length > 0 && depth < MAX_COMPOSITION_DEPTH) {
    const mediaIds = new Set<number>()
    const componentIds = new Set<string>()
    for (const d of frontier) {
      for (const id of collectMediaIds(d)) mediaIds.add(id)
      for (const id of collectComponentRefs(d)) if (!components[id]) componentIds.add(id)
    }

    if (mediaIds.size > 0) {
      const found = await payload.find({
        collection: 'media',
        where: { id: { in: [...mediaIds] } },
        limit: mediaIds.size,
        depth: 0,
        overrideAccess: true,
      })
      for (const item of found.docs) media[item.id] = item
    }

    const nextFrontier: BuilderDoc[] = []
    if (componentIds.size > 0) {
      const found = await payload.find({
        collection: 'site-components',
        where: { id: { in: [...componentIds] } },
        limit: componentIds.size,
        depth: 0,
        overrideAccess: true,
      })
      for (const item of found.docs as SiteComponent[]) {
        const resolvedDoc = coerceBuilderDoc(item.builder)
        components[String(item.id)] = resolvedDoc
        nextFrontier.push(resolvedDoc)
      }
    }

    frontier = nextFrontier
    depth += 1
  }

  return { media, components }
}
