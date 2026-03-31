import { describe, it, expect } from 'vitest'
import { buildGraphData, MEDIUM_COLORS, TROPE_CATEGORY_HEX } from '../graphMapper'
import type { GraphMapperInput } from '../graphMapper'
import type { Work, Trope, Dimension } from '../../types'

function makeWork(overrides: Partial<Work> = {}): Work {
  return {
    id: 1,
    title: 'Test Work',
    medium: 'film',
    year: 2020,
    coverUrl: null,
    primaryScore: 8.0,
    comfortScore: null,
    consumptionMode: 'legitimacy',
    dateConsumed: null,
    notes: null,
    ...overrides,
  }
}

function makeTrope(overrides: Partial<Trope> = {}): Trope {
  return {
    id: 1,
    name: 'test-trope',
    category: 'premise_structural',
    description: 'A test trope',
    ...overrides,
  }
}

function makeDimension(overrides: Partial<Dimension> = {}): Dimension {
  return {
    id: 1,
    name: 'Test Dimension',
    weight: 4.0,
    isLoadBearing: 0,
    framework: 'primary',
    description: 'A dimension',
    ...overrides,
  }
}

function emptyInput(): GraphMapperInput {
  return {
    works: [],
    tropes: [],
    dimensions: [],
    workTropeLinks: [],
    tropeRelations: [],
  }
}

