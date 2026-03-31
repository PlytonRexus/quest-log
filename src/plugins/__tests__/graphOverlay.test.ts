import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  addOverlayNodes,
  addOverlayLinks,
  removeOverlayNodes,
  removeOverlayLinks,
  getOverlay,
  onOverlayChange,
  resetOverlay,
} from '../graphOverlay'
import type { GraphNode, GraphLink } from '../../viz/types'

function makeNode(id: string, label: string): GraphNode {
  return { id, kind: 'work', label, color: '#fff', size: 1, entityId: 0 }
}

function makeLink(source: string, target: string): GraphLink {
  return { source, target, weight: 1, kind: 'work-trope' }
}

describe('graphOverlay', () => {
  beforeEach(() => {
    resetOverlay()
  })

  it('starts empty', () => {
    const { nodes, links } = getOverlay()
    expect(nodes).toHaveLength(0)
    expect(links).toHaveLength(0)
  })

  it('adds nodes with plugin-prefixed ids', () => {
    addOverlayNodes('myPlugin', [makeNode('n1', 'Node 1')])
    const { nodes } = getOverlay()
    expect(nodes).toHaveLength(1)
    expect(nodes[0].id).toBe('myPlugin:n1')
    expect(nodes[0].label).toBe('Node 1')
  })

  it('adds links with plugin-prefixed ids', () => {
    addOverlayLinks('myPlugin', [makeLink('n1', 'n2')])
    const { links } = getOverlay()
    expect(links).toHaveLength(1)
    expect(links[0].source).toBe('myPlugin:n1')
    expect(links[0].target).toBe('myPlugin:n2')
  })

  it('removes nodes by id', () => {
    addOverlayNodes('p', [makeNode('a', 'A'), makeNode('b', 'B')])
    removeOverlayNodes('p', ['a'])
    const { nodes } = getOverlay()
    expect(nodes).toHaveLength(1)
    expect(nodes[0].id).toBe('p:b')
  })

  it('removes links referencing removed node ids', () => {
    addOverlayNodes('p', [makeNode('a', 'A'), makeNode('b', 'B')])
    addOverlayLinks('p', [makeLink('a', 'b')])
    removeOverlayLinks('p', ['a'])
    const { links } = getOverlay()
    expect(links).toHaveLength(0)
  })

  it('notifies listeners on change', () => {
    const listener = vi.fn()
    const unsub = onOverlayChange(listener)
    addOverlayNodes('p', [makeNode('x', 'X')])
    expect(listener).toHaveBeenCalledTimes(1)
    removeOverlayNodes('p', ['x'])
    expect(listener).toHaveBeenCalledTimes(2)
    unsub()
    addOverlayNodes('p', [makeNode('y', 'Y')])
    expect(listener).toHaveBeenCalledTimes(2) // no more calls after unsubscribe
  })

  it('isolates plugins by id prefix', () => {
    addOverlayNodes('pluginA', [makeNode('n1', 'A1')])
    addOverlayNodes('pluginB', [makeNode('n1', 'B1')])
    const { nodes } = getOverlay()
    expect(nodes).toHaveLength(2)
    removeOverlayNodes('pluginA', ['n1'])
    const after = getOverlay()
    expect(after.nodes).toHaveLength(1)
    expect(after.nodes[0].label).toBe('B1')
  })
})
