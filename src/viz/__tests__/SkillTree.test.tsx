import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { SkillTree } from '../SkillTree'
import type { SkillTreeNode } from '../../types'

function makeNodes(): SkillTreeNode[] {
  return [
    // Root
    { id: 1, tropeId: null, parentNodeId: null, xpRequired: 0, xpCurrent: 0, state: 'completed', tier: 0 },
    // Category branches
    { id: 2, tropeId: null, parentNodeId: 1, xpRequired: 300, xpCurrent: 0, state: 'locked', tier: 1 },
    { id: 3, tropeId: null, parentNodeId: 1, xpRequired: 300, xpCurrent: 150, state: 'in_progress', tier: 1 },
    // Leaf nodes
    { id: 4, tropeId: 10, parentNodeId: 2, xpRequired: 200, xpCurrent: 0, state: 'locked', tier: 2 },
    { id: 5, tropeId: 11, parentNodeId: 3, xpRequired: 200, xpCurrent: 200, state: 'completed', tier: 2 },
    { id: 6, tropeId: 12, parentNodeId: 3, xpRequired: 200, xpCurrent: 400, state: 'mastered', tier: 2 },
  ]
}

describe('SkillTree', () => {
  it('renders an SVG element', () => {
    const { container } = render(<SkillTree nodes={makeNodes()} />)
    const svg = container.querySelector('svg')
    expect(svg).not.toBeNull()
  })

  it('renders correct number of node circles', () => {
    const nodes = makeNodes()
    const { container } = render(<SkillTree nodes={nodes} />)
    const circles = container.querySelectorAll('circle')
    // Each node has at least 1 circle, in_progress has an extra progress arc
    expect(circles.length).toBeGreaterThanOrEqual(nodes.length)
  })

  it('locked nodes have gray fill', () => {
    const { container } = render(<SkillTree nodes={makeNodes()} />)
    const circles = container.querySelectorAll('circle')
    // Find circles with gray fill (#4B5563)
    const grayCircles = Array.from(circles).filter(
      (c) => c.getAttribute('fill') === '#4B5563',
    )
    expect(grayCircles.length).toBeGreaterThanOrEqual(1)
  })

  it('completed nodes have green fill', () => {
    const { container } = render(<SkillTree nodes={makeNodes()} />)
    const circles = container.querySelectorAll('circle')
    const greenCircles = Array.from(circles).filter(
      (c) => c.getAttribute('fill') === '#22C55E',
    )
    expect(greenCircles.length).toBeGreaterThanOrEqual(1)
  })

  it('mastered nodes have gold fill with glow filter', () => {
    const { container } = render(<SkillTree nodes={makeNodes()} />)
    const circles = container.querySelectorAll('circle')
    const goldCircles = Array.from(circles).filter(
      (c) => c.getAttribute('fill') === '#EAB308',
    )
    expect(goldCircles.length).toBeGreaterThanOrEqual(1)
    // At least one gold circle should have the glow filter
    const glowing = goldCircles.filter(
      (c) => c.getAttribute('filter') === 'url(#glow-gold)',
    )
    expect(glowing.length).toBeGreaterThanOrEqual(1)
  })

  it('clicking a node calls onNodeClick', () => {
    const onNodeClick = vi.fn()
    const nodes = makeNodes()
    const { container } = render(
      <SkillTree nodes={nodes} onNodeClick={onNodeClick} />,
    )

    // Find a clickable group (role="button")
    const buttons = container.querySelectorAll('[role="button"]')
    expect(buttons.length).toBeGreaterThan(0)
    fireEvent.click(buttons[0])
    expect(onNodeClick).toHaveBeenCalledTimes(1)
  })
})
