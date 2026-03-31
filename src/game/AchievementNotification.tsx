// Golden toast notification for earned achievements

import { useEffect } from 'react'
import type { Achievement } from './achievements'

interface Props {
  achievement: Achievement
  onDismiss: () => void
}

export function AchievementNotification({ achievement, onDismiss }: Props) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 6000)
    return () => clearTimeout(timer)
  }, [onDismiss])

  return (
    <div
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-surface/95 border border-yellow-500/60 rounded-lg px-6 py-4 shadow-lg max-w-sm"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-yellow-500 font-semibold uppercase tracking-wider mb-1">
            Achievement Unlocked
          </p>
          <h3 className="text-lg font-bold text-yellow-400">{achievement.name}</h3>
          <p className="text-sm text-star/70 mt-1">{achievement.description}</p>
        </div>
        <button
          onClick={onDismiss}
          className="text-star/40 hover:text-star/70 text-xs ml-4"
          aria-label="Dismiss achievement"
        >
          x
        </button>
      </div>
    </div>
  )
}
