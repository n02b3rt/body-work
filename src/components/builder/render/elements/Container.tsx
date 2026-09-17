import type { ElementProps } from '../BuilderRender'

/**
 * The one container element: replaces the old `columns`/`column` pair. A
 * container is just a node with `children`, so it can hold another
 * container — unbounded nesting, capped only by `MAX_TREE_DEPTH`, not by the
 * schema the way the old blocks were.
 *
 * No layout of its own beyond `flex`: direction, gap, wrap, alignment all
 * come from the node's own `tw` (its default is `flex flex-col gap-4`, see
 * the registry), so the inspector's Layout tab is what actually shapes it.
 */
export function Container({ children }: ElementProps) {
  return <div className="min-h-8 w-full">{children}</div>
}
