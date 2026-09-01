import type { ElementProps } from '../BuilderRender'

const HEADING_SIZE_CLASS: Record<number, string> = {
  1: 'text-h-hero',
  2: 'text-h-section',
  3: 'text-h-sub',
  4: 'text-h-tile',
  5: 'text-h-menu',
  6: 'text-h-mobile',
}

export function Heading({ node }: ElementProps) {
  const level = node.a11y?.headingLevel ?? 2
  const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  const html = typeof node.props.html === 'string' ? node.props.html : ''

  return (
    <Tag
      className={HEADING_SIZE_CLASS[level] ?? 'text-h-mobile'}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
