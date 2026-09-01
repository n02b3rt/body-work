import type { SVGProps } from 'react'

/**
 * Icons for the library panel's own buttons — one per `ElementDefinition.icon`
 * (`src/lib/builder/elements/registry.ts`). Deliberately separate from
 * `render/elements/Icon.tsx`'s `ICONS`: those are page **content** (a list
 * item, a feature card), chosen by an editor; these are fixed editor chrome,
 * chosen by us. Not every element needs a bespoke glyph — several share one
 * where the visual distinction would not carry real information (the three
 * "gotowe bloki" that are all "an image-backed banner" at a glance), and every
 * saved composition shares the single `component` (puzzle piece) glyph on
 * purpose, per the editor's own instruction: one shared icon for anything
 * custom, not one each.
 */

type IconFn = (props: SVGProps<SVGSVGElement>) => React.JSX.Element

const stroke = (props: SVGProps<SVGSVGElement>) => ({
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  viewBox: '0 0 24 24',
  ...props,
})

const LAYOUT_ICONS: Record<string, IconFn> = {
  'layout-grid': (props) => (
    <svg {...stroke(props)}>
      <rect height="7" rx="1" width="7" x="3" y="3" />
      <rect height="7" rx="1" width="7" x="14" y="3" />
      <rect height="7" rx="1" width="7" x="3" y="14" />
      <rect height="7" rx="1" width="7" x="14" y="14" />
    </svg>
  ),
  heading: (props) => (
    <svg {...stroke(props)}>
      <path d="M5 4v16M19 4v16M5 12h14" />
    </svg>
  ),
  text: (props) => (
    <svg {...stroke(props)}>
      <path d="M4 6h16M4 12h16M4 18h10" />
    </svg>
  ),
  image: (props) => (
    <svg {...stroke(props)}>
      <rect height="16" rx="2" width="18" x="3" y="4" />
      <circle cx="8.5" cy="9.5" r="1.5" />
      <path d="M21 16l-5.5-5.5a2 2 0 0 0-2.8 0L4 19" />
    </svg>
  ),
  button: (props) => (
    <svg {...stroke(props)}>
      <rect height="9" rx="3" width="18" x="3" y="7.5" />
      <path d="M7 12h6" />
    </svg>
  ),
  sparkle: (props) => (
    <svg {...stroke(props)}>
      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" />
    </svg>
  ),
  list: (props) => (
    <svg {...stroke(props)}>
      <path d="M9 6h11M9 12h11M9 18h11" />
      <path d="M4.5 6l1 1 1.5-1.8M4.5 12l1 1 1.5-1.8M4.5 18l1 1 1.5-1.8" />
    </svg>
  ),
  divider: (props) => (
    <svg {...stroke(props)}>
      <path d="M4 12h16" />
      <path d="M9 8v8M15 8v8" strokeOpacity={0.4} />
    </svg>
  ),
  spacer: (props) => (
    <svg {...stroke(props)}>
      <path d="M4 6h16M4 18h16" />
      <path d="M12 9v6M9 10.5L12 9l3 1.5M9 13.5L12 15l3-1.5" />
    </svg>
  ),
  gallery: (props) => (
    <svg {...stroke(props)}>
      <rect height="14" rx="1.5" width="10" x="3" y="5" />
      <path d="M17 8h4v11a1 1 0 0 1-1 1H8v-4" />
    </svg>
  ),
  carousel: (props) => (
    <svg {...stroke(props)}>
      <rect height="14" rx="1.5" width="12" x="6" y="5" />
      <path d="M2 9v6M22 9v6" />
    </svg>
  ),
  video: (props) => (
    <svg {...stroke(props)}>
      <rect height="16" rx="2" width="18" x="3" y="4" />
      <path d="M10 9l6 3-6 3V9z" fill="currentColor" stroke="none" />
    </svg>
  ),
  accordion: (props) => (
    <svg {...stroke(props)}>
      <rect height="5" rx="1" width="18" x="3" y="4" />
      <rect height="5" rx="1" width="18" x="3" y="14.5" />
      <path d="M17 6.5l1.5 1.5L20 6.5" />
    </svg>
  ),
  block: (props) => (
    <svg {...stroke(props)}>
      <rect height="16" rx="2" width="18" x="3" y="4" />
      <path d="M6 15h6M6 18h9" />
    </svg>
  ),
  component: (props) => (
    <svg {...stroke(props)}>
      <path d="M9 4h4a1 1 0 0 1 1 1v2.2a1.8 1.8 0 1 1 0 3.6V13a1 1 0 0 1-1 1h-2.2a1.8 1.8 0 1 0-3.6 0H5a1 1 0 0 1-1-1V9a1.8 1.8 0 1 0 0-3.6V5a1 1 0 0 1 1-1h2.2a1.8 1.8 0 1 1 3.6 0z" />
    </svg>
  ),
}

// The three "gotowe bloki" that are, at a glance, all "an image-backed banner with text":
// sharing one icon is the honest option rather than inventing a false distinction.
LAYOUT_ICONS.hero = LAYOUT_ICONS.block
LAYOUT_ICONS.cta = LAYOUT_ICONS.block
LAYOUT_ICONS.features = LAYOUT_ICONS['layout-grid']

export function LibraryIcon({ name, className }: { name: string; className?: string }) {
  const Glyph = LAYOUT_ICONS[name] ?? LAYOUT_ICONS.block
  return <Glyph className={className ?? 'h-5 w-5'} aria-hidden="true" />
}
