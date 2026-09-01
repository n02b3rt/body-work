'use client'

import { useBuilderStore, VIEWPORT_WIDTH, type ViewportKey } from './store'

const OPTIONS: { key: ViewportKey; label: string; icon: string }[] = [
  { key: 'desktop', label: 'Komputer', icon: '🖥' },
  { key: 'tablet', label: 'Tablet', icon: '📱' },
  { key: 'mobile', label: 'Telefon', icon: '📱' },
]

export function ViewportSwitch() {
  const viewport = useBuilderStore((state) => state.viewport)
  const setViewport = useBuilderStore((state) => state.setViewport)

  return (
    <div className="flex items-center gap-1 rounded-md border border-line bg-page p-1" role="group" aria-label="Podgląd na ekranie">
      {OPTIONS.map((option) => (
        <button
          aria-pressed={viewport === option.key}
          className={[
            'rounded px-3 py-1 text-sm',
            viewport === option.key
              ? 'bg-[var(--bw-editor-accent)] text-white'
              : 'text-muted hover:bg-surface-alt',
          ].join(' ')}
          key={option.key}
          onClick={() => setViewport(option.key)}
          title={`${option.label} (${VIEWPORT_WIDTH[option.key]}px)`}
          type="button"
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
