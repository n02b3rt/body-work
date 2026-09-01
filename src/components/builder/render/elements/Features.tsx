import { IconGlyph } from './Icon'
import type { ElementProps } from '../BuilderRender'

type FeatureItem = { icon?: string; heading?: string; text?: string }

export function Features({ node }: ElementProps) {
  const items = Array.isArray(node.props.items) ? (node.props.items as FeatureItem[]) : []
  if (items.length === 0) return null

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item, index) => (
        <div className="flex flex-col items-start gap-3 rounded-md border border-line p-6" key={index}>
          <span className="text-brand">
            <IconGlyph name={item.icon ?? 'check'} size="lg" />
          </span>
          {item.heading ? <h4 className="text-h-tile text-text-heading">{item.heading}</h4> : null}
          {item.text ? (
            <div className="text-body text-muted" dangerouslySetInnerHTML={{ __html: item.text }} />
          ) : null}
        </div>
      ))}
    </div>
  )
}