describe('buildGraphData', () => {
  it('returns empty graph for empty input', () => {
    const result = buildGraphData(emptyInput())
    expect(result.nodes).toEqual([])
    expect(result.links).toEqual([])
  })

  it('creates work nodes with correct ids and colors', () => {
    const input: GraphMapperInput = {
      ...emptyInput(),
      works: [
        makeWork({ id: 1, title: 'Film Work', medium: 'film' }),
        makeWork({ id: 2, title: 'Anime Work', medium: 'anime' }),
        makeWork({ id: 3, title: 'Book Work', medium: 'book' }),
      ],
    }

    const result = buildGraphData(input)
    const workNodes = result.nodes.filter((n) => n.kind === 'work')

    expect(workNodes).toHaveLength(3)
    expect(workNodes[0].id).toBe('work:1')
    expect(workNodes[0].color).toBe(MEDIUM_COLORS.film)
    expect(workNodes[1].color).toBe(MEDIUM_COLORS.anime)
    expect(workNodes[2].color).toBe(MEDIUM_COLORS.book)
  })

  it('normalizes work node sizes by score', () => {
    const input: GraphMapperInput = {
      ...emptyInput(),
      works: [
        makeWork({ id: 1, primaryScore: 9.6 }),
        makeWork({ id: 2, primaryScore: 4.0 }),
        makeWork({ id: 3, primaryScore: 7.0 }),
      ],
    }

    const result = buildGraphData(input)
    const workNodes = result.nodes.filter((n) => n.kind === 'work')

    // Highest score gets size 1.0, lowest gets floor (0.15)
    expect(workNodes[0].size).toBe(1.0)
    expect(workNodes[1].size).toBe(0.15)
    expect(workNodes[2].size).toBeGreaterThan(0.15)
    expect(workNodes[2].size).toBeLessThan(1.0)
  })

  it('uses comfortScore when primaryScore is null', () => {
    const input: GraphMapperInput = {
      ...emptyInput(),
      works: [
        makeWork({ id: 1, primaryScore: null, comfortScore: 9.0 }),
      ],
    }

    const result = buildGraphData(input)
    expect(result.nodes[0].score).toBe(9.0)
  })

  it('creates trope nodes with category colors', () => {
    const input: GraphMapperInput = {
      ...emptyInput(),
      tropes: [
        makeTrope({ id: 1, category: 'premise_structural' }),
        makeTrope({ id: 2, category: 'character_archetype' }),
      ],
    }

    const result = buildGraphData(input)
    const tropeNodes = result.nodes.filter((n) => n.kind === 'trope')

    expect(tropeNodes).toHaveLength(2)
    expect(tropeNodes[0].color).toBe(TROPE_CATEGORY_HEX.premise_structural)
    expect(tropeNodes[1].color).toBe(TROPE_CATEGORY_HEX.character_archetype)
  })

  it('sizes trope nodes proportional to linked work count', () => {
    const input: GraphMapperInput = {
      ...emptyInput(),
      tropes: [
        makeTrope({ id: 1 }),
        makeTrope({ id: 2 }),
      ],
      workTropeLinks: [
        { id: 1, workId: 1, tropeId: 1, confidence: 0.9, source: 'seed' },
        { id: 2, workId: 2, tropeId: 1, confidence: 0.8, source: 'seed' },
        { id: 3, workId: 3, tropeId: 1, confidence: 0.7, source: 'seed' },
        { id: 4, workId: 1, tropeId: 2, confidence: 0.5, source: 'seed' },
      ],
    }

    const result = buildGraphData(input)
    const tropeNodes = result.nodes.filter((n) => n.kind === 'trope')

    // Trope 1 has 3 links, trope 2 has 1 link
    expect(tropeNodes[0].size).toBeGreaterThan(tropeNodes[1].size)
  })

  it('creates dimension anchor nodes in a ring with fixed positions', () => {
    const input: GraphMapperInput = {
      ...emptyInput(),
      dimensions: [
        makeDimension({ id: 1 }),
        makeDimension({ id: 2 }),
        makeDimension({ id: 3 }),
        makeDimension({ id: 4 }),
      ],
    }

    const result = buildGraphData(input)
    const dimNodes = result.nodes.filter((n) => n.kind === 'dimension')

    expect(dimNodes).toHaveLength(4)
    for (const node of dimNodes) {
      expect(node.size).toBe(1.0)
      expect(node.color).toBe('#FFFFFF')
      expect(node.fx).toBeDefined()
      expect(node.fy).toBe(0)
      expect(node.fz).toBeDefined()
    }

    // First anchor should be at angle 0 (positive x axis)
    expect(dimNodes[0].fx).toBeCloseTo(80, 0)
    expect(dimNodes[0].fz).toBeCloseTo(0, 0)
  })

  it('creates work-trope edges', () => {
    const input: GraphMapperInput = {
      ...emptyInput(),
      works: [makeWork({ id: 1 })],
      tropes: [makeTrope({ id: 10 })],
      workTropeLinks: [
        { id: 1, workId: 1, tropeId: 10, confidence: 0.9, source: 'seed' },
      ],
    }

    const result = buildGraphData(input)
    expect(result.links).toHaveLength(1)
    expect(result.links[0]).toEqual({
      source: 'work:1',
      target: 'trope:10',
      weight: 0.9,
      kind: 'work-trope',
    })
  })

  it('creates trope-trope edges', () => {
    const input: GraphMapperInput = {
      ...emptyInput(),
      tropes: [makeTrope({ id: 1 }), makeTrope({ id: 2 })],
      tropeRelations: [
        { id: 1, tropeAId: 1, tropeBId: 2, relationshipType: 'enhances', weight: 0.8 },
      ],
    }

    const result = buildGraphData(input)
    const tropeEdges = result.links.filter((l) => l.kind === 'trope-trope')
    expect(tropeEdges).toHaveLength(1)
    expect(tropeEdges[0].weight).toBe(0.8)
  })

  it('deduplicates edges', () => {
    const input: GraphMapperInput = {
      ...emptyInput(),
      works: [makeWork({ id: 1 })],
      tropes: [makeTrope({ id: 10 })],
      workTropeLinks: [
        { id: 1, workId: 1, tropeId: 10, confidence: 0.9, source: 'seed' },
        { id: 2, workId: 1, tropeId: 10, confidence: 0.8, source: 'ai' },
      ],
    }

    const result = buildGraphData(input)
    // Only one edge despite two links (deduplication)
    const workTropeEdges = result.links.filter((l) => l.kind === 'work-trope')
    expect(workTropeEdges).toHaveLength(1)
  })

  it('filters similarity edges below threshold 0.5', () => {
    const input: GraphMapperInput = {
      ...emptyInput(),
      works: [makeWork({ id: 1 }), makeWork({ id: 2 }), makeWork({ id: 3 })],
      similarityEdges: [
        { workIdA: 1, workIdB: 2, similarity: 0.8 },
        { workIdA: 1, workIdB: 3, similarity: 0.3 },
      ],
    }

    const result = buildGraphData(input)
    const simEdges = result.links.filter((l) => l.kind === 'work-work')
    expect(simEdges).toHaveLength(1)
    expect(simEdges[0].weight).toBe(0.8)
  })

  it('produces correct total node count', () => {
    const input: GraphMapperInput = {
      ...emptyInput(),
      works: [makeWork({ id: 1 }), makeWork({ id: 2 }), makeWork({ id: 3 })],
      tropes: [makeTrope({ id: 1 }), makeTrope({ id: 2 }), makeTrope({ id: 3 }), makeTrope({ id: 4 }), makeTrope({ id: 5 })],
      dimensions: [makeDimension({ id: 1 }), makeDimension({ id: 2 })],
    }

    const result = buildGraphData(input)
    expect(result.nodes).toHaveLength(3 + 5 + 2)
  })

  it('uses default color for unknown medium', () => {
    const input: GraphMapperInput = {
      ...emptyInput(),
      works: [makeWork({ id: 1, medium: 'podcast' })],
    }

    const result = buildGraphData(input)
    expect(result.nodes[0].color).toBe('#888888')
  })

  it('node ids follow kind:entityId format', () => {
    const input: GraphMapperInput = {
      ...emptyInput(),
      works: [makeWork({ id: 42 })],
      tropes: [makeTrope({ id: 7 })],
      dimensions: [makeDimension({ id: 3 })],
    }

    const result = buildGraphData(input)
    const ids = result.nodes.map((n) => n.id)
    expect(ids).toContain('work:42')
    expect(ids).toContain('trope:7')
    expect(ids).toContain('dim:3')
  })
})
