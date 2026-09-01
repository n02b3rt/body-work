import { SECTION_SPACINGS, SECTION_WIDTHS, type SectionSpacing, type SectionWidth } from '@/lib/builder/elements/registry'

import type { ElementProps } from '../BuilderRender'

function widthOf(value: unknown): { maxWidth: string } {
  const entry = SECTION_WIDTHS.find((w) => w.value === value) ?? SECTION_WIDTHS[1]
  return { maxWidth: entry.maxWidth === 'none' ? '100%' : entry.maxWidth }
}

function spacingClass(value: unknown): string {
  const entry = SECTION_SPACINGS.find((s) => s.value === value) ?? SECTION_SPACINGS[2]
  return entry.className
}

/**
 * The band across the page: width and vertical spacing are a sitewide
 * convention (`SECTION_WIDTHS`/`SECTION_SPACINGS`), not free Tailwind classes,
 * so `props` carries them rather than `tw`. Anything else (background,
 * borders) still goes through the node's own `tw`/`css`, applied by the
 * caller in `BuilderRender`.
 */
export function Section({ node, children }: ElementProps) {
  const anchor = typeof node.props.anchor === 'string' ? node.props.anchor : undefined
  const background = typeof node.props.background === 'string' ? node.props.background : ''

  return (
    <section
      className={[background ? `bg-${background}` : '', spacingClass(node.props.spacing as SectionSpacing)]
        .filter(Boolean)
        .join(' ')}
      id={anchor || undefined}
    >
      <div className="mx-auto flex flex-col gap-4 px-4" style={widthOf(node.props.width as SectionWidth)}>
        {children}
      </div>
    </section>
  )
}
