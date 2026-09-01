'use client'

import { useState } from 'react'

/**
 * The escape-hatch `node.css` bucket for margin/border/padding/dimensions,
 * shown two ways at once, per feedback: a row of labelled, unit-aware inputs
 * ("precise" controls, Elementor's own pattern) above a devtools-style nested
 * box diagram (margin -> border -> padding -> content) that shows bare
 * numbers only, no unit clutter — the diagram is for spatial intuition, the
 * row above it is for typing an exact value. Both edit the same `css` keys
 * and stay in sync automatically since neither owns its own copy of the data.
 *
 * Each of margin / border-width / padding / corner-radius gets its own
 * link/unlink toggle (`LinkToggle`): linked (the default on every fresh
 * selection, see `key={selectedId}` on `StyleTab`) writes one typed number to
 * all four fields at once; unlinked edits each independently. Both the
 * precise row and the diagram's edge inputs for a group honour the same
 * toggle, so switching panes never desyncs which fields are tied together.
 */

const UNITS = ['px', '%', 'rem', 'em', 'vh', 'vw'] as const
type Unit = (typeof UNITS)[number]

type CssBucket = Record<string, string>

function splitValue(value: string | undefined): { amount: string; unit: Unit } {
  if (!value) return { amount: '', unit: 'px' }
  const match = /^(-?\d+(?:\.\d+)?)(px|%|rem|em|vh|vw)$/.exec(value.trim())
  if (!match) return { amount: '', unit: 'px' }
  return { amount: match[1], unit: match[2] as Unit }
}

function UnitSelect({ value, onChange, className }: { value: Unit; onChange: (unit: Unit) => void; className?: string }) {
  return (
    <select
      className={`rounded border border-transparent bg-transparent text-[8px] text-muted hover:border-line focus:outline-none ${className ?? ''}`}
      onChange={(e) => onChange(e.target.value as Unit)}
      value={value}
    >
      {UNITS.map((unit) => (
        <option key={unit} value={unit}>
          {unit}
        </option>
      ))}
    </select>
  )
}

function LinkToggle({ linked, onToggle, title }: { linked: boolean; onToggle: () => void; title: string }) {
  return (
    <button
      aria-label={title}
      aria-pressed={linked}
      className={`rounded border px-1 text-[9px] font-semibold leading-tight ${
        linked
          ? 'border-[var(--bw-editor-accent)] bg-[var(--bw-editor-accent)] text-white'
          : 'border-line text-muted hover:border-[var(--bw-editor-accent)]'
      }`}
      onClick={onToggle}
      title={title}
      type="button"
    >
      {linked ? '1×' : '4×'}
    </button>
  )
}

function EdgeInput({
  value,
  onChange,
  position,
  title,
}: {
  value: string
  onChange: (amount: string) => void
  position: string
  title: string
}) {
  return (
    <input
      className={`absolute w-7 rounded border border-transparent bg-white/80 px-0.5 py-px text-center text-[10px] leading-tight text-text-heading hover:border-line focus:border-[var(--bw-editor-accent)] focus:bg-white focus:outline-none ${position}`}
      onChange={(e) => onChange(e.target.value)}
      placeholder="0"
      title={title}
      type="number"
      value={value}
    />
  )
}

type RingKeys = { top: string; right: string; bottom: string; left: string }

function BoxRing({
  label,
  ringClass,
  keys,
  css,
  linked,
  onChange,
  children,
}: {
  label: string
  ringClass: string
  keys: RingKeys
  css: CssBucket
  linked: boolean
  onChange: (patch: Record<string, string | null>) => void
  children: React.ReactNode
}) {
  const sides = (['top', 'right', 'bottom', 'left'] as const).map((side) => ({
    side,
    key: keys[side],
    ...splitValue(css[keys[side]]),
  }))
  const activeUnit = sides.find((s) => s.amount !== '')?.unit ?? 'px'

  const setAmount = (side: 'top' | 'right' | 'bottom' | 'left', amount: string) => {
    if (linked) {
      const patch: Record<string, string | null> = {}
      for (const s of sides) patch[s.key] = amount === '' ? null : `${amount}${activeUnit}`
      onChange(patch)
      return
    }
    onChange({ [keys[side]]: amount === '' ? null : `${amount}${activeUnit}` })
  }

  const [top, right, bottom, left] = sides

  return (
    <div className="flex w-full flex-col gap-0.5">
      <span className="px-0.5 text-[8px] font-semibold uppercase tracking-wide text-muted">{label}</span>
      <div className={`relative w-full rounded-md border border-dashed p-4 ${ringClass}`}>
        <EdgeInput onChange={(v) => setAmount('top', v)} position="left-1/2 top-0.5 -translate-x-1/2" title={`${label}: góra`} value={top.amount} />
        <EdgeInput onChange={(v) => setAmount('right', v)} position="right-0.5 top-1/2 -translate-y-1/2" title={`${label}: prawo`} value={right.amount} />
        <EdgeInput onChange={(v) => setAmount('bottom', v)} position="bottom-0.5 left-1/2 -translate-x-1/2" title={`${label}: dół`} value={bottom.amount} />
        <EdgeInput onChange={(v) => setAmount('left', v)} position="left-0.5 top-1/2 -translate-y-1/2" title={`${label}: lewo`} value={left.amount} />
        {children}
      </div>
    </div>
  )
}

