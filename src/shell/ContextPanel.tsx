import { useState, useEffect } from 'react'
import { useFocus } from './FocusContext'
import {
  getWorkById,
  getDimensionScoresForWork,
  getTropesForWork,
  getOverallStats,
  getTropes,
} from '../db/dal'
import type { Work, Trope, DimensionScore } from '../types'

interface WorkDetail {
  work: Work
  scores: (DimensionScore & { dimensionName?: string })[]
  tropes: Trope[]
}

interface TropeDetail {
  trope: Trope
  linkedWorks: Work[]
}

export function ContextPanel() {
  const { focus } = useFocus()
  const [workDetail, setWorkDetail] = useState<WorkDetail | null>(null)
  const [tropeDetail, setTropeDetail] = useState<TropeDetail | null>(null)
  const [overview, setOverview] = useState<{
    totalWorks: number
    totalTropes: number
    avgScore: number
  } | null>(null)

  useEffect(() => {
    if (!focus) {
      // Load dashboard overview
      getOverallStats().then(setOverview).catch(() => {})
      setWorkDetail(null)
      setTropeDetail(null)
      return
    }

    if (focus.type === 'work') {
      loadWork(focus.entityId)
      setTropeDetail(null)
    } else if (focus.type === 'trope') {
      loadTrope(focus.entityId)
      setWorkDetail(null)
    }
  }, [focus])

  async function loadWork(workId: number) {
    try {
      const work = await getWorkById(workId)
      if (!work) return
      const [scores, tropes] = await Promise.all([
        getDimensionScoresForWork(workId),
        getTropesForWork(workId),
      ])
      setWorkDetail({ work, scores, tropes })
    } catch {
      // Non-critical
    }
  }

  async function loadTrope(tropeId: number) {
    try {
      const allTropes = await getTropes()
      const trope = allTropes.find((t) => t.id === tropeId)
      if (!trope) return
      // For now show a simplified view; full work lookup would query workTropes
      setTropeDetail({ trope, linkedWorks: [] })
    } catch {
      // Non-critical
    }
  }

  // Dashboard overview: no focus
  if (!focus) {
    return (
      <div data-testid="context-dashboard">
        <h3 className="text-sm font-semibold text-accent mb-3">Dashboard</h3>
        {overview && (
          <div className="space-y-2 text-sm">
            <p className="text-star/70">
              <span className="text-star/50">Total Works:</span>{' '}
              <strong className="text-star">{overview.totalWorks}</strong>
            </p>
            <p className="text-star/70">
              <span className="text-star/50">Total Tropes:</span>{' '}
              <strong className="text-star">{overview.totalTropes}</strong>
            </p>
            <p className="text-star/70">
              <span className="text-star/50">Avg Score:</span>{' '}
              <strong className="text-ember">{overview.avgScore.toFixed(1)}</strong>
            </p>
          </div>
        )}
      </div>
    )
  }

  // Work detail view
  if (focus.type === 'work' && workDetail) {
    return (
      <div data-testid="context-work">
        <h3 className="text-sm font-semibold text-accent mb-2">{workDetail.work.title}</h3>
        <p className="text-xs text-star/50 mb-3">
          {workDetail.work.medium}
          {workDetail.work.year ? ` (${workDetail.work.year})` : ''}
        </p>
        {workDetail.work.primaryScore !== null && (
          <p className="text-sm text-star/70 mb-2">
            Score: <strong className="text-ember">{workDetail.work.primaryScore}</strong>
          </p>
        )}
        {workDetail.tropes.length > 0 && (
          <div className="mt-3">
            <p className="text-xs text-star/40 mb-1">Tropes</p>
            <div className="flex flex-wrap gap-1">
              {workDetail.tropes.map((t) => (
                <span
                  key={t.id}
                  className="text-xs px-2 py-0.5 rounded-full bg-nebula/30 text-star/80"
                >
                  {t.name}
                </span>
              ))}
            </div>
          </div>
        )}
        {workDetail.scores.length > 0 && (
          <div className="mt-3">
            <p className="text-xs text-star/40 mb-1">Dimension Scores</p>
            <div className="space-y-1">
              {workDetail.scores.slice(0, 8).map((s) => (
                <div key={s.id} className="flex justify-between text-xs">
                  <span className="text-star/60 truncate mr-2">
                    {s.dimensionName ?? `Dim ${s.dimensionId}`}
                  </span>
                  <span className="text-ember">{s.score.toFixed(1)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Trope detail view
  if (focus.type === 'trope' && tropeDetail) {
    return (
      <div data-testid="context-trope">
        <h3 className="text-sm font-semibold text-accent mb-2">{tropeDetail.trope.name}</h3>
        <p className="text-xs text-star/50 mb-2">{tropeDetail.trope.category}</p>
        {tropeDetail.trope.description && (
          <p className="text-xs text-star/70 mb-3">{tropeDetail.trope.description}</p>
        )}
      </div>
    )
  }

  // Loading state
  return (
    <div className="text-star/50 text-sm">Loading...</div>
  )
}
