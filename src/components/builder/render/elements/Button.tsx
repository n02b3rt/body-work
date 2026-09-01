import type { ElementProps } from '../BuilderRender'

const VARIANT_CLASS: Record<string, string> = {
  primary: 'bg-brand text-inverted hover:bg-brand-hover',
  secondary: 'border border-brand text-brand hover:bg-surface-alt',
  ghost: 'text-brand hover:underline',
}

export function Button({ node }: ElementProps) {
  const label = typeof node.props.label === 'string' ? node.props.label : ''
  const href = typeof node.props.href === 'string' ? node.props.href : ''
  const target = node.props.target === '_blank' ? '_blank' : undefined
  const variant = typeof node.props.variant === 'string' ? node.props.variant : 'primary'

  if (!label) return null

  return (
    <a
      className={[
        'inline-flex items-center justify-center rounded-md text-btn uppercase tracking-wide transition-colors',
        VARIANT_CLASS[variant] ?? VARIANT_CLASS.primary,
      ].join(' ')}
      href={href || '#'}
      rel={target === '_blank' ? 'noopener noreferrer' : undefined}
      target={target}
    >
      {label}
    </a>
  )
}
