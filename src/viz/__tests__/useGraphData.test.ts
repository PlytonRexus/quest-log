import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useGraphData } from '../useGraphData'

vi.mock('../../db/dal', () => ({
  getWorks: vi.fn().mockResolvedValue([
    { id: 1, title: 'AoT', medium: 'anime', year: 2013, coverUrl: null, primaryScore: 9.6, comfortScore: null, consumptionMode: 'legitimacy', dateConsumed: null, notes: null },
    { id: 2, title: 'Dune', medium: 'film', year: 2021, coverUrl: null, primaryScore: 9.1, comfortScore: null, consumptionMode: 'legitimacy', dateConsumed: null, notes: null },
  ]),
  getTropes: vi.fn().mockResolvedValue([
    { id: 1, name: 'political intrigue', category: 'premise_structural', description: '' },
  ]),
  getDimensions: vi.fn().mockResolvedValue([
    { id: 1, name: 'Incentive Coherence', weight: 5.0, isLoadBearing: 1, framework: 'primary', description: '' },
  ]),
  getAllWorkTropeLinks: vi.fn().mockResolvedValue([
    { id: 1, workId: 1, tropeId: 1, confidence: 0.95, source: 'seed' },
  ]),
  getAllTropeRelations: vi.fn().mockResolvedValue([]),
  getDiscoveryStates: vi.fn().mockResolvedValue([]),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useGraphData', () => {
  it('starts in loading state', () => {
    const { result } = renderHook(() => useGraphData())
    expect(result.current.isLoading).toBe(true)
    expect(result.current.graphData).toBeNull()
  })

  it('loads graph data from DB', async () => {
    const { result } = renderHook(() => useGraphData())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.graphData).not.toBeNull()
    // 2 works + 1 trope + 1 dimension = 4 nodes
    expect(result.current.graphData!.nodes).toHaveLength(4)
    // 1 work-trope link
    expect(result.current.graphData!.links).toHaveLength(1)
    expect(result.current.error).toBeNull()
  })

  it('sets error on DAL failure', async () => {
    const { getWorks } = await import('../../db/dal')
    vi.mocked(getWorks).mockRejectedValueOnce(new Error('DB exploded'))

    const { result } = renderHook(() => useGraphData())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toBe('DB exploded')
    expect(result.current.graphData).toBeNull()
  })

  it('rebuild re-fetches data', async () => {
    const { getWorks } = await import('../../db/dal')

    const { result } = renderHook(() => useGraphData())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(vi.mocked(getWorks)).toHaveBeenCalledTimes(1)

    await result.current.rebuild()

    expect(vi.mocked(getWorks)).toHaveBeenCalledTimes(2)
  })
})
