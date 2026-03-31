import { useState, useEffect, useMemo } from 'react'
import type { PortalPlugin, PluginAPI } from '../types'
import type { Work } from '../../types'

const CHART_WIDTH = 700
const CHART_HEIGHT = 300
const PADDING = { top: 20, right: 20, bottom: 40, left: 40 }
const PLOT_WIDTH = CHART_WIDTH - PADDING.left - PADDING.right
const PLOT_HEIGHT = CHART_HEIGHT - PADDING.top - PADDING.bottom

const MEDIUM_COLORS: Record<string, string> = {
  anime: '#AB47BC',
  film: '#4FC3F7',
  novel: '#66BB6A',
  manga: '#EF5350',
  game: '#FFA726',
  tv: '#29B6F6',
}

interface TimelineProps {
  works: Work[]
}

export function TasteTimeline({ works }: TimelineProps) {
  // Filter to works with dates and scores
  const dataPoints = useMemo(() => {
    return works
      .filter((w) => w.dateConsumed && w.primaryScore !== null)
      .map((w) => ({
        id: w.id,
        title: w.title,
        medium: w.medium,
        date: new Date(w.dateConsumed!).getTime(),
        score: w.primaryScore!,
      }))
      .sort((a, b) => a.date - b.date)
  }, [works])

  if (dataPoints.length === 0) {
    return (
      <div className="text-star/50 text-sm text-center p-4" data-testid="taste-timeline">
        No works with dates and scores to display.
      </div>
    )
  }

  const minDate = dataPoints[0].date
  const maxDate = dataPoints[dataPoints.length - 1].date
  const dateRange = maxDate - minDate || 1

  function xScale(date: number): number {
    return PADDING.left + ((date - minDate) / dateRange) * PLOT_WIDTH
  }

  function yScale(score: number): number {
    return PADDING.top + PLOT_HEIGHT - (score / 10) * PLOT_HEIGHT
  }

  // Simple linear trend line
  const n = dataPoints.length
  const sumX = dataPoints.reduce((s, p) => s + p.date, 0)
  const sumY = dataPoints.reduce((s, p) => s + p.score, 0)
  const sumXY = dataPoints.reduce((s, p) => s + p.date * p.score, 0)
  const sumXX = dataPoints.reduce((s, p) => s + p.date * p.date, 0)

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n
  const trendY1 = slope * minDate + intercept
  const trendY2 = slope * maxDate + intercept

  return (
    <svg
      viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
      className="w-full"
      data-testid="taste-timeline"
    >
      {/* Y-axis ticks */}
      {[0, 2, 4, 6, 8, 10].map((v) => (
        <g key={`ytick-${v}`}>
          <line
            x1={PADDING.left}
            y1={yScale(v)}
            x2={PADDING.left + PLOT_WIDTH}
            y2={yScale(v)}
            stroke="#2a3060"
            strokeWidth={0.5}
          />
          <text
            x={PADDING.left - 8}
            y={yScale(v) + 3}
            textAnchor="end"
            fill="#6B7280"
            fontSize={9}
          >
            {v}
          </text>
        </g>
      ))}

      {/* Trend line */}
      <line
        x1={xScale(minDate)}
        y1={yScale(trendY1)}
        x2={xScale(maxDate)}
        y2={yScale(trendY2)}
        stroke="#06b6d4"
        strokeWidth={1.5}
        strokeDasharray="6 3"
        opacity={0.5}
        data-testid="trend-line"
      />

      {/* Data points */}
      {dataPoints.map((p) => (
        <circle
          key={p.id}
          cx={xScale(p.date)}
          cy={yScale(p.score)}
          r={5}
          fill={MEDIUM_COLORS[p.medium] ?? '#9CA3AF'}
          opacity={0.8}
          data-testid={`timeline-dot-${p.id}`}
        >
          <title>{`${p.title} (${p.score})`}</title>
        </circle>
      ))}

      {/* X-axis label */}
      <text
        x={CHART_WIDTH / 2}
        y={CHART_HEIGHT - 5}
        textAnchor="middle"
        fill="#6B7280"
        fontSize={10}
      >
        Time
      </text>

      {/* Y-axis label */}
      <text
        x={10}
        y={CHART_HEIGHT / 2}
        textAnchor="middle"
        fill="#6B7280"
        fontSize={10}
        transform={`rotate(-90 10 ${CHART_HEIGHT / 2})`}
      >
        Score
      </text>
    </svg>
  )
}

// Wrapper component
let pluginApi: PluginAPI | null = null

function TimelinePanel() {
  const [works, setWorks] = useState<Work[]>([])

  useEffect(() => {
    if (!pluginApi) return
    pluginApi.db.getWorks().then(setWorks)
  }, [])

  return <TasteTimeline works={works} />
}

export const tasteTimelinePlugin: PortalPlugin = {
  id: 'taste-timeline',
  name: 'Taste Timeline',
  version: '1.0.0',
  description: 'Chronological scatter plot showing taste evolution over time',
  permissions: ['db:read', 'ui:panel'],
  activate(api: PluginAPI) {
    pluginApi = api
    api.ui.registerViewTab({
      id: 'taste-timeline-tab',
      label: 'Timeline',
      icon: '\u2500',
      component: TimelinePanel,
    })
  },
  deactivate() {
    pluginApi = null
  },
}
