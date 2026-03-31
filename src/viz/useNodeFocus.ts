// Click-to-focus camera animation for graph nodes

import { useCallback, useRef } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { Vector3 } from 'three'
import type { GraphNode } from './types'

const DEFAULT_POSITION = new Vector3(0, 0, 150)
const LERP_SPEED = 0.04

export function useNodeFocus() {
  const { camera } = useThree()
  const targetPosition = useRef<Vector3 | null>(null)
  const targetLookAt = useRef<Vector3 | null>(null)

  const focusNode = useCallback((node: GraphNode) => {
    const nodePos = new Vector3(node.x ?? 0, node.y ?? 0, node.z ?? 0)
    // Position camera offset from the node
    const offset = new Vector3(0, 10, 30)
    targetPosition.current = nodePos.clone().add(offset)
    targetLookAt.current = nodePos.clone()
  }, [])

  const resetFocus = useCallback(() => {
    targetPosition.current = DEFAULT_POSITION.clone()
    targetLookAt.current = new Vector3(0, 0, 0)
  }, [])

  useFrame(() => {
    if (!targetPosition.current) return

    camera.position.lerp(targetPosition.current, LERP_SPEED)

    if (targetLookAt.current) {
      camera.lookAt(targetLookAt.current)
    }

    // Stop animating when close enough
    if (camera.position.distanceTo(targetPosition.current) < 0.1) {
      targetPosition.current = null
      targetLookAt.current = null
    }
  })

  return { focusNode, resetFocus }
}
