import { useState, useMemo } from 'react'
import type { Work, DimensionScore, Trope } from '../types'

type SortKey = 'title' | 'medium' | 'primaryScore' | 'comfortScore' | 'consumptionMode'
type SortDir = 'asc' | 'desc'

interface Props {
  works: Work[]
  onWorkSelect?: (workId: number) => void
  getTropesForWork: (workId: number) => Promise<(Trope & { confidence: number })[]>
  getDimensionScoresForWork: (workId: number) => Promise<DimensionScore[]>
}

export function DebugTable({ works, onWorkSelect, getTropesForWork, getDimensionScoresForWork }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('primaryScore')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [filterMedium, setFilterMedium] = useState<string>('')
  const [expandedWorkId, setExpandedWorkId] = useState<number | null>(null)
  const [expandedData, setExpandedData] = useState<{
    scores: DimensionScore[]
    tropes: (Trope & { confidence: number })[]
  } | null>(null)

  const mediums = useMemo(() => {
    const set = new Set(works.map((w) => w.medium))
    return [...set].sort()
  }, [works])

  const sortedWorks = useMemo(() => {
    let filtered = works
    if (filterMedium) {
      filtered = works.filter((w) => w.medium === filterMedium)
    }

    return [...filtered].sort((a, b) => {
      const aVal = a[sortKey] ?? 0
      const bVal = b[sortKey] ?? 0
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1
      return 0
    })
  }, [works, sortKey, sortDir, filterMedium])

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  async function handleRowClick(workId: number) {
    if (expandedWorkId === workId) {
      setExpandedWorkId(null)
      setExpandedData(null)
      return
    }

    setExpandedWorkId(workId)
    const [scores, tropes] = await Promise.all([
      getDimensionScoresForWork(workId),
      getTropesForWork(workId),
    ])
    setExpandedData({ scores, tropes })
    onWorkSelect?.(workId)
  }

  const sortIndicator = (key: SortKey) => {
    if (sortKey !== key) return ''
    return sortDir === 'asc' ? ' ^' : ' v'
  }

  if (works.length === 0) {
    return (
      <div className="text-star/50 text-center py-8">
        No works logged yet. Import some reviews to get started.
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4">
        <label className="text-sm text-star/70 mr-2">Filter by medium:</label>
        <select
          value={filterMedium}
          onChange={(e) => setFilterMedium(e.target.value)}
          className="bg-surface border border-border rounded px-2 py-1 text-star text-sm"
        >
          <option value="">All</option>
          {mediums.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border text-star/70">
            <th className="py-2 px-3 cursor-pointer" onClick={() => handleSort('title')}>
              Title{sortIndicator('title')}
            </th>
            <th className="py-2 px-3 cursor-pointer" onClick={() => handleSort('medium')}>
              Medium{sortIndicator('medium')}
            </th>
            <th className="py-2 px-3 cursor-pointer" onClick={() => handleSort('primaryScore')}>
              Primary{sortIndicator('primaryScore')}
            </th>
            <th className="py-2 px-3 cursor-pointer" onClick={() => handleSort('comfortScore')}>
              Comfort{sortIndicator('comfortScore')}
            </th>
            <th className="py-2 px-3 cursor-pointer" onClick={() => handleSort('consumptionMode')}>
              Mode{sortIndicator('consumptionMode')}
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedWorks.map((work) => (
            <DebugTableRow
              key={work.id}
              work={work}
              isExpanded={expandedWorkId === work.id}
              expandedData={expandedWorkId === work.id ? expandedData : null}
              onClick={() => handleRowClick(work.id)}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function DebugTableRow({
  work,
  isExpanded,
  expandedData,
  onClick,
}: {
  work: Work
  isExpanded: boolean
  expandedData: { scores: DimensionScore[]; tropes: (Trope & { confidence: number })[] } | null
  onClick: () => void
}) {
  return (
    <>
      <tr
        className="border-b border-border/50 hover:bg-surface-bright cursor-pointer"
        onClick={onClick}
        data-testid={`work-row-${work.id}`}
      >
        <td className="py-2 px-3 font-medium">{work.title}</td>
        <td className="py-2 px-3">
          <span className="px-2 py-0.5 rounded text-xs bg-surface-bright">
            {work.medium}
          </span>
        </td>
        <td className="py-2 px-3">{work.primaryScore ?? '-'}</td>
        <td className="py-2 px-3">{work.comfortScore ?? '-'}</td>
        <td className="py-2 px-3 text-xs text-star/60">{work.consumptionMode}</td>
      </tr>
      {isExpanded && expandedData && (
        <tr className="bg-surface" data-testid={`work-detail-${work.id}`}>
          <td colSpan={5} className="px-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-accent text-sm font-semibold mb-2">Dimension Scores</h4>
                {expandedData.scores.length > 0 ? (
                  <ul className="text-xs space-y-1">
                    {expandedData.scores.map((s) => (
                      <li key={s.id}>
                        Dim {s.dimensionId}: <span className="text-ember">{s.score}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-star/40">No dimension scores</p>
                )}
              </div>
              <div>
                <h4 className="text-accent text-sm font-semibold mb-2">Tropes</h4>
                {expandedData.tropes.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {expandedData.tropes.map((t) => (
                      <span
                        key={t.id}
                        className="px-2 py-0.5 rounded text-xs bg-nebula/30 text-star/80"
                      >
                        {t.name} ({Math.round(t.confidence * 100)}%)
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-star/40">No tropes linked</p>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}
