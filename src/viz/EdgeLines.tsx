// Renders graph edges as LineSegments

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  BufferGeometry,
  Float32BufferAttribute,
  LineBasicMaterial,
  LineSegments as ThreeLineSegments,
} from 'three'
import type { GraphLink, GraphNode } from './types'

const EDGE_KIND_COLORS: Record<string, [number, number, number]> = {
  'work-trope': [0.9, 0.9, 0.95],
  'trope-trope': [0.96, 0.62, 0.04],
  'work-work': [0.02, 0.71, 0.83],
}

interface Props {
  links: GraphLink[]
  nodeMap: Map<string, GraphNode>
  highlightedNodeId?: string | null
}

export function EdgeLines({ links, nodeMap, highlightedNodeId }: Props) {
  const linesRef = useRef<ThreeLineSegments>(null)

  const geometry = useMemo(() => {
    const geo = new BufferGeometry()
    // Pre-allocate position and color buffers
    const positions = new Float32Array(links.length * 6)
    const colors = new Float32Array(links.length * 6)
    geo.setAttribute('position', new Float32BufferAttribute(positions, 3))
    geo.setAttribute('color', new Float32BufferAttribute(colors, 3))
    return geo
  }, [links.length])

  const material = useMemo(
    () => new LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.3,
      depthWrite: false,
    }),
    [],
  )

  useFrame(() => {
    if (!linesRef.current) return

    const posAttr = geometry.getAttribute('position')
    const colAttr = geometry.getAttribute('color')
    const positions = posAttr.array as Float32Array
    const colors = colAttr.array as Float32Array

    for (let i = 0; i < links.length; i++) {
      const link = links[i]
      const source = nodeMap.get(link.source)
      const target = nodeMap.get(link.target)

      if (!source || !target) continue

      const offset = i * 6
      positions[offset] = source.x ?? 0
      positions[offset + 1] = source.y ?? 0
      positions[offset + 2] = source.z ?? 0
      positions[offset + 3] = target.x ?? 0
      positions[offset + 4] = target.y ?? 0
      positions[offset + 5] = target.z ?? 0

      // Color by edge kind, brighter if connected to highlighted node
      const baseColor = EDGE_KIND_COLORS[link.kind] ?? [0.5, 0.5, 0.5]
      const isConnected = highlightedNodeId !== null && highlightedNodeId !== undefined &&
        (link.source === highlightedNodeId || link.target === highlightedNodeId)
      const brightness = isConnected ? 1.0 : 0.4

      colors[offset] = baseColor[0] * brightness
      colors[offset + 1] = baseColor[1] * brightness
      colors[offset + 2] = baseColor[2] * brightness
      colors[offset + 3] = baseColor[0] * brightness
      colors[offset + 4] = baseColor[1] * brightness
      colors[offset + 5] = baseColor[2] * brightness
    }

    posAttr.needsUpdate = true
    colAttr.needsUpdate = true
  })

  if (links.length === 0) return null

  return <lineSegments ref={linesRef} args={[geometry, material]} />
}
