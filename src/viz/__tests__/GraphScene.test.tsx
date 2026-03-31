import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import type { GraphData } from '../types'

// Mock all Three.js and R3F dependencies
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn((cb: (state: unknown, delta: number) => void) => {
    cb({}, 0.016)
  }),
  useThree: () => ({
    camera: {
      position: { lerp: vi.fn(), distanceTo: vi.fn().mockReturnValue(100), set: vi.fn() },
      lookAt: vi.fn(),
    },
  }),
}))

vi.mock('@react-three/drei', () => ({
  Html: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

vi.mock('three', () => {
  class Matrix4 {
    makeScale() { return this }
    setPosition() { return this }
  }
  class Color {
    set() { return this }
  }
  class Vector3 {
    x: number; y: number; z: number
    constructor(x = 0, y = 0, z = 0) { this.x = x; this.y = y; this.z = z }
    clone() { return new Vector3(this.x, this.y, this.z) }
    add(v: Vector3) { this.x += v.x; this.y += v.y; this.z += v.z; return this }
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
    Matrix4, Color, Vector3, SphereGeometry, OctahedronGeometry, DodecahedronGeometry,
    MeshStandardMaterial, BufferGeometry, Float32BufferAttribute, LineBasicMaterial,
  }
})

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

import { GraphScene } from '../GraphScene'

function makeGraphData(): GraphData {
  return {
    nodes: [
      { id: 'work:1', kind: 'work', label: 'AoT', color: '#AB47BC', size: 1.0, entityId: 1, x: 0, y: 0, z: 0 },
      { id: 'trope:1', kind: 'trope', label: 'intrigue', color: '#3B82F6', size: 0.5, entityId: 1, x: 5, y: 5, z: 0 },
    ],
    links: [
      { source: 'work:1', target: 'trope:1', weight: 0.9, kind: 'work-trope' },
    ],
  }
}

describe('GraphScene', () => {
  it('renders without crashing', () => {
    const { container } = render(<GraphScene graphData={makeGraphData()} />)
    expect(container).toBeTruthy()
  })

  it('renders with empty graph data', () => {
    const emptyData: GraphData = { nodes: [], links: [] }
    const { container } = render(<GraphScene graphData={emptyData} />)
    expect(container).toBeTruthy()
  })
})
