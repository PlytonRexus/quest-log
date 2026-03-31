import { useState, useEffect, useMemo } from 'react'
import type { PortalPlugin, PluginAPI } from '../types'
import type { Work, DimensionScore } from '../../types'

// Radar chart dimensions
const SIZE = 300
const CENTER = SIZE / 2
const RADIUS = 120
const DIMENSION_COUNT = 12

interface RadarChartProps {
  works: Work[]
  scoresMap: Map<number, DimensionScore[]>
  dimensionNames: string[]
}

const WORK_COLORS = ['#06b6d4', '#f59e0b', '#a855f7']

export function RadarChart({ works, scoresMap, dimensionNames }: RadarChartProps) {
  const axes = dimensionNames.slice(0, DIMENSION_COUNT)
  const angleStep = (2 * Math.PI) / axes.length

  function getPoint(axisIndex: number, value: number): [number, number] {
    const angle = axisIndex * angleStep - Math.PI / 2
    const r = (value / 10) * RADIUS
    return [CENTER + r * Math.cos(angle), CENTER + r * Math.sin(angle)]
  }

  function buildPolygon(workId: number): string {
    const scores = scoresMap.get(workId) ?? []
    const scoreMap = new Map(scores.map((s) => [s.dimensionId, s.score]))
    return axes
      .map((_, i) => {
        const score = scoreMap.get(i + 1) ?? 0
        const [x, y] = getPoint(i, score)
        return `${x},${y}`
      })
      .join(' ')
  }

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className="w-full h-full"
      data-testid="radar-chart"
    >
      {/* Grid rings */}
      {[2, 4, 6, 8, 10].map((level) => (
        <polygon
          key={`ring-${level}`}
          points={axes
            .map((_, i) => getPoint(i, level).join(','))
            .join(' ')}
          fill="none"
          stroke="#2a3060"
          strokeWidth={0.5}
        />
      ))}

      {/* Axis lines */}
      {axes.map((_, i) => {
        const [x, y] = getPoint(i, 10)
        return (
          <line
            key={`axis-${i}`}
            x1={CENTER}
            y1={CENTER}
            x2={x}
            y2={y}
            stroke="#2a3060"
            strokeWidth={0.5}
          />
        )
      })}

      {/* Axis labels */}
      {axes.map((name, i) => {
        const [x, y] = getPoint(i, 11.5)
        return (
          <text
            key={`label-${i}`}
            x={x}
            y={y}
            textAnchor="middle"
            fill="#9CA3AF"
            fontSize={7}
          >
            {name.length > 12 ? name.slice(0, 10) + '..' : name}
          </text>
        )
      })}

      {/* Work polygons */}
      {works.slice(0, 3).map((work, wi) => (
        <polygon
          key={`poly-${work.id}`}
          points={buildPolygon(work.id)}
          fill={WORK_COLORS[wi]}
          fillOpacity={0.15}
          stroke={WORK_COLORS[wi]}
          strokeWidth={2}
          data-testid={`radar-polygon-${work.id}`}
        />
      ))}
    </svg>
  )
}

// Wrapper component that fetches its own data
let pluginApi: PluginAPI | null = null

function RadarChartPanel() {
  const [works, setWorks] = useState<Work[]>([])
  const [scoresMap, setScoresMap] = useState<Map<number, DimensionScore[]>>(new Map())
  const dimensionNames = useMemo(
    () => [
      'Incentive Coherence', 'Consequence Permanence', 'Epistemic Integrity',
      'Power-Cost Calibration', 'Emotional Causality', 'Agency Distribution',
      'Narrative Efficiency', 'Tonal Control', 'Internal Mythology',
      'Perspective Architecture', 'Thematic Resonance', 'Structural Innovation',
    ],
    [],
  )

  useEffect(() => {
    if (!pluginApi) return
    async function load() {
      const w = await pluginApi!.db.getWorks()
      setWorks(w.slice(0, 3))
      const map = new Map<number, DimensionScore[]>()
      for (const work of w.slice(0, 3)) {
        const scores = await pluginApi!.db.getDimensionScoresForWork(work.id)
        map.set(work.id, scores)
      }
      setScoresMap(map)
    }
    load()
  }, [])

  if (works.length === 0) {
    return <p className="text-star/50 text-xs">No works available</p>
  }

  return (
    <div>
      <RadarChart works={works} scoresMap={scoresMap} dimensionNames={dimensionNames} />
      <div className="flex gap-2 mt-2 justify-center">
        {works.map((w, i) => (
          <span key={w.id} className="text-[10px] flex items-center gap-1">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: WORK_COLORS[i] }} />
            {w.title}
          </span>
        ))}
      </div>
    </div>
  )
}

export const radarChartPlugin: PortalPlugin = {
  id: 'radar-chart',
  name: 'Dimension Radar Chart',
  version: '1.0.0',
  description: 'Compare dimension scores of works with a radar/spider chart',
  permissions: ['db:read', 'ui:panel'],
  activate(api: PluginAPI) {
    pluginApi = api
    api.ui.registerPanel({
      id: 'radar-chart-panel',
      title: 'Radar Chart',
      component: RadarChartPanel,
    })
  },
  deactivate() {
    pluginApi = null
  },
}
