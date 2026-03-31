import { describe, it, expect } from 'vitest'
import {
  TROPE_DICT,
  getTropesByCategory,
  buildLabelsForBatch,
  chunkArray,
  type TropeCategory,
} from '../tropeDict'

// The 28 seed tropes from Session 1 that must be present in the dictionary
const SEED_TROPE_NAMES = [
  'cat-and-mouse escalation', 'political intrigue', 'class warfare',
  'epic with intimate core', 'time manipulation', 'cosmic scale',
  'chosen one (justified)', 'found family', 'locked room mystery',
  'institutional drama', 'war of ideologies', 'survival pressure',
  'morally grey antihero', 'broken genius', 'competent-from-pain',
  'villain-who-believes-hero', 'intelligent underdog',
  'emotionally functional protagonist', 'competent ensemble',
  'wisened mentor', 'tragic strategist',
  'slow burn with pressurization', 'rapid-fire tactical dialogue',
  'ticking clock', 'loop-and-escalate', 'episodic payoff',
  'tight structure (no waste)', 'building dread',
]

describe('tropeDict', () => {
  it('contains at least 200 tropes', () => {
    expect(TROPE_DICT.length).toBeGreaterThanOrEqual(200)
  })

  it('all tropes have name, category, and description', () => {
    for (const trope of TROPE_DICT) {
      expect(trope.name).toBeTruthy()
      expect(trope.category).toBeTruthy()
      expect(trope.description).toBeTruthy()
      expect(trope.aliases).toBeInstanceOf(Array)
    }
  })

  it('has no duplicate trope names', () => {
    const names = TROPE_DICT.map((t) => t.name)
    const uniqueNames = new Set(names)
    expect(uniqueNames.size).toBe(names.length)
  })

  it('all categories are valid', () => {
    const validCategories: TropeCategory[] = [
      'premise_structural', 'character_archetype', 'pacing_mechanic',
      'emotional_dynamic', 'world_building', 'narrative_technique',
      'relationship_pattern', 'conflict_type',
    ]
    for (const trope of TROPE_DICT) {
      expect(validCategories).toContain(trope.category)
    }
  })

  it('contains all 28 seed tropes', () => {
    const dictNames = new Set(TROPE_DICT.map((t) => t.name))
    for (const name of SEED_TROPE_NAMES) {
      expect(dictNames.has(name)).toBe(true)
    }
  })

  it('has tropes in every category', () => {
    const categories = getTropesByCategory()
    expect(categories.size).toBe(8)
    for (const [, tropes] of categories) {
      expect(tropes.length).toBeGreaterThan(0)
    }
  })

  it('each category has at least 15 tropes', () => {
    const categories = getTropesByCategory()
    for (const [cat, tropes] of categories) {
      expect(tropes.length, `${cat} has too few tropes`).toBeGreaterThanOrEqual(15)
    }
  })
})

describe('buildLabelsForBatch', () => {
  it('formats labels as name: description', () => {
    const labels = buildLabelsForBatch(TROPE_DICT.slice(0, 3))
    expect(labels.length).toBe(3)
    for (const label of labels) {
      expect(label).toContain(':')
    }
  })
})

describe('chunkArray', () => {
  it('splits array into chunks of given size', () => {
    const chunks = chunkArray([1, 2, 3, 4, 5], 2)
    expect(chunks).toEqual([[1, 2], [3, 4], [5]])
  })

  it('handles empty array', () => {
    expect(chunkArray([], 3)).toEqual([])
  })

  it('handles array smaller than chunk size', () => {
    expect(chunkArray([1, 2], 5)).toEqual([[1, 2]])
  })

  it('handles exact multiple', () => {
    expect(chunkArray([1, 2, 3, 4], 2)).toEqual([[1, 2], [3, 4]])
  })
})