type QuadField = { key: string; short: string; title: string }

function PrecisionQuad({
  label,
  fields,
  css,
  linked,
  onToggleLinked,
  onChange,
}: {
  label: string
  fields: readonly [QuadField, QuadField, QuadField, QuadField]
  css: CssBucket
  linked: boolean
  onToggleLinked: () => void
  onChange: (patch: Record<string, string | null>) => void
}) {
  const values = fields.map((f) => ({ ...f, ...splitValue(css[f.key]) }))
  const activeUnit = values.find((v) => v.amount !== '')?.unit ?? 'px'

  const setAmount = (key: string, amount: string) => {
    if (linked) {
      const patch: Record<string, string | null> = {}
      for (const f of fields) patch[f.key] = amount === '' ? null : `${amount}${activeUnit}`
      onChange(patch)
      return
    }
    onChange({ [key]: amount === '' ? null : `${amount}${activeUnit}` })
  }

  const setUnit = (unit: Unit) => {
    const patch: Record<string, string | null> = {}
    for (const v of values) if (v.amount !== '') patch[v.key] = `${v.amount}${unit}`
    if (Object.keys(patch).length > 0) onChange(patch)
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted">{label}</span>
        <div className="flex items-center gap-1">
          <LinkToggle
            linked={linked}
            onToggle={onToggleLinked}
            title={linked ? 'Rozepnij: edytuj każdą wartość osobno' : 'Spepnij: ustawiaj wszystkie razem'}
          />
          <UnitSelect className="bg-page" onChange={setUnit} value={activeUnit} />
        </div>
      </div>
      <div className="grid grid-cols-4 gap-1">
        {values.map((v) => (
          <label className="flex flex-col items-center gap-0.5" key={v.key}>
            <span className="text-[8px] text-muted">{v.short}</span>
            <input
              className="w-full rounded border border-line px-1 py-0.5 text-center text-[10px]"
              onChange={(e) => setAmount(v.key, e.target.value)}
              title={v.title}
              type="number"
              value={v.amount}
            />
          </label>
        ))}
      </div>
    </div>
  )
}

function sideFields(keys: RingKeys): [QuadField, QuadField, QuadField, QuadField] {
  return [
    { key: keys.top, short: 'G', title: `${keys.top}: góra` },
    { key: keys.right, short: 'P', title: `${keys.right}: prawo` },
    { key: keys.bottom, short: 'D', title: `${keys.bottom}: dół` },
    { key: keys.left, short: 'L', title: `${keys.left}: lewo` },
  ]
}

const RADIUS_FIELDS: [QuadField, QuadField, QuadField, QuadField] = [
  { key: 'borderTopLeftRadius', short: '◤', title: 'Róg górny-lewy' },
  { key: 'borderTopRightRadius', short: '◥', title: 'Róg górny-prawy' },
  { key: 'borderBottomRightRadius', short: '◢', title: 'Róg dolny-prawy' },
  { key: 'borderBottomLeftRadius', short: '◣', title: 'Róg dolny-lewy' },
]

function DimensionField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string | undefined
  onChange: (next: string | null) => void
}) {
  const { amount, unit } = splitValue(value)
  return (
    <label className="flex flex-col items-center gap-0.5">
      <span className="text-[8px] text-muted">{label}</span>
      <div className="flex items-center gap-0.5">
        <input
          className="w-10 rounded border border-line px-1 py-0.5 text-center text-[10px]"
          onChange={(e) => onChange(e.target.value === '' ? null : `${e.target.value}${unit}`)}
          placeholder="auto"
          type="number"
          value={amount}
        />
        <UnitSelect
          className="bg-page"
          onChange={(nextUnit) => {
            if (amount !== '') onChange(`${amount}${nextUnit}`)
          }}
          value={unit}
        />
      </div>
    </label>
  )
}

