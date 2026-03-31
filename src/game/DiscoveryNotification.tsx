// Toast notification displayed when new tropes are revealed

import { useEffect } from 'react'
import type { Trope } from '../types'
import { TROPE_CATEGORY_HEX } from '../viz/graphMapper'

interface Props {
  revealedTropes: Trope[]
  onDismiss: () => void
  onFlyTo?: (tropeId: number) => void
}

export function DiscoveryNotification({ revealedTropes, onDismiss, onFlyTo }: Props) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 5000)
    return () => clearTimeout(timer)
  }, [onDismiss])

  if (revealedTropes.length === 0) return null

  return (
    <div
      className="fixed bottom-4 right-4 z-50 max-w-sm bg-surface/95 border border-border rounded-lg p-4 shadow-lg"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-sm font-semibold text-accent">New Constellations Revealed</h3>
        <button
          onClick={onDismiss}
          className="text-star/40 hover:text-star/70 text-xs ml-2"
          aria-label="Dismiss notification"
        >
          x
        </button>
      </div>
      <ul className="space-y-1">
        {revealedTropes.map((trope) => (
          <li key={trope.id} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full inline-block"
                style={{ backgroundColor: TROPE_CATEGORY_HEX[trope.category] ?? '#888' }}
              />
              <span className="text-star/80">{trope.name}</span>
            </span>
            {onFlyTo && (
              <button
                onClick={() => onFlyTo(trope.id)}
                className="text-xs text-accent/70 hover:text-accent ml-2"
              >
                Fly to
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
