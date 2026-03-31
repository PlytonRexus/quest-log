import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DebugTable } from '../DebugTable'
import type { Work } from '../../types'

function makeWork(overrides: Partial<Work> = {}): Work {
  return {
    id: 1,
    title: 'Test',
    medium: 'film',
    year: 2020,
    coverUrl: null,
    primaryScore: 7.0,
    comfortScore: null,
    consumptionMode: 'legitimacy',
    dateConsumed: null,
    notes: null,
    ...overrides,
  }
}

const mockGetTropes = vi.fn().mockResolvedValue([])
const mockGetScores = vi.fn().mockResolvedValue([])

describe('DebugTable', () => {
  it('renders empty state with 0 works', () => {
    render(
      <DebugTable
        works={[]}
        getTropesForWork={mockGetTropes}
        getDimensionScoresForWork={mockGetScores}
      />,
    )
    expect(screen.getByText(/no works logged/i)).toBeInTheDocument()
  })

  it('renders 5 works as 5 rows', () => {
    const works = Array.from({ length: 5 }, (_, i) =>
      makeWork({ id: i + 1, title: `Work ${i + 1}` }),
    )
    render(
      <DebugTable
        works={works}
        getTropesForWork={mockGetTropes}
        getDimensionScoresForWork={mockGetScores}
      />,
    )
    for (let i = 1; i <= 5; i++) {
      expect(screen.getByText(`Work ${i}`)).toBeInTheDocument()
    }
  })

  it('sorts by column when header is clicked', () => {
    const works = [
      makeWork({ id: 1, title: 'Zebra', primaryScore: 5.0 }),
      makeWork({ id: 2, title: 'Alpha', primaryScore: 9.0 }),
    ]
    render(
      <DebugTable
        works={works}
        getTropesForWork={mockGetTropes}
        getDimensionScoresForWork={mockGetScores}
      />,
    )

    // Click title header once: sorts by title descending
    fireEvent.click(screen.getByText(/^Title/))
    // Click again: sorts by title ascending
    fireEvent.click(screen.getByText(/^Title/))
    const rows = screen.getAllByRole('row')
    // First data row (index 1, after header) should be Alpha
    expect(rows[1]).toHaveTextContent('Alpha')
  })

  it('filters by medium', () => {
    const works = [
      makeWork({ id: 1, title: 'Anime Work', medium: 'anime' }),
      makeWork({ id: 2, title: 'Film Work', medium: 'film' }),
    ]
    render(
      <DebugTable
        works={works}
        getTropesForWork={mockGetTropes}
        getDimensionScoresForWork={mockGetScores}
      />,
    )

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'anime' } })
    expect(screen.getByText('Anime Work')).toBeInTheDocument()
    expect(screen.queryByText('Film Work')).not.toBeInTheDocument()
  })

  it('expands row on click to show details', async () => {
    mockGetTropes.mockResolvedValueOnce([
      { id: 1, name: 'test-trope', category: 'premise_structural', description: '', confidence: 0.9 },
    ])
    mockGetScores.mockResolvedValueOnce([])

    const works = [makeWork({ id: 1, title: 'AoT' })]
    render(
      <DebugTable
        works={works}
        getTropesForWork={mockGetTropes}
        getDimensionScoresForWork={mockGetScores}
      />,
    )

    fireEvent.click(screen.getByText('AoT'))

    // Wait for expanded data to render
    expect(await screen.findByText(/test-trope/)).toBeInTheDocument()
  })
})
