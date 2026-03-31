// Manages hover state for graph nodes

import { useState, useCallback } from 'react'
import type { GraphNode } from './types'

export function useNodeHover() {
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null)

  const onHover = useCallback((node: GraphNode | null) => {
    setHoveredNode(node)
  }, [])

  return { hoveredNode, onHover }
}
