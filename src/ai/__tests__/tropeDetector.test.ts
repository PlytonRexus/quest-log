import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { detectTropes, detectAndStoreTropes } from '../tropeDetector'

// Mock the singleton aiManager
vi.mock('../manager', async () => {
  const { AiManager } = await vi.importActual<typeof import('../manager')>('../manager')
  const mockManager = new AiManager()
  return { AiManager, aiManager: mockManager }
})

// Mock DAL functions
vi.mock('../../db/dal', () => ({
  getTropeByName: vi.fn(),
  insertTrope: vi.fn(),
  linkWorkTrope: vi.fn(),
}))

import { aiManager } from '../manager'
import { getTropeByName, insertTrope, linkWorkTrope } from '../../db/dal'

const mockGetTropeByName = vi.mocked(getTropeByName)
const mockInsertTrope = vi.mocked(insertTrope)
const mockLinkWorkTrope = vi.mocked(linkWorkTrope)

describe('detectTropes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock the classify method on the singleton
    vi.spyOn(aiManager, 'classify').mockResolvedValue([
      { label: 'cat-and-mouse escalation: Two adversaries engage in increasingly clever moves', score: 0.85 },
      { label: 'political intrigue: Complex power plays, alliances, and betrayals', score: 0.45 },
      { label: 'found family: Characters form familial bonds outside blood relations', score: 0.15 },
    ])
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns tropes above confidence threshold', async () => {
    const results = await detectTropes('A detective chases a criminal mastermind', {
      categories: ['premise_structural'],
      minConfidence: 0.3,
    })

    expect(results.length).toBeGreaterThan(0)
    for (const r of results) {
      expect(r.confidence).toBeGreaterThanOrEqual(0.3)
    }
  })

  it('filters out tropes below confidence threshold', async () => {
    const results = await detectTropes('A detective chases a criminal mastermind', {
      categories: ['premise_structural'],
      minConfidence: 0.3,
    })

    const lowConf = results.filter((r) => r.confidence < 0.3)
    expect(lowConf.length).toBe(0)
  })

  it('results are sorted by confidence descending', async () => {
    const results = await detectTropes('A detective chases a criminal mastermind', {
      categories: ['premise_structural'],
    })

    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].confidence).toBeGreaterThanOrEqual(results[i].confidence)
    }
  })

  it('respects maxTropesPerCategory', async () => {
    const results = await detectTropes('text', {
      categories: ['premise_structural'],
      maxTropesPerCategory: 1,
      minConfidence: 0.1,
    })

    expect(results.length).toBeLessThanOrEqual(1)
  })

  it('returns empty for empty text', async () => {
    const results = await detectTropes('')
    expect(results).toEqual([])
  })

  it('returns empty for whitespace-only text', async () => {
    const results = await detectTropes('   \n  ')
    expect(results).toEqual([])
  })

  it('each result has name, category, and confidence', async () => {
    const results = await detectTropes('A detective story', {
      categories: ['premise_structural'],
      minConfidence: 0.1,
    })

    for (const r of results) {
      expect(r.name).toBeTruthy()
      expect(r.category).toBeTruthy()
      expect(typeof r.confidence).toBe('number')
    }
  })
})

describe('detectAndStoreTropes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(aiManager, 'classify').mockResolvedValue([
      { label: 'cat-and-mouse escalation: Two adversaries engage in increasingly clever moves', score: 0.85 },
    ])
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('creates new tropes in DB when they do not exist', async () => {
    mockGetTropeByName.mockResolvedValue(null)
    mockInsertTrope.mockResolvedValue({
      id: 100, name: 'cat-and-mouse escalation',
      category: 'premise_structural', description: 'test',
    })
    mockLinkWorkTrope.mockResolvedValue({
      id: 1, workId: 1, tropeId: 100, confidence: 0.85, source: 'ai',
    })

    const result = await detectAndStoreTropes(1, 'A detective story', {
      categories: ['premise_structural'],
      minConfidence: 0.5,
    })

    expect(result.length).toBeGreaterThan(0)
    expect(mockInsertTrope).toHaveBeenCalled()
    expect(mockLinkWorkTrope).toHaveBeenCalled()
  })

  it('reuses existing tropes from DB', async () => {
    mockGetTropeByName.mockResolvedValue({
      id: 50, name: 'cat-and-mouse escalation',
      category: 'premise_structural', description: 'existing',
    })
    mockLinkWorkTrope.mockResolvedValue({
      id: 1, workId: 1, tropeId: 50, confidence: 0.85, source: 'ai',
    })

    await detectAndStoreTropes(1, 'A detective story', {
      categories: ['premise_structural'],
      minConfidence: 0.5,
    })

    expect(mockInsertTrope).not.toHaveBeenCalled()
    expect(mockLinkWorkTrope).toHaveBeenCalledWith(1, 50, expect.any(Number), 'ai')
  })
})
