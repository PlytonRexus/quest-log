import { useState, useEffect, useCallback } from 'react'
import { runMigrations } from '../db/migrate'
import { runSeed } from '../db/seed'
import {
  getWorks, getWorkById, getDimensions,
  getTropes, getTropesForWork, getDimensionScoresForWork,
  getOverallStats,
} from '../db/dal'
import type { Work, Dimension, Trope } from '../types'

interface DbState {
  isReady: boolean
  isLoading: boolean
  error: string | null
}

interface DbData {
  works: Work[]
  dimensions: Dimension[]
  tropes: Trope[]
  stats: { totalWorks: number; totalTropes: number; avgScore: number }
}

export function useDb() {
  const [state, setState] = useState<DbState>({
    isReady: false,
    isLoading: true,
    error: null,
  })
  const [data, setData] = useState<DbData>({
    works: [],
    dimensions: [],
    tropes: [],
    stats: { totalWorks: 0, totalTropes: 0, avgScore: 0 },
  })

  const init = useCallback(async () => {
    try {
      setState({ isReady: false, isLoading: true, error: null })
      await runMigrations()
      await runSeed()
      await refresh()
      setState({ isReady: true, isLoading: false, error: null })
    } catch (err) {
      setState({
        isReady: false,
        isLoading: false,
        error: err instanceof Error ? err.message : String(err),
      })
    }
  }, [])

  const refresh = useCallback(async () => {
    const [works, dimensions, tropes, stats] = await Promise.all([
      getWorks(),
      getDimensions(),
      getTropes(),
      getOverallStats(),
    ])
    setData({ works, dimensions, tropes, stats })
  }, [])

  useEffect(() => {
    init()
  }, [init])

  return {
    ...state,
    ...data,
    refresh,
    getWorkById,
    getTropesForWork,
    getDimensionScoresForWork,
  }
}
