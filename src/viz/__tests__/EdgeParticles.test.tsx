import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import type { GraphLink, GraphNode } from '../types'

vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}))

import { EdgeParticles } from '../EdgeParticles'

function makeNodeMap(): Map<string, GraphNode> {
  const map = new Map<string, GraphNode>()
  map.set('work:1', { id: 'work:1', kind: 'work', label: 'AoT', color: '#AB47BC', size: 1.0, entityId: 1, x: 0, y: 0, z: 0 })
  map.set('trope:1', { id: 'trope:1', kind: 'trope', label: 'intrigue', color: '#3B82F6', size: 0.5, entityId: 1, x: 10, y: 5, z: 0 })
  return map
}

function makeLinks(): GraphLink[] {
  return [
    { source: 'work:1', target: 'trope:1', weight: 0.9, kind: 'work-trope' },
  ]
}

describe('EdgeParticles', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <EdgeParticles links={makeLinks()} nodeMap={makeNodeMap()} />,
    )
    expect(container).toBeTruthy()
  })

  it('returns null for empty links', () => {
    const { container } = render(
      <EdgeParticles links={[]} nodeMap={makeNodeMap()} />,
    )
    expect(container.innerHTML).toBe('')
  })

  it('accepts custom particle count', () => {
    const { container } = render(
      <EdgeParticles links={makeLinks()} nodeMap={makeNodeMap()} particleCount={50} />,
    )
    expect(container).toBeTruthy()
  })
})
