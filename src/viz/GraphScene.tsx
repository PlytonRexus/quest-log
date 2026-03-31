// Composition container for the 3D graph: ForceGraph + hover + focus + tooltip

import { useCallback } from 'react'
import { ForceGraph } from './ForceGraph'
import { NodeTooltip } from './NodeTooltip'
import { useNodeHover } from './useNodeHover'
import { useNodeFocus } from './useNodeFocus'
import type { GraphData, GraphNode } from './types'

interface Props {
  graphData: GraphData
  focusedNodeId?: string | null
}

export function GraphScene({ graphData, focusedNodeId }: Props) {
  const { hoveredNode, onHover } = useNodeHover()
  const { focusNode, resetFocus } = useNodeFocus()

  const handleNodeClick = useCallback((node: GraphNode) => {
    focusNode(node)
  }, [focusNode])

  const handleBackgroundClick = useCallback(() => {
    resetFocus()
  }, [resetFocus])

  return (
    <group onClick={handleBackgroundClick}>
      <ForceGraph
        graphData={graphData}
        onNodeClick={handleNodeClick}
        onNodeHover={onHover}
        highlightedNodeId={hoveredNode?.id ?? focusedNodeId ?? null}
      />
      {hoveredNode && <NodeTooltip node={hoveredNode} />}
    </group>
  )
}
