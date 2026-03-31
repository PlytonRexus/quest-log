// Watches DB data changes and triggers graph rebuild

import { useEffect, useRef } from 'react'
import type { Work, Trope } from '../types'

export function useGraphSync(
  works: Work[],
  tropes: Trope[],
  rebuild: () => Promise<void>,
) {
  const prevWorksLen = useRef(works.length)
  const prevTropesLen = useRef(tropes.length)

  useEffect(() => {
    if (works.length !== prevWorksLen.current || tropes.length !== prevTropesLen.current) {
      prevWorksLen.current = works.length
      prevTropesLen.current = tropes.length
      rebuild()
    }
  }, [works.length, tropes.length, rebuild])
}