const BORDER_STYLE_OPTIONS = [
  { value: 'solid', label: 'Ciągła' },
  { value: 'dashed', label: 'Kreskowana' },
  { value: 'dotted', label: 'Kropkowana' },
  { value: 'none', label: 'Brak' },
] as const

const MARGIN_KEYS: RingKeys = { top: 'marginTop', right: 'marginRight', bottom: 'marginBottom', left: 'marginLeft' }
const BORDER_WIDTH_KEYS: RingKeys = {
  top: 'borderTopWidth',
  right: 'borderRightWidth',
  bottom: 'borderBottomWidth',
  left: 'borderLeftWidth',
}
const PADDING_KEYS: RingKeys = { top: 'paddingTop', right: 'paddingRight', bottom: 'paddingBottom', left: 'paddingLeft' }

export function BoxModelEditor({
  css,
  onChange,
}: {
  css: CssBucket
  onChange: (patch: Record<string, string | null>) => void
}) {
  const [marginLinked, setMarginLinked] = useState(true)
  const [borderWidthLinked, setBorderWidthLinked] = useState(true)
  const [paddingLinked, setPaddingLinked] = useState(true)
  const [radiusLinked, setRadiusLinked] = useState(true)

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-xs font-medium text-muted">Styl obramowania</span>
          <select
            className="rounded-md border border-line px-2 py-1.5 text-sm"
            onChange={(e) => onChange({ borderStyle: e.target.value === 'solid' ? null : e.target.value })}
            value={css.borderStyle ?? 'solid'}
          >
            {BORDER_STYLE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-xs font-medium text-muted">Kolor obramowania</span>
          <div className="flex items-center gap-1.5">
            <input
              className="h-8 w-8 shrink-0 rounded border border-line"
              onChange={(e) => onChange({ borderColor: e.target.value })}
              type="color"
              value={/^#[0-9a-f]{6}$/i.test(css.borderColor ?? '') ? (css.borderColor as string) : '#000000'}
            />
            <input
              className="min-w-0 flex-1 rounded-md border border-line px-2 py-1.5 text-sm"
              onChange={(e) => onChange({ borderColor: e.target.value || null })}
              placeholder="#000000"
              type="text"
              value={css.borderColor ?? ''}
            />
          </div>
        </label>
      </div>

      <div className="flex flex-col gap-2.5 border-t border-line pt-3">
        <PrecisionQuad
          css={css}
          fields={sideFields(MARGIN_KEYS)}
          label="Margines"
          linked={marginLinked}
          onChange={onChange}
          onToggleLinked={() => setMarginLinked((v) => !v)}
        />
        <PrecisionQuad
          css={css}
          fields={sideFields(BORDER_WIDTH_KEYS)}
          label="Grubość obramowania"
          linked={borderWidthLinked}
          onChange={onChange}
          onToggleLinked={() => setBorderWidthLinked((v) => !v)}
        />
        <PrecisionQuad
          css={css}
          fields={sideFields(PADDING_KEYS)}
          label="Wypełnienie"
          linked={paddingLinked}
          onChange={onChange}
          onToggleLinked={() => setPaddingLinked((v) => !v)}
        />
        <PrecisionQuad
          css={css}
          fields={RADIUS_FIELDS}
          label="Zaokrąglenie rogów"
          linked={radiusLinked}
          onChange={onChange}
          onToggleLinked={() => setRadiusLinked((v) => !v)}
        />
      </div>

      <BoxRing css={css} keys={MARGIN_KEYS} label="Margines" linked={marginLinked} onChange={onChange} ringClass="border-amber-300 bg-amber-50">
        <BoxRing
          css={css}
          keys={BORDER_WIDTH_KEYS}
          label="Obramowanie"
          linked={borderWidthLinked}
          onChange={onChange}
          ringClass="border-violet-300 bg-violet-50"
        >
          <BoxRing
            css={css}
            keys={PADDING_KEYS}
            label="Wypełnienie"
            linked={paddingLinked}
            onChange={onChange}
            ringClass="border-emerald-300 bg-emerald-50"
          >
            <div className="flex w-full flex-col items-center gap-1 rounded border border-line bg-page py-2.5">
              <span className="text-[8px] font-semibold uppercase tracking-wide text-muted">Wymiary</span>
              <div className="flex items-end gap-1.5">
                <DimensionField label="szer." onChange={(v) => onChange({ width: v })} value={css.width} />
                <span className="pb-1 text-[10px] text-muted">×</span>
                <DimensionField label="wys." onChange={(v) => onChange({ height: v })} value={css.height} />
              </div>
            </div>
          </BoxRing>
        </BoxRing>
      </BoxRing>
    </div>
  )
}
