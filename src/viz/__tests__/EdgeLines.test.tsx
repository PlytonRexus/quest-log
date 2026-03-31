import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import type { GraphLink, GraphNode } from '../types'

// Mock R3F
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn((cb: (state: unknown, delta: number) => void) => {
    cb({}, 0.016)
  }),
}))

// Mock Three.js with proper class constructors
vi.mock('three', () => {
  class BufferGeometry {
    setAttribute() {}
    getAttribute() {
      return { array: new Float32Array(60), needsUpdate: false }
    }
  }
  class Float32BufferAttribute {}
  class LineBasicMaterial {}
  return { BufferGeometry, Float32BufferAttribute, LineBasicMaterial }
})

import { EdgeLines } from '../EdgeLines'

function makeNodeMap(): Map<string, GraphNode> {
  const map = new Map<string, GraphNode>()
  map.set('work:1', { id: 'work:1', kind: 'work', label: 'AoT', color: '#AB47BC', size: 1.0, entityId: 1, x: 0, y: 0, z: 0 })
  map.set('work:2', { id: 'work:2', kind: 'work', label: 'Dune', color: '#4FC3F7', size: 0.8, entityId: 2, x: 10, y: 0, z: 0 })
  map.set('trope:1', { id: 'trope:1', kind: 'trope', label: 'intrigue', color: '#3B82F6', size: 0.5, entityId: 1, x: 5, y: 5, z: 0 })
  return map
}

function makeLinks(): GraphLink[] {
  return [
    { source: 'work:1', target: 'trope:1', weight: 0.9, kind: 'work-trope' },
    { source: 'work:2', target: 'trope:1', weight: 0.7, kind: 'work-trope' },
  ]
}

describe('EdgeLines', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <EdgeLines links={makeLinks()} nodeMap={makeNodeMap()} />,
    )
    expect(container).toBeTruthy()
  })

  it('returns null for empty links', () => {
    const { container } = render(
      <EdgeLines links={[]} nodeMap={makeNodeMap()} />,
    )
    expect(container.innerHTML).toBe('')
  })

  it('accepts highlighted node id', () => {
    const { container } = render(
      <EdgeLines
        links={makeLinks()}
        nodeMap={makeNodeMap()}
        highlightedNodeId="work:1"
      />,
    )
    expect(container).toBeTruthy()
  })
})
