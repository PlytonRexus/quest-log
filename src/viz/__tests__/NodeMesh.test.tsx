import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import type { GraphNode } from '../types'

// Mock R3F
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn((cb: (state: unknown, delta: number) => void) => {
    cb({}, 0.016)
  }),
}))

// Mock Three.js with proper class constructors
vi.mock('three', () => {
  class Matrix4 {
    makeScale() { return this }
    setPosition() { return this }
  }
  class Color {
    set() { return this }
  }
  class SphereGeometry {}
  class OctahedronGeometry {}
  class DodecahedronGeometry {}
  class MeshStandardMaterial {}
  return { Matrix4, Color, SphereGeometry, OctahedronGeometry, DodecahedronGeometry, MeshStandardMaterial }
})

import { NodeMesh } from '../NodeMesh'

function makeNodes(count: number): GraphNode[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `work:${i + 1}`,
    kind: 'work' as const,
    label: `Work ${i + 1}`,
    color: '#AB47BC',
    size: 0.5 + i * 0.1,
    entityId: i + 1,
    x: i * 10,
    y: 0,
    z: 0,
  }))
}

describe('NodeMesh', () => {
  it('renders without crashing with nodes', () => {
    const { container } = render(
      <NodeMesh nodes={makeNodes(5)} kind="work" />,
    )
    expect(container).toBeTruthy()
  })

  it('returns null for empty nodes', () => {
    const { container } = render(
      <NodeMesh nodes={[]} kind="work" />,
    )
    expect(container.innerHTML).toBe('')
  })

  it('renders with trope kind', () => {
    const tropeNodes: GraphNode[] = [
      { id: 'trope:1', kind: 'trope', label: 'test', color: '#3B82F6', size: 0.5, entityId: 1 },
    ]
    const { container } = render(
      <NodeMesh nodes={tropeNodes} kind="trope" />,
    )
    expect(container).toBeTruthy()
  })

  it('renders with dimension kind', () => {
    const dimNodes: GraphNode[] = [
      { id: 'dim:1', kind: 'dimension', label: 'test', color: '#FFFFFF', size: 1.0, entityId: 1, fx: 80, fy: 0, fz: 0 },
    ]
    const { container } = render(
      <NodeMesh nodes={dimNodes} kind="dimension" />,
    )
    expect(container).toBeTruthy()
  })

  it('accepts click and hover handlers', () => {
    const onClick = vi.fn()
    const onHover = vi.fn()
    const { container } = render(
      <NodeMesh
        nodes={makeNodes(3)}
        kind="work"
        onNodeClick={onClick}
        onNodeHover={onHover}
      />,
    )
    expect(container).toBeTruthy()
  })
})
