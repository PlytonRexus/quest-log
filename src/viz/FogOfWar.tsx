// Hook for managing fog-of-war discovery state in the galaxy visualization

import { useState, useEffect, useCallback, useRef } from 'react'
import { getDiscoveryStates } from '../db/dal'

interface FogState {
  state: string
  revealProgress: number
}

export function useFogOfWar() {
  const [fogMap, setFogMap] = useState<Map<number, FogState>>(new Map())
  const animatingRef = useRef<Map<number, { start: number; duration: number }>>(new Map())
  const [isAnimating, setIsAnimating] = useState(false)

  const reload = useCallback(async () => {
    const states = await getDiscoveryStates()
    const map = new Map<number, FogState>()
    for (const ds of states) {
      map.set(ds.tropeId, {
        state: ds.state,
        revealProgress: ds.state === 'revealed' ? 1 : 0,
      })
    }
    setFogMap(map)
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  const triggerReveal = useCallback((tropeIds: number[]) => {
    const now = performance.now()
    for (const id of tropeIds) {
      animatingRef.current.set(id, { start: now, duration: 2000 })
    }
    setIsAnimating(true)

    // Animate via requestAnimationFrame
    const animate = () => {
      const current = performance.now()
      let stillAnimating = false

      setFogMap((prev) => {
        const next = new Map(prev)
        for (const [tropeId, anim] of animatingRef.current) {
          const elapsed = current - anim.start
          const progress = Math.min(1, elapsed / anim.duration)
          next.set(tropeId, { state: 'revealed', revealProgress: progress })
          if (progress < 1) {
            stillAnimating = true
          } else {
            animatingRef.current.delete(tropeId)
          }
        }
        return next
      })

      if (stillAnimating) {
        requestAnimationFrame(animate)
      } else {
        setIsAnimating(false)
      }
    }
    requestAnimationFrame(animate)
  }, [])

  // Build a simple state map (tropeId -> state string) for graphMapper
  const fogStateMap = new Map<number, string>()
  for (const [tropeId, entry] of fogMap) {
    fogStateMap.set(tropeId, entry.state)
  }

  return { fogMap, fogStateMap, triggerReveal, isAnimating, reload }
}
