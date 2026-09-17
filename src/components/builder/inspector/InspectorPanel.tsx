'use client'

import { useState } from 'react'

import { elementDefinition } from '@/lib/builder/elements/registry'
import {
  ALIGN_ITEMS,
  COLOR_TOKENS,
  GRID_COLUMNS,
  JUSTIFY_CONTENT,
  SHADOW_SCALE,
  SPACING_SCALE,
} from '@/lib/builder/tw-tokens'
import { useBuilderStore, VIEWPORT_BREAKPOINT } from '@/components/builder/editor/store'

import { BoxModelEditor } from './BoxModelEditor'
import { ContentControl } from './ContentControl'
import { classPattern, findClassMatching, setClassMatching } from './tw-bucket'

type Tab = 'content' | 'layout' | 'style'

const colorSuffixes = COLOR_TOKENS.map((t) => t.value).join('|')
function colorPattern(prefix: 'bg' | 'text' | 'border') {
  return new RegExp(`^${prefix}-(${colorSuffixes})$`)
}

function ColorField({
  label,
  prefix,
  classes,
  onChange,
}: {
  label: string
  prefix: 'bg' | 'text' | 'border'
  classes: string[]
  onChange: (next: string[]) => void
}) {
  const pattern = colorPattern(prefix)
  const current = findClassMatching(classes, pattern)?.slice(prefix.length + 1) ?? ''

  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-xs font-medium text-muted">{label}</span>
      <select
        className="rounded-md border border-line px-2 py-1.5 text-sm"
        onChange={(e) => {
          const value = e.target.value
          onChange(setClassMatching(classes, pattern, value ? `${prefix}-${value}` : null))
        }}
        value={current}
      >
        <option value="">Brak</option>
        {COLOR_TOKENS.map((token) => (
          <option key={token.value} value={token.value}>
            {token.label}
          </option>
        ))}
      </select>
    </label>
  )
}

function SpacingField({
  label,
  property,
  classes,
  onChange,
}: {
  label: string
  property: string
  classes: string[]
  onChange: (next: string[]) => void
}) {
  const pattern = classPattern(property)
  const current = findClassMatching(classes, pattern)?.slice(property.length + 1) ?? ''

  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-xs font-medium text-muted">{label}</span>
      <select
        className="rounded-md border border-line px-2 py-1.5 text-sm"
        onChange={(e) => {
          const value = e.target.value
          onChange(setClassMatching(classes, pattern, value ? `${property}-${value}` : null))
        }}
        value={current}
      >
        <option value="">—</option>
        {SPACING_SCALE.map((step) => (
          <option key={step} value={step}>
            {step}
          </option>
        ))}
      </select>
    </label>
  )
}

function ScaleField<T extends string | number>({
  label,
  prefix,
  values,
  classes,
  onChange,
  formatValue,
}: {
  label: string
  prefix: string
  values: readonly T[]
  classes: string[]
  onChange: (next: string[]) => void
  formatValue?: (value: T) => string
}) {
  const pattern = classPattern(prefix)
  const current = findClassMatching(classes, pattern)?.slice(prefix.length + 1) ?? ''

  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-xs font-medium text-muted">{label}</span>
      <select
        className="rounded-md border border-line px-2 py-1.5 text-sm"
        onChange={(e) => {
          const value = e.target.value
          onChange(setClassMatching(classes, pattern, value ? `${prefix}-${value}` : null))
        }}
        value={current}
      >
        <option value="">—</option>
        {values.map((value) => (
          <option key={String(value)} value={String(value)}>
            {formatValue ? formatValue(value) : String(value)}
          </option>
        ))}
      </select>
    </label>
  )
}

/**
 * A live abstract diagram (three little boxes) drawn with the container's own actual `flex`/`grid`
 * classes — direction, justify, items, gap, wrap, columns — so "what does this layout look like"
 * never drifts from what the dropdowns below it say: it is not a separate rendering of the same
 * idea, it *is* the same classes, reused verbatim. Every class it can end up with (`flex-row`,
 * `justify-between`, `gap-8`, …) already exists in `tw-safelist.ts`'s systematic scale — this
 * widget introduces no class that the canvas/site couldn't already produce.
 */
