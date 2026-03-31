import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import type { GraphData } from '../types'

// Mock R3F hooks
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn((cb: (state: unknown, delta: number) => void) => {
    cb({}, 0.016)
  }),
  useThree: vi.fn().mockReturnValue({
    camera: { position: { set: vi.fn() } },
    gl: { domElement: document.createElement('canvas') },
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
  class BufferGeometry {
    setAttribute() {}
    getAttribute() {
      return { array: new Float32Array(60), needsUpdate: false }
    }
  }
  class Float32BufferAttribute {}
  class LineBasicMaterial {}
  return {
    Matrix4, Color, SphereGeometry, OctahedronGeometry, DodecahedronGeometry,
    MeshStandardMaterial, BufferGeometry, Float32BufferAttribute, LineBasicMaterial,
  }
})

// Mock d3-force-3d: all mock objects inline (no external variable references)
vi.mock('d3-force-3d', () => {
  function makeChainable(): Record<string, (...args: unknown[]) => unknown> {
    const obj: Record<string, (...args: unknown[]) => unknown> = {}
    const methods = ['force', 'alphaDecay', 'stop', 'tick', 'alpha', 'alphaMin', 'nodes',
      'id', 'distance', 'strength', 'radius']
    for (const m of methods) {
      if (m === 'alpha') {
        obj[m] = () => 0.5
      } else if (m === 'alphaMin') {
        obj[m] = () => 0.001
      } else if (m === 'nodes') {
        obj[m] = () => []
      } else {
        obj[m] = function(this: typeof obj) { return this }
      }
    }
    return obj
  }

  return {
    forceSimulation: () => makeChainable(),
    forceLink: () => makeChainable(),
    forceManyBody: () => makeChainable(),
    forceCenter: () => makeChainable(),
    forceCollide: () => makeChainable(),
  }
})

import { ForceGraph } from '../ForceGraph'

function makeGraphData(): GraphData {
  return {
    nodes: [
      { id: 'work:1', kind: 'work', label: 'AoT', color: '#AB47BC', size: 1.0, entityId: 1, x: 0, y: 0, z: 0 },
      { id: 'work:2', kind: 'work', label: 'Dune', color: '#4FC3F7', size: 0.8, entityId: 2, x: 10, y: 0, z: 0 },
      { id: 'trope:1', kind: 'trope', label: 'political intrigue', color: '#3B82F6', size: 0.5, entityId: 1, x: 5, y: 5, z: 0 },
      { id: 'dim:1', kind: 'dimension', label: 'Incentive Coherence', color: '#FFFFFF', size: 1.0, entityId: 1, fx: 80, fy: 0, fz: 0 },
    ],
    links: [
      { source: 'work:1', target: 'trope:1', weight: 0.9, kind: 'work-trope' },
    ],
  }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ForceGraph', () => {
  it('renders without crashing', () => {
    const { container } = render(<ForceGraph graphData={makeGraphData()} />)
    expect(container).toBeTruthy()
  })

  it('renders with empty graph data', () => {
    const emptyData: GraphData = { nodes: [], links: [] }
    const { container } = render(<ForceGraph graphData={emptyData} />)
    expect(container).toBeTruthy()
  })

  it('passes node click handler through', () => {
    const onClick = vi.fn()
    const { container } = render(
      <ForceGraph graphData={makeGraphData()} onNodeClick={onClick} />,
    )
    expect(container).toBeTruthy()
  })

  it('accepts highlighted node id', () => {
    const { container } = render(
      <ForceGraph graphData={makeGraphData()} highlightedNodeId="work:1" />,
    )
    expect(container).toBeTruthy()
  })
})
