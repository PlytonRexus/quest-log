// Hook that bridges the DB layer to graph visualization data

import { useState, useEffect, useCallback } from 'react'
import {
  getWorks, getTropes, getDimensions,
  getAllWorkTropeLinks, getAllTropeRelations,
  getDiscoveryStates,
} from '../db/dal'
import { buildGraphData } from './graphMapper'
import { getOverlay, onOverlayChange } from '../plugins/graphOverlay'
import type { GraphData } from './types'

interface UseGraphDataResult {
  graphData: GraphData | null
  isLoading: boolean
  error: string | null
  rebuild: () => Promise<void>
}

export function useGraphData(): UseGraphDataResult {
  const [graphData, setGraphData] = useState<GraphData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const rebuild = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const [works, tropes, dimensions, workTropeLinks, tropeRelations, discoveryStates] = await Promise.all([
        getWorks(),
        getTropes(),
        getDimensions(),
        getAllWorkTropeLinks(),
        getAllTropeRelations(),
        getDiscoveryStates(),
      ])

      // Build fog state map from discovery states
      const fogStateMap = new Map<number, string>()
      for (const ds of discoveryStates) {
        fogStateMap.set(ds.tropeId, ds.state)
      }

      const data = buildGraphData({
        works,
        tropes,
        dimensions,
        workTropeLinks,
        tropeRelations,
        fogStateMap: fogStateMap.size > 0 ? fogStateMap : undefined,
      })

      // Merge plugin overlay nodes and links
      const overlay = getOverlay()
      if (overlay.nodes.length > 0 || overlay.links.length > 0) {
        data.nodes.push(...overlay.nodes)
        data.links.push(...overlay.links)
      }

      setGraphData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    rebuild()
  }, [rebuild])

  // Rebuild when plugin overlay changes
  useEffect(() => {
    return onOverlayChange(() => {
      rebuild()
    })
  }, [rebuild])

  return { graphData, isLoading, error, rebuild }
}
