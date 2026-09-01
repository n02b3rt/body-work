import type { ElementProps } from '../BuilderRender'

export function Cta({ node }: ElementProps) {
  const heading = typeof node.props.heading === 'string' ? node.props.heading : ''
  const text = typeof node.props.text === 'string' ? node.props.text : ''
  const buttonLabel = typeof node.props.buttonLabel === 'string' ? node.props.buttonLabel : ''
  const buttonHref = typeof node.props.buttonHref === 'string' ? node.props.buttonHref : ''

  return (
    <div className="flex flex-col items-center gap-3 rounded-lg bg-surface-alt p-8 text-center">
      {heading ? <h3 className="text-h-tile text-text-heading">{heading}</h3> : null}
      {text ? (
        <div className="text-body text-muted" dangerouslySetInnerHTML={{ __html: text }} />
      ) : null}
      {buttonLabel ? (
        <a
          className="mt-2 inline-flex items-center rounded-md bg-brand px-6 py-3 text-btn uppercase tracking-wide text-inverted hover:bg-brand-hover"
          href={buttonHref || '#'}
        >
          {buttonLabel}
        </a>
      ) : null}
    </div>
  )
}
