'use client'

import { useEffect, useRef, useState } from 'react'

import { ICON_NAMES } from '@/components/builder/render/elements/Icon'
import { MediaPicker } from '@/components/builder/media/MediaPicker'
import type { InspectorControl } from '@/lib/builder/elements/registry'

type Props = {
  control: InspectorControl
  props: Record<string, unknown>
  onChange: (patch: Record<string, unknown>) => void
}

function LabelWrap({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-xs font-medium text-muted">{label}</span>
      {children}
    </label>
  )
}

const inputClass = 'rounded-md border border-line px-2 py-1.5 text-sm'

/** `document.execCommand('bold'/'italic')` produces `<b>`/`<i>` (Chromium) or inline `style=` spans; neither
 * is in `sanitize-html.ts`'s allowlist, so the server would silently strip formatting the editor just
 * applied. Normalised client-side only for a WYSIWYG preview that doesn't lie about what survives save —
 * the server sanitiser is still the actual security gate, this is just so the two agree. */
function normalizeInlineHtml(html: string): string {
  return html
    .replace(/<b(\s[^>]*)?>/gi, '<strong>')
    .replace(/<\/b>/gi, '</strong>')
    .replace(/<i(\s[^>]*)?>/gi, '<em>')
    .replace(/<\/i>/gi, '</em>')
    .replace(/<div>/gi, '<p>')
    .replace(/<\/div>/gi, '</p>')
}

/**
 * Two views of the same HTML string: "Podgląd" is a `contentEditable` WYSIWYG with a bold/italic/link
 * toolbar (Elementor's own split), "Kod" is the raw-markup textarea this control used to be exclusively.
 *
 * The `contentEditable` div is deliberately uncontrolled: `dangerouslySetInnerHTML` is only ever set once,
 * from the `key`-driven remount `InspectorPanel` does per node+control (not on every keystroke) — feeding
 * `value` back in on each render would fight the browser's own cursor position mid-edit. `onChange` only
 * fires on blur and on toolbar clicks, never on plain typing, for the same reason.
 */
function RichTextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (html: string) => void
  placeholder?: string
}) {
  const [mode, setMode] = useState<'preview' | 'code'>('preview')
  const editableRef = useRef<HTMLDivElement>(null)

  // Resyncs the uncontrolled div from a genuinely external change (switching to a different
  // node's control that happens to share this one's React key) — skipped while the user is
  // actively focused in it, so their own edit never gets clobbered mid-keystroke.
  useEffect(() => {
    if (editableRef.current && document.activeElement !== editableRef.current && editableRef.current.innerHTML !== value) {
      editableRef.current.innerHTML = value
    }
  }, [value])

  const exec = (command: string, arg?: string) => {
    editableRef.current?.focus()
    document.execCommand(command, false, arg)
    if (editableRef.current) onChange(normalizeInlineHtml(editableRef.current.innerHTML))
  }

  const handleLink = () => {
    const url = window.prompt('Adres odnośnika (https:// lub /strona):', 'https://')
    if (url) exec('createLink', url)
  }

  const toolbarButtonClass = 'rounded px-2 py-1 text-xs leading-none text-text-heading hover:bg-surface'

  return (
    <div className="flex flex-col gap-1 text-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted">{label}</span>
        <div className="flex overflow-hidden rounded-md border border-line text-[11px]">
          <button
            className={`px-2 py-0.5 ${mode === 'preview' ? 'bg-[var(--bw-editor-accent)] text-white' : 'text-muted'}`}
            onClick={() => setMode('preview')}
            type="button"
          >
            Podgląd
          </button>
          <button
            className={`px-2 py-0.5 ${mode === 'code' ? 'bg-[var(--bw-editor-accent)] text-white' : 'text-muted'}`}
            onClick={() => setMode('code')}
            type="button"
          >
            Kod
          </button>
        </div>
      </div>
      {mode === 'preview' ? (
        <>
          <div className="flex gap-0.5 rounded-t-md border border-b-0 border-line bg-surface-alt p-1">
            <button className={`${toolbarButtonClass} font-bold`} onMouseDown={(e) => e.preventDefault()} onClick={() => exec('bold')} title="Pogrubienie" type="button">
              B
            </button>
            <button className={`${toolbarButtonClass} italic`} onMouseDown={(e) => e.preventDefault()} onClick={() => exec('italic')} title="Kursywa" type="button">
              i
            </button>
            <button className={toolbarButtonClass} onMouseDown={(e) => e.preventDefault()} onClick={handleLink} title="Odnośnik" type="button">
              Link
            </button>
          </div>
          <div
            className={`${inputClass} min-h-20 rounded-t-none`}
            contentEditable
            dangerouslySetInnerHTML={{ __html: value }}
            onBlur={(e) => onChange(normalizeInlineHtml(e.currentTarget.innerHTML))}
            ref={editableRef}
            suppressContentEditableWarning
          />
        </>
      ) : (
        <textarea
          className={`${inputClass} min-h-20 font-mono text-xs`}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          value={value}
        />
      )}
      <span className="text-[11px] text-muted">
        Dozwolone znaczniki: strong, em, a, br, ul, ol, li, p — reszta jest usuwana przy zapisie.
      </span>
    </div>
  )
}

