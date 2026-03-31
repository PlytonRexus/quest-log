// Force-directed graph layout using d3-force-3d with R3F rendering

import { useRef, useMemo, useEffect, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
} from 'd3-force-3d'
import type { Simulation } from 'd3-force-3d'
import { NodeMesh } from './NodeMesh'
import { EdgeLines } from './EdgeLines'
import type { GraphNode, GraphLink, GraphData } from './types'

interface Props {
  graphData: GraphData
  onNodeClick?: (node: GraphNode) => void
  onNodeHover?: (node: GraphNode | null) => void
  highlightedNodeId?: string | null
}

export function ForceGraph({ graphData, onNodeClick, onNodeHover, highlightedNodeId }: Props) {
  const simulationRef = useRef<Simulation<GraphNode> | null>(null)
  const isSettledRef = useRef(false)

  // Partition nodes by kind for separate InstancedMesh groups
  const { workNodes, tropeNodes, dimensionNodes } = useMemo(() => ({
    workNodes: graphData.nodes.filter((n) => n.kind === 'work'),
    tropeNodes: graphData.nodes.filter((n) => n.kind === 'trope'),
    dimensionNodes: graphData.nodes.filter((n) => n.kind === 'dimension'),
  }), [graphData.nodes])

  // Build a node lookup map for edge rendering
  const nodeMap = useMemo(() => {
    const map = new Map<string, GraphNode>()
    for (const node of graphData.nodes) {
      map.set(node.id, node)
    }
    return map
  }, [graphData.nodes])

  // Initialize the d3-force simulation
  useEffect(() => {
    const sim = forceSimulation<GraphNode>(graphData.nodes)
      .force(
        'link',
        forceLink<GraphNode, GraphLink>(graphData.links)
          .id((d) => d.id)
          .distance(30)
          .strength((link) => (link as GraphLink).weight * 0.3),
      )
      .force('charge', forceManyBody<GraphNode>().strength(-40))
      .force('center', forceCenter<GraphNode>(0, 0, 0).strength(0.05))
      .force(
        'collide',
        forceCollide<GraphNode>().radius((d) => (d as GraphNode).size * 3 + 1),
      )
      .alphaDecay(0.02)
      .stop()

    simulationRef.current = sim
    isSettledRef.current = false

    return () => {
      simulationRef.current = null
    }
  }, [graphData])

  // Tick the simulation each frame until it settles
  useFrame(() => {
    const sim = simulationRef.current
    if (!sim || isSettledRef.current) return

    sim.tick(1)

    if (sim.alpha() < sim.alphaMin()) {
      isSettledRef.current = true
    }
  })

  // Reheat the simulation (called when graph data changes via sync)
  const reheat = useCallback(() => {
    if (simulationRef.current) {
      simulationRef.current.alpha(0.3)
      isSettledRef.current = false
    }
  }, [])

  // Expose reheat via ref if parent needs it
  useEffect(() => {
    // The simulation auto-starts on graphData change via the useEffect above
    void reheat
  }, [reheat])

  return (
    <group>
      <NodeMesh
        nodes={workNodes}
        kind="work"
        highlightedNodeId={highlightedNodeId}
        onNodeClick={onNodeClick}
        onNodeHover={onNodeHover}
      />
      <NodeMesh
        nodes={tropeNodes}
        kind="trope"
        highlightedNodeId={highlightedNodeId}
        onNodeClick={onNodeClick}
        onNodeHover={onNodeHover}
      />
      <NodeMesh
        nodes={dimensionNodes}
        kind="dimension"
        highlightedNodeId={highlightedNodeId}
        onNodeClick={onNodeClick}
        onNodeHover={onNodeHover}
      />
      <EdgeLines
        links={graphData.links}
        nodeMap={nodeMap}
        highlightedNodeId={highlightedNodeId}
      />
    </group>
  )
}