function LayoutPreview({ classes }: { classes: string[] }) {
  const display = findClassMatching(classes, /^(flex|grid|block)$/) ?? 'flex'
  const direction = findClassMatching(classes, /^flex-(row|col)$/) ?? 'flex-row'
  const justify = findClassMatching(classes, /^justify-/) ?? ''
  const items = findClassMatching(classes, /^items-/) ?? ''
  const gap = findClassMatching(classes, /^gap-/) ?? 'gap-1'
  const gridCols = findClassMatching(classes, /^grid-cols-/) ?? 'grid-cols-3'
  const wrap = Boolean(findClassMatching(classes, /^flex-wrap$/))

  const boxClass = [
    'h-full w-full',
    display === 'grid' ? 'grid' : 'flex',
    display === 'grid' ? gridCols : direction,
    justify,
    items,
    gap,
    wrap ? 'flex-wrap' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className="h-16 w-full rounded-md border border-dashed border-line bg-surface-alt p-2">
      <div className={boxClass}>
        {[0, 1, 2].map((i) => (
          <div className="h-5 w-5 shrink-0 rounded-sm bg-[var(--bw-editor-accent)]/50" key={i} />
        ))}
      </div>
    </div>
  )
}

function DirectionToggle({ classes, onChange }: { classes: string[]; onChange: (next: string[]) => void }) {
  const direction = findClassMatching(classes, /^flex-(row|col)$/) ?? 'flex-row'
  const options = [
    { value: 'flex-row', glyph: '→', title: 'Wiersz (poziomo)' },
    { value: 'flex-col', glyph: '↓', title: 'Kolumna (pionowo)' },
  ]
  return (
    <div className="flex gap-1">
      {options.map((opt) => (
        <button
          aria-pressed={direction === opt.value}
          className={`flex h-8 w-10 items-center justify-center rounded border text-sm ${
            direction === opt.value
              ? 'border-[var(--bw-editor-accent)] bg-[var(--bw-editor-accent)] text-white'
              : 'border-line text-muted hover:border-[var(--bw-editor-accent)]'
          }`}
          key={opt.value}
          onClick={() => onChange(setClassMatching(classes, /^flex-(row|col)$/, opt.value))}
          title={opt.title}
          type="button"
        >
          {opt.glyph}
        </button>
      ))}
    </div>
  )
}

const AXIS_POSITIONS = ['start', 'center', 'end'] as const

/** The 9 start/center/end × start/center/end combinations as a spatial grid, Figma-style. Does not
 * attempt to be axis-aware when direction is `flex-col` (row still reads as "items", column still
 * "justify") — a real device would flip which axis is which, but the extra bookkeeping bought little
 * for a control this small; `stretch`/`between`/`around` fall outside the 3x3 shape entirely, so the
 * plain dropdowns below stay for those, this is an additive quick-pick, not their replacement. */
function AlignGrid({ classes, onChange }: { classes: string[]; onChange: (next: string[]) => void }) {
  const justify = findClassMatching(classes, /^justify-/)?.slice('justify-'.length) ?? ''
  const items = findClassMatching(classes, /^items-/)?.slice('items-'.length) ?? ''

  const setBoth = (justifyValue: string, itemsValue: string) => {
    const withJustify = setClassMatching(classes, classPattern('justify'), `justify-${justifyValue}`)
    onChange(setClassMatching(withJustify, classPattern('items'), `items-${itemsValue}`))
  }

  return (
    <div className="inline-grid grid-cols-3 gap-1 rounded-md border border-line bg-surface-alt p-1.5">
      {AXIS_POSITIONS.map((row) =>
        AXIS_POSITIONS.map((col) => {
          const active = items === row && justify === col
          return (
            <button
              aria-label={`Wyrównanie ${row}, rozmieszczenie ${col}`}
              aria-pressed={active}
              className={`flex h-6 w-6 items-center justify-center rounded border text-[10px] ${
                active
                  ? 'border-[var(--bw-editor-accent)] bg-[var(--bw-editor-accent)] text-white'
                  : 'border-line text-muted hover:border-[var(--bw-editor-accent)]'
              }`}
              key={`${row}-${col}`}
              onClick={() => setBoth(col, row)}
              type="button"
            >
              •
            </button>
          )
        }),
      )}
    </div>
  )
}

function WrapField({ classes, onChange }: { classes: string[]; onChange: (next: string[]) => void }) {
  const wraps = Boolean(findClassMatching(classes, /^flex-wrap$/))
  return (
    <label className="flex items-center gap-2 text-sm">
      <input
        checked={wraps}
        onChange={(e) => onChange(setClassMatching(classes, /^flex-(wrap|nowrap)$/, e.target.checked ? 'flex-wrap' : null))}
        type="checkbox"
      />
      Zawijanie (wrap)
    </label>
  )
}