export function ContentControl({ control, props, onChange }: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);

  switch (control.kind) {
    case 'text':
      return (
        <LabelWrap label={control.label}>
          <input
            className={inputClass}
            onChange={(e) => onChange({ [control.prop]: e.target.value })}
            placeholder={control.placeholder}
            type="text"
            value={typeof props[control.prop] === 'string' ? (props[control.prop] as string) : ''}
          />
        </LabelWrap>
      )

    case 'richText':
      return (
        <RichTextField
          label={control.label}
          onChange={(html) => onChange({ [control.prop]: html })}
          placeholder={control.placeholder}
          value={typeof props[control.prop] === 'string' ? (props[control.prop] as string) : ''}
        />
      )

    case 'link':
      return (
        <LabelWrap label={control.label}>
          <input
            className={inputClass}
            onChange={(e) => onChange({ [control.prop]: e.target.value })}
            placeholder="https:// lub /strona"
            type="text"
            value={typeof props[control.prop] === 'string' ? (props[control.prop] as string) : ''}
          />
        </LabelWrap>
      )

    case 'number':
      return (
        <LabelWrap label={control.label}>
          <input
            className={inputClass}
            max={control.max}
            min={control.min}
            onChange={(e) => onChange({ [control.prop]: e.target.value === '' ? null : Number(e.target.value) })}
            type="number"
            value={typeof props[control.prop] === 'number' ? props[control.prop] as number : ''}
          />
        </LabelWrap>
      )

    case 'checkbox':
      return (
        <label className="flex items-center gap-2 text-sm">
          <input
            checked={Boolean(props[control.prop])}
            onChange={(e) => onChange({ [control.prop]: e.target.checked })}
            type="checkbox"
          />
          {control.label}
        </label>
      )

    case 'select':
      return (
        <LabelWrap label={control.label}>
          <select
            className={inputClass}
            onChange={(e) => onChange({ [control.prop]: e.target.value })}
            value={typeof props[control.prop] === 'string' ? (props[control.prop] as string) : ''}
          >
            {control.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </LabelWrap>
      )

    case 'icon':
      return (
        <LabelWrap label={control.label}>
          <select
            className={inputClass}
            onChange={(e) => onChange({ [control.prop]: e.target.value })}
            value={typeof props[control.prop] === 'string' ? (props[control.prop] as string) : 'check'}
          >
            {ICON_NAMES.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </LabelWrap>
      )

    case 'media': {
      const currentId = typeof props[control.prop] === 'number' ? (props[control.prop] as number) : null
      return (
        <div className="flex flex-col gap-1 text-sm">
          <span className="text-xs font-medium text-muted">{control.label}</span>
          <button
            className="rounded-md border border-dashed border-line px-3 py-2 text-left text-sm hover:border-[var(--bw-editor-accent)]"
            onClick={() => setPickerOpen(true)}
            type="button"
          >
            {currentId ? `Wybrano: #${currentId} (zmień)` : 'Wybierz z biblioteki…'}
          </button>
          {pickerOpen ? (
            <MediaPicker
              accept={control.accept}
              onClose={() => setPickerOpen(false)}
              onSelect={(id) => onChange({ [control.prop]: id })}
            />
          ) : null}
        </div>
      )
    }

    case 'repeater': {
      const items = Array.isArray(props[control.prop]) ? (props[control.prop] as Record<string, unknown>[]) : []
      const setItems = (next: Record<string, unknown>[]) => onChange({ [control.prop]: next })

      return (
        <div className="flex flex-col gap-3 text-sm">
          <span className="text-xs font-medium text-muted">{control.label}</span>
          {items.map((item, index) => (
            <div className="flex flex-col gap-2 rounded-md border border-line p-2" key={index}>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted">
                  {control.itemLabel} {index + 1}
                </span>
                <button
                  className="text-xs text-error"
                  onClick={() => setItems(items.filter((_, i) => i !== index))}
                  type="button"
                >
                  Usuń
                </button>
              </div>
              {control.fields.map((field) => (
                <ContentControl
                  control={field}
                  key={field.prop}
                  onChange={(patch) => {
                    const next = [...items]
                    next[index] = { ...item, ...patch }
                    setItems(next)
                  }}
                  props={item}
                />
              ))}
            </div>
          ))}
          <button
            className="self-start rounded-md border border-line px-3 py-1.5 text-xs hover:border-[var(--bw-editor-accent)]"
            onClick={() => setItems([...items, {}])}
            type="button"
          >
            + Dodaj
          </button>
        </div>
      )
    }

    default:
      return null
  }
}
