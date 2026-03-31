import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RadarChart } from '../radarChart'
import type { Work, DimensionScore } from '../../types'

const DIMENSION_NAMES = [
  'Incentive Coherence', 'Consequence Permanence', 'Epistemic Integrity',
  'Power-Cost Calibration', 'Emotional Causality', 'Agency Distribution',
  'Narrative Efficiency', 'Tonal Control', 'Internal Mythology',
  'Perspective Architecture', 'Thematic Resonance', 'Structural Innovation',
]

function makeWork(id: number, title: string): Work {
  return {
    id, title, medium: 'anime', year: 2020, coverUrl: null,
    primaryScore: 8, comfortScore: null, consumptionMode: null,
    dateConsumed: null, notes: null,
  }
}

describe('RadarChart', () => {
  it('renders radar chart with 12 dimension axes', () => {
    const scoresMap = new Map<number, DimensionScore[]>()
    render(
      <RadarChart
        works={[makeWork(1, 'Test')]}
        scoresMap={scoresMap}
        dimensionNames={DIMENSION_NAMES}
      />,
    )
    expect(screen.getByTestId('radar-chart')).toBeInTheDocument()
    // Should have axis labels
    expect(screen.getByText(/Incentive/)).toBeInTheDocument()
  })

  it('renders polygon for a single work', () => {
    const scores: DimensionScore[] = [
      { id: 1, workId: 1, dimensionId: 1, score: 9.0, reasoning: null },
      { id: 2, workId: 1, dimensionId: 2, score: 8.0, reasoning: null },
    ]
    const scoresMap = new Map([[1, scores]])
    render(
      <RadarChart
        works={[makeWork(1, 'AoT')]}
        scoresMap={scoresMap}
        dimensionNames={DIMENSION_NAMES}
      />,
    )
    expect(screen.getByTestId('radar-polygon-1')).toBeInTheDocument()
  })

  it('renders two polygons for two works', () => {
    const scoresMap = new Map<number, DimensionScore[]>([
      [1, [{ id: 1, workId: 1, dimensionId: 1, score: 9, reasoning: null }]],
      [2, [{ id: 2, workId: 2, dimensionId: 1, score: 7, reasoning: null }]],
    ])
    render(
      <RadarChart
        works={[makeWork(1, 'A'), makeWork(2, 'B')]}
        scoresMap={scoresMap}
        dimensionNames={DIMENSION_NAMES}
      />,
    )
    expect(screen.getByTestId('radar-polygon-1')).toBeInTheDocument()
    expect(screen.getByTestId('radar-polygon-2')).toBeInTheDocument()
  })

  it('handles missing dimension scores gracefully', () => {
    const scoresMap = new Map<number, DimensionScore[]>()
    render(
      <RadarChart
        works={[makeWork(1, 'Test')]}
        scoresMap={scoresMap}
        dimensionNames={DIMENSION_NAMES}
      />,
    )
    // Should render without crashing, polygon at origin
    expect(screen.getByTestId('radar-polygon-1')).toBeInTheDocument()
  })
})