function LayoutTab({
  classes,
  onChange,
  onFocusHighlight,
  onBlurHighlight,
}: {
  classes: string[]
  onChange: (next: string[]) => void
  onFocusHighlight: () => void
  onBlurHighlight: (e: React.FocusEvent) => void
}) {
  const display = findClassMatching(classes, /^(flex|grid|block)$/) ?? ''
  const canAlign = display === 'flex' || display === 'grid'

  return (
    <div className="flex flex-col gap-4" onBlur={onBlurHighlight} onFocus={onFocusHighlight}>
      {display === 'flex' || display === 'grid' ? <LayoutPreview classes={classes} /> : null}
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-xs font-medium text-muted">Wyświetlanie</span>
        <select
          className="rounded-md border border-line px-2 py-1.5 text-sm"
          onChange={(e) =>
            onChange(setClassMatching(classes, /^(flex|grid|block)$/, e.target.value || null))
          }
          value={display}
        >
          <option value="">—</option>
          <option value="flex">Elastyczny (flex)</option>
          <option value="grid">Siatka (grid)</option>
          <option value="block">Blokowy</option>
        </select>
      </label>
      {display === 'flex' ? (
        <>
          <div className="flex flex-col gap-1 text-sm">
            <span className="text-xs font-medium text-muted">Kierunek</span>
            <DirectionToggle classes={classes} onChange={onChange} />
          </div>
          <WrapField classes={classes} onChange={onChange} />
        </>
      ) : null}
      {display === 'grid' ? (
        <ScaleField
          classes={classes}
          formatValue={(v) => `${v} kolumn`}
          label="Kolumny (grid)"
          onChange={onChange}
          prefix="grid-cols"
          values={GRID_COLUMNS}
        />
      ) : null}
      {canAlign ? (
        <>
          <SpacingField classes={classes} label="Odstęp (gap)" onChange={onChange} property="gap" />
          <div className="flex flex-col gap-1 text-sm">
            <span className="text-xs font-medium text-muted">Wyrównanie i rozmieszczenie</span>
            <AlignGrid classes={classes} onChange={onChange} />
          </div>
          <ScaleField classes={classes} label="Wyrównanie (items), w tym stretch" onChange={onChange} prefix="items" values={ALIGN_ITEMS} />
          <ScaleField
            classes={classes}
            label="Rozmieszczenie (justify), w tym between/around"
            onChange={onChange}
            prefix="justify"
            values={JUSTIFY_CONTENT}
          />
        </>
      ) : (
        <p className="text-xs text-muted">
          Wyrównanie i odstępy są dostępne dla wyświetlania elastycznego (flex) lub siatki (grid).
        </p>
      )}
    </div>
  )
}

const HEADING_LEVELS = [1, 2, 3, 4, 5, 6] as const

/** Heading-only: `a11y.headingLevel` (which `<hN>` renders) and bold/italic are whole-element style
 * toggles, not inline WYSIWYG formatting — a distinct concern from `text`'s rich-content editor, kept
 * out of the generic `registry.ts`-driven `ContentControl` loop because one writes to `a11y`, not `props`,
 * and the other toggles a `tw` class rather than a prop value. */
function HeadingControls({
  level,
  classes,
  onChangeLevel,
  onChangeClasses,
}: {
  level: number
  classes: string[]
  onChangeLevel: (level: number) => void
  onChangeClasses: (next: string[]) => void
}) {
  const isBold = Boolean(findClassMatching(classes, /^font-bold$/))
  const isItalic = Boolean(findClassMatching(classes, /^italic$/))

  return (
    <div className="flex flex-col gap-3 border-b border-line pb-3">
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-xs font-medium text-muted">Poziom nagłówka</span>
        <select
          className="rounded-md border border-line px-2 py-1.5 text-sm"
          onChange={(e) => onChangeLevel(Number(e.target.value))}
          value={level}
        >
          {HEADING_LEVELS.map((n) => (
            <option key={n} value={n}>
              H{n}
            </option>
          ))}
        </select>
      </label>
      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            checked={isBold}
            onChange={(e) => onChangeClasses(setClassMatching(classes, /^font-bold$/, e.target.checked ? 'font-bold' : null))}
            type="checkbox"
          />
          Pogrubienie
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            checked={isItalic}
            onChange={(e) => onChangeClasses(setClassMatching(classes, /^italic$/, e.target.checked ? 'italic' : null))}
            type="checkbox"
          />
          Kursywa
        </label>
      </div>
    </div>
  )
}

