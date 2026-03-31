// Renders a group of graph nodes as an InstancedMesh

import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  InstancedMesh,
  Matrix4,
  Color,
  SphereGeometry,
  OctahedronGeometry,
  DodecahedronGeometry,
  MeshStandardMaterial,
} from 'three'
import type { ThreeEvent } from '@react-three/fiber'
import type { GraphNode, NodeKind } from './types'

const GEOMETRY_MAP: Record<NodeKind, () => SphereGeometry | OctahedronGeometry | DodecahedronGeometry> = {
  work: () => new SphereGeometry(1, 16, 16),
  trope: () => new OctahedronGeometry(1),
  dimension: () => new DodecahedronGeometry(1),
}

const BASE_SCALE: Record<NodeKind, number> = {
  work: 2.0,
  trope: 1.5,
  dimension: 3.0,
}

interface Props {
  nodes: GraphNode[]
  kind: NodeKind
  highlightedNodeId?: string | null
  foggyPulse?: boolean
  onNodeClick?: (node: GraphNode) => void
  onNodeHover?: (node: GraphNode | null) => void
}

const tempMatrix = new Matrix4()
const tempColor = new Color()

export function NodeMesh({ nodes, kind, highlightedNodeId, foggyPulse, onNodeClick, onNodeHover }: Props) {
  const meshRef = useRef<InstancedMesh>(null)

  const geometry = useMemo(() => GEOMETRY_MAP[kind](), [kind])
  const material = useMemo(
    () => new MeshStandardMaterial({
      roughness: 0.4,
      metalness: 0.3,
      emissive: new Color('#000000'),
      emissiveIntensity: 0.5,
    }),
    [],
  )

  // Initialize instance colors on mount and when nodes change
  useEffect(() => {
    const mesh = meshRef.current
    if (!mesh || !('setColorAt' in mesh)) return
    for (let i = 0; i < nodes.length; i++) {
      tempColor.set(nodes[i].color)
      mesh.setColorAt(i, tempColor)
    }
    if (mesh.instanceColor) {
      mesh.instanceColor.needsUpdate = true
    }
  }, [nodes])

  useFrame(({ clock }) => {
    const mesh = meshRef.current
    if (!mesh || !('setMatrixAt' in mesh)) return
    const baseScale = BASE_SCALE[kind]
    const elapsed = clock.elapsedTime

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i]
      const isFoggy = foggyPulse && node.discoveryState === 'foggy'
      const pulseScale = isFoggy ? 0.8 + 0.2 * Math.sin(elapsed * 2) : 1
      const scale = node.size * baseScale * pulseScale
      const isHighlighted = highlightedNodeId === node.id

      tempMatrix.makeScale(scale, scale, scale)
      tempMatrix.setPosition(node.x ?? 0, node.y ?? 0, node.z ?? 0)
      mesh.setMatrixAt(i, tempMatrix)

      if (isHighlighted) {
        tempColor.set('#ffffff')
      } else if (isFoggy) {
        // Pulse color intensity for foggy nodes
        const intensity = 0.3 + 0.15 * Math.sin(elapsed * 2)
        tempColor.set(node.color).multiplyScalar(intensity / 0.3)
      } else {
        tempColor.set(node.color)
      }
      if ('setColorAt' in mesh) {
        mesh.setColorAt(i, tempColor)
      }
    }

    if (mesh.instanceMatrix) {
      mesh.instanceMatrix.needsUpdate = true
    }
    if (mesh.instanceColor) {
      mesh.instanceColor.needsUpdate = true
    }
  })

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    if (e.instanceId !== undefined && onNodeClick) {
      onNodeClick(nodes[e.instanceId])
    }
  }

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    if (e.instanceId !== undefined && onNodeHover) {
      onNodeHover(nodes[e.instanceId])
    }
  }

  const handlePointerOut = () => {
    onNodeHover?.(null)
  }

  if (nodes.length === 0) return null

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, nodes.length]}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    />
  )
}
