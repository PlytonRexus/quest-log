import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { GraphNode } from '../types'

vi.mock('@react-three/drei', () => ({
  Html: ({ children }: { children: React.ReactNode }) => <div data-testid="html-overlay">{children}</div>,
}))

import { NodeTooltip } from '../NodeTooltip'

describe('NodeTooltip', () => {
  it('renders work node label', () => {
    const node: GraphNode = {
      id: 'work:1', kind: 'work', label: 'Attack on Titan',
      color: '#AB47BC', size: 1.0, entityId: 1,
      medium: 'anime', score: 9.6, x: 0, y: 0, z: 0,
    }
    render(<NodeTooltip node={node} />)
    expect(screen.getByText('Attack on Titan')).toBeInTheDocument()
  })

  it('shows medium for work nodes', () => {
    const node: GraphNode = {
      id: 'work:1', kind: 'work', label: 'Dune',
      color: '#4FC3F7', size: 0.8, entityId: 1,
      medium: 'film', score: 9.1, x: 0, y: 0, z: 0,
    }
    render(<NodeTooltip node={node} />)
    expect(screen.getByText('film')).toBeInTheDocument()
  })

  it('shows score for work nodes', () => {
    const node: GraphNode = {
      id: 'work:1', kind: 'work', label: 'Dune',
      color: '#4FC3F7', size: 0.8, entityId: 1,
      score: 9.1, x: 0, y: 0, z: 0,
    }
    render(<NodeTooltip node={node} />)
    expect(screen.getByText('Score: 9.1')).toBeInTheDocument()
  })

  it('shows category for trope nodes', () => {
    const node: GraphNode = {
      id: 'trope:1', kind: 'trope', label: 'political intrigue',
      color: '#3B82F6', size: 0.5, entityId: 1,
      category: 'premise_structural', x: 0, y: 0, z: 0,
    }
    render(<NodeTooltip node={node} />)
    expect(screen.getByText('political intrigue')).toBeInTheDocument()
    expect(screen.getByText('premise structural')).toBeInTheDocument()
  })

  it('shows kind label', () => {
    const node: GraphNode = {
      id: 'dim:1', kind: 'dimension', label: 'Incentive Coherence',
      color: '#FFFFFF', size: 1.0, entityId: 1, x: 0, y: 0, z: 0,
    }
    render(<NodeTooltip node={node} />)
    expect(screen.getByText('Dimension')).toBeInTheDocument()
  })
})