function StyleTab({
  classes,
  onChange,
  css,
  onChangeCss,
  onFocusHighlight,
  onBlurHighlight,
}: {
  classes: string[]
  onChange: (next: string[]) => void
  css: Record<string, string>
  onChangeCss: (patch: Record<string, string | null>) => void
  onFocusHighlight: () => void
  onBlurHighlight: (e: React.FocusEvent) => void
}) {
  return (
    <div className="flex flex-col gap-4">
      <ColorField classes={classes} label="Tło" onChange={onChange} prefix="bg" />
      <ColorField classes={classes} label="Kolor tekstu" onChange={onChange} prefix="text" />
      <ScaleField classes={classes} label="Cień" onChange={onChange} prefix="shadow" values={SHADOW_SCALE} />
      <div className="border-t border-line pt-3" onBlur={onBlurHighlight} onFocus={onFocusHighlight}>
        <p className="mb-2 text-xs font-medium text-muted">
          Margines, obramowanie, wypełnienie, wymiary — wartości własne, jak w devtoolsach.
        </p>
        <BoxModelEditor css={css} onChange={onChangeCss} />
      </div>
    </div>
  )
}

export function InspectorPanel() {
  const [tab, setTab] = useState<Tab>('content')
  const selectedId = useBuilderStore((state) => state.selectedId)
  const node = useBuilderStore((state) => (state.selectedId ? state.doc.nodes[state.selectedId] : null))
  const viewport = useBuilderStore((state) => state.viewport)
  const setProps = useBuilderStore((state) => state.setProps)
  const setTw = useBuilderStore((state) => state.setTw)
  const setCss = useBuilderStore((state) => state.setCss)
  const setA11y = useBuilderStore((state) => state.setA11y)
  const setHighlightNodeId = useBuilderStore((state) => state.setHighlightNodeId)

  if (!selectedId || !node) {
    return (
      <div className="p-4 text-sm text-muted">
        Kliknij element na kanwie lub w drzewku, aby zobaczyć jego ustawienia.
      </div>
    )
  }

  const definition = elementDefinition(node.type)
  const breakpoint = VIEWPORT_BREAKPOINT[viewport]
  const classes = node.tw[breakpoint] ?? []
  const setClasses = (next: string[]) => setTw(selectedId, breakpoint, next)
  const cssBucket = node.css?.[breakpoint] ?? {}
  const setCssBucket = (patch: Record<string, string | null>) => setCss(selectedId, breakpoint, patch)
  const highlightField = () => setHighlightNodeId(selectedId)
  const unhighlightField = (e: React.FocusEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setHighlightNodeId(null)
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 border-b border-line" role="tablist">
        {([
          ['content', 'Zawartość'],
          ['layout', 'Układ'],
          ['style', 'Styl'],
        ] as const).map(([key, label]) => (
          <button
            aria-selected={tab === key}
            className={[
              'flex-1 border-b-2 px-3 py-2 text-sm',
              tab === key
                ? 'border-[var(--bw-editor-accent)] text-[var(--bw-editor-accent)]'
                : 'border-transparent text-muted',
            ].join(' ')}
            key={key}
            onClick={() => setTab(key)}
            role="tab"
            type="button"
          >
            {label}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {tab === 'content' ? (
          <div className="flex flex-col gap-4">
            {node.type === 'heading' ? (
              <HeadingControls
                classes={classes}
                level={node.a11y?.headingLevel ?? 2}
                onChangeClasses={setClasses}
                onChangeLevel={(level) => setA11y(selectedId, { headingLevel: level as 1 | 2 | 3 | 4 | 5 | 6 })}
              />
            ) : null}
            {definition && definition.controls.length > 0 ? (
              definition.controls.map((control) => (
                <ContentControl
                  control={control}
                  key={`${selectedId}-${control.prop}`}
                  onChange={(patch) => setProps(selectedId, patch)}
                  props={node.props}
                />
              ))
            ) : (
              <p className="text-sm text-muted">Ten element nie ma dodatkowych ustawień treści.</p>
            )}
          </div>
        ) : null}

        {tab === 'layout' ? (
          <>
            <p className="mb-3 text-xs text-muted">
              Edytujesz dla: {viewport === 'desktop' ? 'komputer' : viewport === 'tablet' ? 'tablet' : 'telefon'}
            </p>
            <LayoutTab classes={classes} onBlurHighlight={unhighlightField} onChange={setClasses} onFocusHighlight={highlightField} />
          </>
        ) : null}

        {tab === 'style' ? (
          <>
            <p className="mb-3 text-xs text-muted">
              Edytujesz dla: {viewport === 'desktop' ? 'komputer' : viewport === 'tablet' ? 'tablet' : 'telefon'}
            </p>
            <StyleTab
              classes={classes}
              css={cssBucket}
              key={selectedId}
              onBlurHighlight={unhighlightField}
              onChange={setClasses}
              onChangeCss={setCssBucket}
              onFocusHighlight={highlightField}
            />
          </>
        ) : null}
      </div>
    </div>
  )
}
