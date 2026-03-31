import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { ContextPanel } from '../ContextPanel'
import { FocusProvider, useFocus } from '../FocusContext'
import { useEffect } from 'react'

// Mock DAL
const mockGetWorkById = vi.fn()
const mockGetDimensionScoresForWork = vi.fn()
const mockGetTropesForWork = vi.fn()
const mockGetOverallStats = vi.fn()
const mockGetTropes = vi.fn()

vi.mock('../../db/dal', () => ({
  getWorkById: (...args: unknown[]) => mockGetWorkById(...args),
  getDimensionScoresForWork: (...args: unknown[]) => mockGetDimensionScoresForWork(...args),
  getTropesForWork: (...args: unknown[]) => mockGetTropesForWork(...args),
  getOverallStats: (...args: unknown[]) => mockGetOverallStats(...args),
  getTropes: (...args: unknown[]) => mockGetTropes(...args),
}))

beforeEach(() => {
  mockGetOverallStats.mockResolvedValue({ totalWorks: 10, totalTropes: 50, avgScore: 8.2 })
  mockGetWorkById.mockResolvedValue({
    id: 1, title: 'Attack on Titan', medium: 'anime', year: 2013,
    primaryScore: 9.6, comfortScore: null, coverUrl: null,
    consumptionMode: null, dateConsumed: null, notes: null,
  })
  mockGetDimensionScoresForWork.mockResolvedValue([
    { id: 1, workId: 1, dimensionId: 1, score: 9.5, reasoning: null },
  ])
  mockGetTropesForWork.mockResolvedValue([
    { id: 1, name: 'political intrigue', category: 'premise_structural', description: '' },
  ])
  mockGetTropes.mockResolvedValue([
    { id: 1, name: 'political intrigue', category: 'premise_structural', description: 'Power dynamics' },
  ])
})

// Helper to set focus from within the provider
function FocusSetter({ type, entityId }: { type: 'work' | 'trope'; entityId: number }) {
  const { setFocus } = useFocus()
  useEffect(() => {
    setFocus({ type, entityId })
  }, [type, entityId, setFocus])
  return null
}

describe('ContextPanel', () => {
  it('shows dashboard overview when no focus', async () => {
    render(
      <FocusProvider>
        <ContextPanel />
      </FocusProvider>,
    )
    await waitFor(() => {
      expect(screen.getByTestId('context-dashboard')).toBeInTheDocument()
    })
    expect(screen.getByText('10')).toBeInTheDocument()
  })

  it('shows work details when focused on a work', async () => {
    render(
      <FocusProvider>
        <FocusSetter type="work" entityId={1} />
        <ContextPanel />
      </FocusProvider>,
    )
    await waitFor(() => {
      expect(screen.getByTestId('context-work')).toBeInTheDocument()
    })
    expect(screen.getByText('Attack on Titan')).toBeInTheDocument()
    expect(screen.getByText('9.6')).toBeInTheDocument()
    expect(screen.getByText('political intrigue')).toBeInTheDocument()
  })

  it('shows trope details when focused on a trope', async () => {
    render(
      <FocusProvider>
        <FocusSetter type="trope" entityId={1} />
        <ContextPanel />
      </FocusProvider>,
    )
    await waitFor(() => {
      expect(screen.getByTestId('context-trope')).toBeInTheDocument()
    })
    expect(screen.getByText('political intrigue')).toBeInTheDocument()
    expect(screen.getByText('Power dynamics')).toBeInTheDocument()
  })

  it('switches content when focus changes', async () => {
    const { rerender } = render(
      <FocusProvider>
        <FocusSetter type="work" entityId={1} />
        <ContextPanel />
      </FocusProvider>,
    )
    await waitFor(() => {
      expect(screen.getByTestId('context-work')).toBeInTheDocument()
    })

    rerender(
      <FocusProvider>
        <FocusSetter type="trope" entityId={1} />
        <ContextPanel />
      </FocusProvider>,
    )
    await waitFor(() => {
      expect(screen.getByTestId('context-trope')).toBeInTheDocument()
    })
    expect(screen.queryByTestId('context-work')).not.toBeInTheDocument()
  })
})
