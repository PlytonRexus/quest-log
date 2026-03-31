import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useNodeHover } from '../useNodeHover'
import type { GraphNode } from '../types'

const testNode: GraphNode = {
  id: 'work:1',
  kind: 'work',
  label: 'AoT',
  color: '#AB47BC',
  size: 1.0,
  entityId: 1,
  x: 0,
  y: 0,
  z: 0,
}

describe('useNodeHover', () => {
  it('starts with null hovered node', () => {
    const { result } = renderHook(() => useNodeHover())
    expect(result.current.hoveredNode).toBeNull()
  })

  it('sets hovered node on hover', () => {
    const { result } = renderHook(() => useNodeHover())
    act(() => {
      result.current.onHover(testNode)
    })
    expect(result.current.hoveredNode).toBe(testNode)
  })

  it('clears hovered node on hover null', () => {
    const { result } = renderHook(() => useNodeHover())
    act(() => {
      result.current.onHover(testNode)
    })
    expect(result.current.hoveredNode).toBe(testNode)

    act(() => {
      result.current.onHover(null)
    })
    expect(result.current.hoveredNode).toBeNull()
  })

  it('updates when hovering a different node', () => {
    const otherNode: GraphNode = { ...testNode, id: 'work:2', label: 'Dune' }
    const { result } = renderHook(() => useNodeHover())

    act(() => result.current.onHover(testNode))
    expect(result.current.hoveredNode?.id).toBe('work:1')

    act(() => result.current.onHover(otherNode))
    expect(result.current.hoveredNode?.id).toBe('work:2')
  })
})
