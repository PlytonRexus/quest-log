import { describe, it, expect } from 'vitest'
import { buildGraphData } from '../graphMapper'
import type { Work, Trope, Dimension, WorkTrope, TropeRelation } from '../../types'

function makeWork(id: number, title: string): Work {
  return {
    id, title, medium: 'film', year: 2020, coverUrl: null,
    primaryScore: 8.0, comfortScore: null, consumptionMode: 'legitimacy',
    dateConsumed: null, notes: null,
  }
}

function makeTrope(id: number, name: string, category = 'premise_structural'): Trope {
  return { id, name, category, description: null }
}

function makeInput(overrides: {
  tropes?: Trope[]
  fogStateMap?: Map<number, string>
  workTropeLinks?: WorkTrope[]
  tropeRelations?: TropeRelation[]
}) {
  return {
    works: [makeWork(1, 'Test Film')],
    tropes: overrides.tropes ?? [
      makeTrope(1, 'political intrigue'),
      makeTrope(2, 'class warfare'),
      makeTrope(3, 'found family'),
    ],
    dimensions: [] as Dimension[],
    workTropeLinks: overrides.workTropeLinks ?? [
      { id: 1, workId: 1, tropeId: 1, confidence: 0.9, source: 'seed' },
      { id: 2, workId: 1, tropeId: 2, confidence: 0.8, source: 'seed' },
    ],
    tropeRelations: overrides.tropeRelations ?? [],
    fogStateMap: overrides.fogStateMap,
  }
}

describe('fog of war in graphMapper', () => {
  it('excludes hidden tropes when fogStateMap is provided', () => {
    const fogStateMap = new Map<number, string>([
      [1, 'revealed'],
      [2, 'hidden'],
      [3, 'foggy'],
    ])
    const result = buildGraphData(makeInput({ fogStateMap }))
    const tropeNodes = result.nodes.filter((n) => n.kind === 'trope')

    expect(tropeNodes.map((n) => n.entityId)).toContain(1)
    expect(tropeNodes.map((n) => n.entityId)).not.toContain(2)
    expect(tropeNodes.map((n) => n.entityId)).toContain(3)
  })

  it('dims foggy trope colors', () => {
    const fogStateMap = new Map<number, string>([
      [1, 'revealed'],
      [2, 'foggy'],
    ])
    const input = makeInput({
      tropes: [makeTrope(1, 'a'), makeTrope(2, 'b')],
      fogStateMap,
    })
    const result = buildGraphData(input)
    const tropeNodes = result.nodes.filter((n) => n.kind === 'trope')
    const revealed = tropeNodes.find((n) => n.entityId === 1)!
    const foggy = tropeNodes.find((n) => n.entityId === 2)!

    // Foggy color should be darker than revealed color
    expect(foggy.color).not.toBe(revealed.color)
    expect(foggy.discoveryState).toBe('foggy')
    expect(revealed.discoveryState).toBe('revealed')
  })

  it('renders revealed tropes at full color', () => {
    const fogStateMap = new Map<number, string>([[1, 'revealed']])
    const input = makeInput({
      tropes: [makeTrope(1, 'a', 'premise_structural')],
      fogStateMap,
    })
    const result = buildGraphData(input)
    const node = result.nodes.find((n) => n.kind === 'trope')!

    // premise_structural color is #3B82F6
    expect(node.color).toBe('#3B82F6')
  })

  it('renders all tropes normally when fogStateMap is not provided', () => {
    const input = makeInput({})
    const result = buildGraphData(input)
    const tropeNodes = result.nodes.filter((n) => n.kind === 'trope')

    expect(tropeNodes).toHaveLength(3)
    expect(tropeNodes.every((n) => n.discoveryState === undefined)).toBe(true)
  })

  it('filters out edges referencing hidden trope nodes', () => {
    const fogStateMap = new Map<number, string>([
      [1, 'revealed'],
      [2, 'hidden'],
      [3, 'revealed'],
    ])
    const input = makeInput({
      fogStateMap,
      workTropeLinks: [
        { id: 1, workId: 1, tropeId: 1, confidence: 0.9, source: 'seed' },
        { id: 2, workId: 1, tropeId: 2, confidence: 0.8, source: 'seed' },
      ],
    })
    const result = buildGraphData(input)

    // Edge to trope 2 should be filtered out since trope 2 is hidden
    const edgeToHidden = result.links.find((l) => l.target === 'trope:2')
    expect(edgeToHidden).toBeUndefined()

    // Edge to trope 1 should still exist
    const edgeToRevealed = result.links.find((l) => l.target === 'trope:1')
    expect(edgeToRevealed).toBeDefined()
  })
})
