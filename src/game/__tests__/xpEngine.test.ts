import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { resetDb } from '../../db/connection'
import { runMigrations } from '../../db/migrate'
import {
  insertWork, insertTrope, linkWorkTrope, insertReview,
  insertSkillTreeNode, getSkillTreeNodeByTrope,
  getUserProgress,
} from '../../db/dal'
import { exec } from '../../db/connection'
import { initializeDiscoveryState } from '../discoveryEngine'
import { calculateXpForWork, awardXp, getMasteryStatus } from '../xpEngine'

describe('xpEngine', () => {
  beforeEach(async () => {
    await resetDb()
    await runMigrations()
    // Create userProgress row
    await exec(
      `INSERT INTO userProgress (totalXp, worksLogged, tropesDiscovered, fogPercentRevealed, lastActivity)
       VALUES (?, ?, ?, ?, ?)`,
      [0, 0, 0, 0.0, new Date().toISOString()],
    )
  })

  afterEach(async () => {
    await resetDb()
  })

  async function seedForXp() {
    const t1 = await insertTrope({ name: 'cat-and-mouse', category: 'premise_structural', description: 'Tactical exchanges' })
    const t2 = await insertTrope({ name: 'broken genius', category: 'character_archetype', description: 'Brilliant but broken' })
    const t3 = await insertTrope({ name: 'building dread', category: 'pacing_mechanic', description: 'Mounting tension' })

    // Create skill tree nodes for these tropes
    await insertSkillTreeNode({ tropeId: t1.id, parentNodeId: null, xpRequired: 200, xpCurrent: 0, state: 'locked', tier: 2 })
    await insertSkillTreeNode({ tropeId: t2.id, parentNodeId: null, xpRequired: 200, xpCurrent: 0, state: 'locked', tier: 2 })
    await insertSkillTreeNode({ tropeId: t3.id, parentNodeId: null, xpRequired: 200, xpCurrent: 0, state: 'locked', tier: 2 })

    const w1 = await insertWork({
      title: 'Death Note', medium: 'anime', year: 2006,
      coverUrl: null, primaryScore: 9.3, comfortScore: null,
      consumptionMode: 'legitimacy', dateConsumed: null, notes: null,
    })
    await linkWorkTrope(w1.id, t1.id, 0.98, 'seed')
    await linkWorkTrope(w1.id, t2.id, 0.9, 'seed')

    await initializeDiscoveryState()

    return { t1, t2, t3, w1 }
  }

  it('calculateXpForWork returns base 100 with high novelty for first work in genre', async () => {
    const { w1 } = await seedForXp()
    const breakdown = await calculateXpForWork(w1.id)

    expect(breakdown.baseXp).toBe(100)
    // First anime work: noveltyMultiplier = 1 + 1/(1+0) = 2.0
    expect(breakdown.noveltyMultiplier).toBe(2.0)
    expect(breakdown.depthMultiplier).toBe(1.0) // no reviews
    expect(breakdown.totalXp).toBe(200)
  })

  it('noveltyMultiplier decreases with more works in same genre', async () => {
    const { w1 } = await seedForXp()
    // Add more anime works
    for (let i = 0; i < 4; i++) {
      await insertWork({
        title: `Anime ${i}`, medium: 'anime', year: 2020 + i,
        coverUrl: null, primaryScore: 7.0, comfortScore: null,
        consumptionMode: 'legitimacy', dateConsumed: null, notes: null,
      })
    }
    const breakdown = await calculateXpForWork(w1.id)

    // 4 other anime works: noveltyMultiplier = 1 + 1/(1+4) = 1.2
    expect(breakdown.noveltyMultiplier).toBeCloseTo(1.2, 1)
  })

  it('depthMultiplier increases with review word count', async () => {
    const { w1 } = await seedForXp()
    // Add a 500-word review
    const reviewText = Array(500).fill('word').join(' ')
    await insertReview({
      workId: w1.id, rawMarkdown: reviewText,
      parsedMetadata: null, importedFrom: null,
      createdAt: new Date().toISOString(),
    })

    const breakdown = await calculateXpForWork(w1.id)
    // 500 words: depthMultiplier = 1 + 500/1000 = 1.5
    expect(breakdown.depthMultiplier).toBeCloseTo(1.5, 1)
    expect(breakdown.totalXp).toBeGreaterThan(100)
  })

  it('depthMultiplier is 1.0 with no reviews', async () => {
    const { w1 } = await seedForXp()
    const breakdown = await calculateXpForWork(w1.id)
    expect(breakdown.depthMultiplier).toBe(1.0)
  })

  it('awardXp distributes XP to skill tree nodes for work tropes', async () => {
    const { w1, t1, t2 } = await seedForXp()
    await awardXp(w1.id)

    const node1 = await getSkillTreeNodeByTrope(t1.id)
    const node2 = await getSkillTreeNodeByTrope(t2.id)

    expect(node1!.xpCurrent).toBeGreaterThan(0)
    expect(node2!.xpCurrent).toBeGreaterThan(0)
  })

  it('awardXp updates userProgress.totalXp', async () => {
    const { w1 } = await seedForXp()
    const result = await awardXp(w1.id)

    const progress = await getUserProgress()
    expect(progress!.totalXp).toBe(result.xpAwarded)
    expect(result.newTotal).toBe(result.xpAwarded)
  })

  it('awardXp transitions node from locked to in_progress', async () => {
    const { w1, t1 } = await seedForXp()
    const before = await getSkillTreeNodeByTrope(t1.id)
    expect(before!.state).toBe('locked')

    const result = await awardXp(w1.id)

    const after = await getSkillTreeNodeByTrope(t1.id)
    expect(after!.state).toBe('in_progress')
    expect(result.nodesProgressed.length).toBeGreaterThan(0)
  })

  it('awardXp transitions node to completed when xpCurrent >= xpRequired', async () => {
    const { t1 } = await seedForXp()

    // Create a work that will give enough XP to complete the node
    const w2 = await insertWork({
      title: 'AoT', medium: 'film', year: 2013,
      coverUrl: null, primaryScore: 9.6, comfortScore: null,
      consumptionMode: 'legitimacy', dateConsumed: null, notes: null,
    })
    await linkWorkTrope(w2.id, t1.id, 0.95, 'seed')

    // Pre-fill the node to be close to completion (xpRequired=200)
    const node = await getSkillTreeNodeByTrope(t1.id)
    await import('../../db/dal').then(({ updateSkillTreeNode }) =>
      updateSkillTreeNode(node!.id, { xpCurrent: 180, state: 'in_progress' }),
    )

    const result = await awardXp(w2.id)

    const after = await getSkillTreeNodeByTrope(t1.id)
    expect(after!.state).toBe('completed')
    expect(after!.xpCurrent).toBeGreaterThanOrEqual(200)
    expect(result.nodesCompleted.length).toBeGreaterThan(0)
  })

  it('getMasteryStatus returns correct percentComplete', async () => {
    const { t1 } = await seedForXp()
    const node = await getSkillTreeNodeByTrope(t1.id)
    await import('../../db/dal').then(({ updateSkillTreeNode }) =>
      updateSkillTreeNode(node!.id, { xpCurrent: 100, state: 'in_progress' }),
    )

    const status = await getMasteryStatus(t1.id)
    expect(status.xpCurrent).toBe(100)
    expect(status.xpRequired).toBe(200)
    expect(status.percentComplete).toBe(50)
    expect(status.state).toBe('in_progress')
  })
})
