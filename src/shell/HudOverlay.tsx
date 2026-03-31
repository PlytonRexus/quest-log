import { useState, useEffect, useCallback } from 'react'
import { ContextPanel } from './ContextPanel'

export function HudOverlay() {
  const [panelVisible, setPanelVisible] = useState(true)

  const togglePanel = useCallback(() => {
    setPanelVisible((prev) => !prev)
  }, [])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement).isContentEditable) {
        return
      }
      if (e.key === 'h' || e.key === 'H') {
        e.preventDefault()
        togglePanel()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [togglePanel])

  if (!panelVisible) {
    return (
      <button
        onClick={togglePanel}
        className="fixed top-20 right-4 z-50 px-2 py-1 text-xs rounded bg-surface/80 text-star/60 hover:text-star backdrop-blur-sm border border-border/50"
        aria-label="Show context panel"
        title="Show panel (H)"
      >
        Show HUD
      </button>
    )
  }

  return (
    <div
      className="fixed inset-0 pointer-events-none z-40"
      data-testid="hud-overlay"
    >
      {/* Right panel: context */}
      <div
        className="absolute right-4 top-20 bottom-16 w-64 pointer-events-auto rounded-lg overflow-auto"
        style={{
          backdropFilter: 'blur(12px)',
          background: 'rgba(0,0,0,0.6)',
        }}
        data-testid="hud-right-panel"
      >
        <div className="p-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-accent uppercase tracking-wide">
              Details
            </h3>
            <button
              onClick={togglePanel}
              className="text-star/40 hover:text-star text-xs"
              aria-label="Hide context panel"
              title="Hide panel (H)"
            >
              Hide
            </button>
          </div>
          <ContextPanel />
        </div>
      </div>
    </div>
  )
}
