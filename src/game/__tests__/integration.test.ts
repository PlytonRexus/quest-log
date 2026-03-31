import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { resetDb } from '../../db/connection'
import { runMigrations } from '../../db/migrate'
import {
  insertWork, insertTrope, linkWorkTrope, insertTropeRelation,
  getUserProgress, getDiscoveryStateByTropeId,
} from '../../db/dal'
import { exec } from '../../db/connection'
import { initializeDiscoveryState, getDiscoveryStats } from '../discoveryEngine'
import { buildSkillTree } from '../skillTree'
import { awardXp } from '../xpEngine'
import { checkAchievements } from '../achievements'

describe('gamification integration', () => {
  beforeEach(async () => {
    await resetDb()
    await runMigrations()
    await exec(
      `INSERT INTO userProgress (totalXp, worksLogged, tropesDiscovered, fogPercentRevealed, lastActivity)
       VALUES (?, ?, ?, ?, ?)`,
      [0, 0, 0, 0.0, new Date().toISOString()],
    )
  })

  afterEach(async () => {
    await resetDb()
  })

  async function seedFullScenario() {
    const t1 = await insertTrope({ name: 'cat-and-mouse', category: 'premise_structural', description: '' })
    const t2 = await insertTrope({ name: 'political intrigue', category: 'premise_structural', description: '' })
    const t3 = await insertTrope({ name: 'morally grey antihero', category: 'character_archetype', description: '' })
    const t4 = await insertTrope({ name: 'broken genius', category: 'character_archetype', description: '' })
    const t5 = await insertTrope({ name: 'slow burn', category: 'pacing_mechanic', description: '' })

    await insertTropeRelation(t1.id, t2.id, 'enhances', 0.9)
    await insertTropeRelation(t3.id, t4.id, 'related', 0.8)

    const w1 = await insertWork({
      title: 'Death Note', medium: 'anime', year: 2006,
      coverUrl: null, primaryScore: 9.3, comfortScore: null,
      consumptionMode: 'legitimacy', dateConsumed: null, notes: null,
    })
    await linkWorkTrope(w1.id, t1.id, 0.98, 'seed')
    await linkWorkTrope(w1.id, t3.id, 0.95, 'seed')

    const w2 = await insertWork({
      title: 'Parasite', medium: 'film', year: 2019,
      coverUrl: null, primaryScore: 9.2, comfortScore: null,
      consumptionMode: 'legitimacy', dateConsumed: null, notes: null,
    })
    await linkWorkTrope(w2.id, t2.id, 0.95, 'seed')
    await linkWorkTrope(w2.id, t5.id, 0.85, 'seed')

    const w3 = await insertWork({
      title: 'Code Geass', medium: 'anime', year: 2006,
      coverUrl: null, primaryScore: 8.8, comfortScore: null,
      consumptionMode: 'legitimacy', dateConsumed: null, notes: null,
    })
    await linkWorkTrope(w3.id, t1.id, 0.9, 'seed')
    await linkWorkTrope(w3.id, t4.id, 0.85, 'seed')

    await initializeDiscoveryState()
    await buildSkillTree()

    return { t1, t2, t3, t4, t5, w1, w2, w3 }
  }

  it('full flow: log work -> reveal tropes -> award XP -> check achievements', async () => {
    const { w1, t1, t2, t3 } = await seedFullScenario()

    // Award XP for first work
    const result = await awardXp(w1.id)

    // XP awarded
    expect(result.xpAwarded).toBeGreaterThan(0)
    const progress = await getUserProgress()
    expect(progress!.totalXp).toBe(result.xpAwarded)

    // Tropes revealed
    expect(result.revealed).toContain(t1.id)
    expect(result.revealed).toContain(t3.id)
    const s1 = await getDiscoveryStateByTropeId(t1.id)
    expect(s1!.state).toBe('revealed')

    // Adjacent tropes should be foggy (t2 adjacent to t1, t4 adjacent to t3)
    const s2 = await getDiscoveryStateByTropeId(t2.id)
    expect(s2!.state).toBe('foggy')

    // Check achievements
    const stats = await getDiscoveryStats()
    const earned = checkAchievements(progress!, stats, [])
    const ids = earned.map((a) => a.id)
    expect(ids).toContain('first_discovery')
  })

  it('multiple works build cumulative progress', async () => {
    const { w1, w2, w3 } = await seedFullScenario()

    // Award XP for three works sequentially
    const r1 = await awardXp(w1.id)
    const s1 = await getDiscoveryStats()

    const r2 = await awardXp(w2.id)
    const s2 = await getDiscoveryStats()

    const r3 = await awardXp(w3.id)
    const s3 = await getDiscoveryStats()

    // XP increases monotonically
    expect(r1.newTotal).toBeLessThan(r2.newTotal)
    expect(r2.newTotal).toBeLessThan(r3.newTotal)

    // Revealed tropes increase
    expect(s1.revealed).toBeLessThanOrEqual(s2.revealed)
    expect(s2.revealed).toBeLessThanOrEqual(s3.revealed)

    // Fog percentage increases
    expect(s1.percentRevealed).toBeLessThanOrEqual(s2.percentRevealed)
    expect(s2.percentRevealed).toBeLessThanOrEqual(s3.percentRevealed)

    // Final progress reflects all three works
    const finalProgress = await getUserProgress()
    expect(finalProgress!.worksLogged).toBe(3)
    expect(finalProgress!.totalXp).toBe(r3.newTotal)
  })
})
