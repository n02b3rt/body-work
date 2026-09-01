import { MAX_COMPOSITION_DEPTH } from '@/lib/builder/elements/registry'

import { BuilderRender } from '../BuilderRender'
import type { ElementProps } from '../BuilderRender'

/**
 * A reference to a `site-components` document, resolved into `ctx.components`
 * before rendering starts (both here and on the site: see `ResolvedDoc` in
 * `docs/page-builder.md`). Renders the resolved tree through `BuilderRender`
 * itself, so a composition made of headings, images and containers is not a
 * second renderer to maintain.
 *
 * `MAX_COMPOSITION_DEPTH` stops a composition that references itself, directly
 * or through a chain, from recursing forever — `ctx.depth` increments on the
 * way in and this bails once the ceiling is hit.
 */
export function SavedComponent({ node, ctx }: ElementProps) {
  const componentId = node.ref?.component
  if (!componentId) {
    return ctx.mode === 'canvas' ? (
      <div className="rounded-md border border-dashed border-line bg-surface-alt p-4 text-sm text-muted">
        Wybierz komponent w panelu ustawień
      </div>
    ) : null
  }

  if (ctx.depth >= MAX_COMPOSITION_DEPTH) {
    return ctx.mode === 'canvas' ? (
      <div className="rounded-md border border-dashed border-error bg-error/10 p-4 text-sm text-error">
        Zbyt głębokie zagnieżdżenie komponentów
      </div>
    ) : null
  }

  const resolved = ctx.components[componentId]
  if (!resolved) {
    return ctx.mode === 'canvas' ? (
      <div className="rounded-md border border-dashed border-error bg-error/10 p-4 text-sm text-error">
        Komponent nie został znaleziony
      </div>
    ) : null
  }

  return <BuilderRender ctx={{ ...ctx, depth: ctx.depth + 1 }} doc={resolved} />
}
