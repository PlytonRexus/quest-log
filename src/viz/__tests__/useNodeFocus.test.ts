import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import type { GraphNode } from '../types'

const mockCamera = {
  position: {
    lerp: vi.fn(),
    distanceTo: vi.fn().mockReturnValue(100),
    set: vi.fn(),
  },
  lookAt: vi.fn(),
}

// Track the useFrame callback so we can call it manually
let frameCallback: ((state: unknown, delta: number) => void) | null = null

vi.mock('@react-three/fiber', () => ({
  useThree: () => ({ camera: mockCamera }),
  useFrame: (cb: (state: unknown, delta: number) => void) => {
    frameCallback = cb
  },
}))

vi.mock('three', () => {
  class Vector3 {
    x: number; y: number; z: number
    constructor(x = 0, y = 0, z = 0) { this.x = x; this.y = y; this.z = z }
    clone() { return new Vector3(this.x, this.y, this.z) }
    add(v: Vector3) { this.x += v.x; this.y += v.y; this.z += v.z; return this }
  }
  return { Vector3 }
})

import { useNodeFocus } from '../useNodeFocus'

const testNode: GraphNode = {
  id: 'work:1',
  kind: 'work',
  label: 'AoT',
  color: '#AB47BC',
  size: 1.0,
  entityId: 1,
  x: 10,
  y: 20,
  z: 30,
}

describe('useNodeFocus', () => {
  it('returns focusNode and resetFocus functions', () => {
    const { result } = renderHook(() => useNodeFocus())
    expect(typeof result.current.focusNode).toBe('function')
    expect(typeof result.current.resetFocus).toBe('function')
  })

  it('focusNode sets target position', () => {
    const { result } = renderHook(() => useNodeFocus())
    act(() => {
      result.current.focusNode(testNode)
    })

    // Simulate a frame to trigger the animation
    if (frameCallback) {
      frameCallback({}, 0.016)
    }

    // Camera should try to lerp toward the target
    expect(mockCamera.position.lerp).toHaveBeenCalled()
  })

  it('resetFocus sets default target', () => {
    const { result } = renderHook(() => useNodeFocus())
    act(() => {
      result.current.focusNode(testNode)
    })
    act(() => {
      result.current.resetFocus()
    })

    if (frameCallback) {
      frameCallback({}, 0.016)
    }

    expect(mockCamera.position.lerp).toHaveBeenCalled()
  })
})
