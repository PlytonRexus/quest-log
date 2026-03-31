import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'

// Mock R3F Canvas
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="r3f-canvas">{children}</div>
  ),
  useFrame: vi.fn(),
  useThree: () => ({
    camera: {
      position: { lerp: vi.fn(), distanceTo: vi.fn().mockReturnValue(100), set: vi.fn() },
      lookAt: vi.fn(),
    },
  }),
}))

vi.mock('@react-three/drei', () => ({
  OrbitControls: () => <div data-testid="orbit-controls" />,
  Html: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

vi.mock('@react-three/postprocessing', () => ({
  EffectComposer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Bloom: () => <div />,
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
    getAttribute() { return { array: new Float32Array(60), needsUpdate: false } }
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
    for (const m of ['force', 'alphaDecay', 'stop', 'tick', 'alpha', 'alphaMin', 'nodes',
      'id', 'distance', 'strength', 'radius']) {
      if (m === 'alpha') obj[m] = () => 0.5
      else if (m === 'alphaMin') obj[m] = () => 0.001
      else if (m === 'nodes') obj[m] = () => []
      else obj[m] = function(this: typeof obj) { return this }
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

// Mock FocusContext
vi.mock('../../shell/FocusContext', () => ({
  useFocus: () => ({
    focus: null,
    setFocus: vi.fn(),
    clearFocus: vi.fn(),
  }),
}))

// Mock the DAL layer
vi.mock('../../db/dal', () => ({
  getWorks: vi.fn().mockResolvedValue([
    { id: 1, title: 'AoT', medium: 'anime', year: 2013, coverUrl: null, primaryScore: 9.6, comfortScore: null, consumptionMode: 'legitimacy', dateConsumed: null, notes: null },
  ]),
  getTropes: vi.fn().mockResolvedValue([
    { id: 1, name: 'political intrigue', category: 'premise_structural', description: '' },
  ]),
  getDimensions: vi.fn().mockResolvedValue([
    { id: 1, name: 'Incentive Coherence', weight: 5.0, isLoadBearing: 1, framework: 'primary', description: '' },
  ]),
  getAllWorkTropeLinks: vi.fn().mockResolvedValue([
    { id: 1, workId: 1, tropeId: 1, confidence: 0.95, source: 'seed' },
  ]),
  getAllTropeRelations: vi.fn().mockResolvedValue([]),
  getDiscoveryStates: vi.fn().mockResolvedValue([]),
}))

import { GalaxyView } from '../GalaxyView'

describe('GalaxyView', () => {
  it('shows loading state initially', () => {
    render(<GalaxyView />)
    expect(screen.getByText('Building galaxy...')).toBeInTheDocument()
  })

  it('renders the galaxy scene after loading', async () => {
    render(<GalaxyView />)
    await waitFor(() => {
      expect(screen.getByTestId('galaxy-scene')).toBeInTheDocument()
    })
  })

  it('renders the R3F canvas', async () => {
    render(<GalaxyView />)
    await waitFor(() => {
      expect(screen.getByTestId('r3f-canvas')).toBeInTheDocument()
    })
  })

  it('renders keyboard navigation overlay', async () => {
    render(<GalaxyView />)
    await waitFor(() => {
      expect(screen.getByTestId('galaxy-keyboard-overlay')).toBeInTheDocument()
    })
    const overlay = screen.getByTestId('galaxy-keyboard-overlay')
    expect(overlay).toHaveAttribute('role', 'img')
    expect(overlay).toHaveAttribute('aria-label', 'Galaxy graph. Use arrow keys to navigate nodes.')
    expect(overlay.tabIndex).toBe(0)
  })

  it('updates screen reader announcement on arrow key press', async () => {
    render(<GalaxyView />)
    await waitFor(() => {
      expect(screen.getByTestId('galaxy-keyboard-overlay')).toBeInTheDocument()
    })
    const overlay = screen.getByTestId('galaxy-keyboard-overlay')
    fireEvent.keyDown(overlay, { key: 'ArrowDown' })
    await waitFor(() => {
      const announce = screen.getByTestId('galaxy-sr-announce')
      expect(announce.textContent).not.toBe('')
    })
  })

  it('clears announcement on Escape', async () => {
    render(<GalaxyView />)
    await waitFor(() => {
      expect(screen.getByTestId('galaxy-keyboard-overlay')).toBeInTheDocument()
    })
    const overlay = screen.getByTestId('galaxy-keyboard-overlay')
    fireEvent.keyDown(overlay, { key: 'ArrowDown' })
    fireEvent.keyDown(overlay, { key: 'Escape' })
    await waitFor(() => {
      const announce = screen.getByTestId('galaxy-sr-announce')
      expect(announce.textContent).toBe('')
    })
  })
})
