import type { ElementProps } from '../BuilderRender'

const ALLOWED_TAGS = new Set(['p', 'div', 'span', 'blockquote'])

export function Text({ node }: ElementProps) {
  const html = typeof node.props.html === 'string' ? node.props.html : ''
  const rawTag = typeof node.props.tag === 'string' ? node.props.tag : 'p'
  const Tag = (ALLOWED_TAGS.has(rawTag) ? rawTag : 'p') as 'p' | 'div' | 'span' | 'blockquote'
  return <Tag className="text-body" dangerouslySetInnerHTML={{ __html: html }} />
}
