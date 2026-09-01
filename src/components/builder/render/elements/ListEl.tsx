import { IconGlyph } from './Icon'
import type { ElementProps } from '../BuilderRender'

type ListItem = { icon?: string; html?: string }

export function ListEl({ node }: ElementProps) {
  const items = Array.isArray(node.props.items) ? (node.props.items as ListItem[]) : []
  if (items.length === 0) return null

  return (
    <ul className="flex flex-col gap-3">
      {items.map((item, index) => (
        <li className="flex items-start gap-3" key={index}>
          <span className="mt-1 shrink-0 text-brand">
            <IconGlyph name={item.icon ?? 'check'} size="sm" />
          </span>
          <span
            className="text-body"
            dangerouslySetInnerHTML={{ __html: typeof item.html === 'string' ? item.html : '' }}
          />
        </li>
      ))}
    </ul>
  )
}
