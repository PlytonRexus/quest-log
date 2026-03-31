import { useState, useEffect, useCallback } from 'react'
import { ContextPanel } from './ContextPanel'
import { VIEW_DEFS, type ViewId } from './ViewRouter'

interface HudOverlayProps {
  activeView: ViewId
  onViewChange: (view: ViewId) => void
}

export function HudOverlay({ activeView, onViewChange }: HudOverlayProps) {
  const [panelsVisible, setPanelsVisible] = useState(true)

  const togglePanels = useCallback(() => {
    setPanelsVisible((prev) => !prev)
  }, [])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement).isContentEditable) {
        return
      }
      if (e.key === 'h' || e.key === 'H') {
        e.preventDefault()
        togglePanels()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [togglePanels])

  if (!panelsVisible) {
    return (
      <button
        onClick={togglePanels}
        className="fixed top-20 right-4 z-50 px-2 py-1 text-xs rounded bg-surface/80 text-star/60 hover:text-star backdrop-blur-sm border border-border/50"
        aria-label="Show HUD panels"
        title="Show panels (H)"
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
      {/* Left panel: mini nav */}
      <div
        className="absolute left-4 top-20 bottom-16 w-48 pointer-events-auto rounded-lg overflow-hidden"
        style={{
          backdropFilter: 'blur(12px)',
          background: 'rgba(0,0,0,0.6)',
        }}
        data-testid="hud-left-panel"
      >
        <div className="p-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-accent uppercase tracking-wide">
              Navigation
            </h3>
            <button
              onClick={togglePanels}
              className="text-star/40 hover:text-star text-xs"
              aria-label="Hide HUD panels"
              title="Hide panels (H)"
            >
              Hide
            </button>
          </div>
          <nav className="space-y-1">
            {VIEW_DEFS.map((def) => (
              <button
                key={def.id}
                onClick={() => onViewChange(def.id)}
                className={`w-full text-left px-2 py-1.5 text-sm rounded transition-colors ${
                  activeView === def.id
                    ? 'bg-accent/20 text-accent'
                    : 'text-star/60 hover:bg-surface-bright/50 hover:text-star/80'
                }`}
              >
                <span className="mr-2">{def.icon}</span>
                {def.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

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
          <ContextPanel />
        </div>
      </div>
    </div>
  )
}
