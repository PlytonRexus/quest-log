import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useGraphSync } from '../useGraphSync'
import type { Work, Trope } from '../../types'

function makeWork(id: number): Work {
  return {
    id, title: `Work ${id}`, medium: 'film', year: 2020,
    coverUrl: null, primaryScore: 8.0, comfortScore: null,
    consumptionMode: 'legitimacy', dateConsumed: null, notes: null,
  }
}

function makeTrope(id: number): Trope {
  return { id, name: `trope-${id}`, category: 'premise_structural', description: '' }
}

describe('useGraphSync', () => {
  it('does not call rebuild on initial render', () => {
    const rebuild = vi.fn().mockResolvedValue(undefined)
    renderHook(() => useGraphSync([makeWork(1)], [makeTrope(1)], rebuild))
    expect(rebuild).not.toHaveBeenCalled()
  })

  it('calls rebuild when works count changes', () => {
    const rebuild = vi.fn().mockResolvedValue(undefined)
    const { rerender } = renderHook(
      ({ works, tropes }) => useGraphSync(works, tropes, rebuild),
      { initialProps: { works: [makeWork(1)], tropes: [makeTrope(1)] } },
    )

    rerender({ works: [makeWork(1), makeWork(2)], tropes: [makeTrope(1)] })
    expect(rebuild).toHaveBeenCalledTimes(1)
  })

  it('calls rebuild when tropes count changes', () => {
    const rebuild = vi.fn().mockResolvedValue(undefined)
    const { rerender } = renderHook(
      ({ works, tropes }) => useGraphSync(works, tropes, rebuild),
      { initialProps: { works: [makeWork(1)], tropes: [makeTrope(1)] } },
    )

    rerender({ works: [makeWork(1)], tropes: [makeTrope(1), makeTrope(2)] })
    expect(rebuild).toHaveBeenCalledTimes(1)
  })

  it('does not call rebuild when data reference changes but count stays same', () => {
    const rebuild = vi.fn().mockResolvedValue(undefined)
    const { rerender } = renderHook(
      ({ works, tropes }) => useGraphSync(works, tropes, rebuild),
      { initialProps: { works: [makeWork(1)], tropes: [makeTrope(1)] } },
    )

    // Same count, different references
    rerender({ works: [makeWork(1)], tropes: [makeTrope(1)] })
    expect(rebuild).not.toHaveBeenCalled()
  })
})
