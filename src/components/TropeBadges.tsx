import { CATEGORY_COLORS, CATEGORY_LABELS, type TropeCategory } from '../ai/tropeDict'
import type { Trope } from '../types'

interface Props {
  tropes: (Trope & { confidence: number })[]
  showConfidence?: boolean
  onTropeClick?: (tropeId: number) => void
}

export function TropeBadges({ tropes, showConfidence = true, onTropeClick }: Props) {
  if (tropes.length === 0) {
    return <span className="text-star/30 text-xs">No tropes detected</span>
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {tropes.map((trope) => {
        const colors = CATEGORY_COLORS[trope.category as TropeCategory] ?? 'bg-surface text-star/60 border-border'
        const label = CATEGORY_LABELS[trope.category as TropeCategory] ?? trope.category

        return (
          <button
            key={trope.id}
            onClick={() => onTropeClick?.(trope.id)}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-opacity hover:opacity-80 ${colors}`}
            title={`${label}: ${trope.name} (${Math.round(trope.confidence * 100)}% confidence)`}
          >
            <span>{trope.name}</span>
            {showConfidence && (
              <span className="opacity-60">{Math.round(trope.confidence * 100)}%</span>
            )}
          </button>
        )
      })}
    </div>
  )
}
