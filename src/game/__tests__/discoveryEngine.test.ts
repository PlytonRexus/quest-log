import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { resetDb } from '../../db/connection'
import { runMigrations } from '../../db/migrate'
import {
  insertWork, insertTrope, linkWorkTrope, insertTropeRelation,
  getDiscoveryStates, getDiscoveryStateByTropeId, getUserProgress,
} from '../../db/dal'
import { initializeDiscoveryState, revealTropesForWork, getDiscoveryStats } from '../discoveryEngine'
import { exec } from '../../db/connection'

describe('discoveryEngine', () => {
  beforeEach(async () => {
    await resetDb()
    await runMigrations()
  })

  afterEach(async () => {
    await resetDb()
  })

  async function seedBasicData() {
    // Create userProgress row
    await exec(
      `INSERT INTO userProgress (totalXp, worksLogged, tropesDiscovered, fogPercentRevealed, lastActivity)
       VALUES (?, ?, ?, ?, ?)`,
      [0, 0, 0, 0.0, new Date().toISOString()],
    )

    // Create tropes
    const t1 = await insertTrope({ name: 'cat-and-mouse', category: 'premise_structural', description: 'Escalating exchanges' })
    const t2 = await insertTrope({ name: 'political intrigue', category: 'premise_structural', description: 'Power struggles' })
    const t3 = await insertTrope({ name: 'institutional drama', category: 'premise_structural', description: 'Conflict in institutions' })
    const t4 = await insertTrope({ name: 'class warfare', category: 'premise_structural', description: 'Socioeconomic conflict' })
    const t5 = await insertTrope({ name: 'morally grey antihero', category: 'character_archetype', description: 'Debatable morality' })

    // Relations: t2 -> t3, t2 -> t4
    await insertTropeRelation(t2.id, t3.id, 'enhances', 0.9)
    await insertTropeRelation(t2.id, t4.id, 'enhances', 0.8)

    // Create works with trope links
    const w1 = await insertWork({
      title: 'Death Note', medium: 'anime', year: 2006,
      coverUrl: null, primaryScore: 9.3, comfortScore: null,
      consumptionMode: 'legitimacy', dateConsumed: null, notes: null,
    })
    await linkWorkTrope(w1.id, t1.id, 0.98, 'seed')
    await linkWorkTrope(w1.id, t5.id, 0.95, 'seed')

    const w2 = await insertWork({
      title: 'Parasite', medium: 'film', year: 2019,
      coverUrl: null, primaryScore: 9.2, comfortScore: null,
      consumptionMode: 'legitimacy', dateConsumed: null, notes: null,
    })
    await linkWorkTrope(w2.id, t2.id, 0.95, 'seed')
    await linkWorkTrope(w2.id, t4.id, 0.85, 'seed')

    return { t1, t2, t3, t4, t5, w1, w2 }
  }

  it('initializeDiscoveryState creates hidden rows for all tropes', async () => {
    await seedBasicData()
    await initializeDiscoveryState()

    const states = await getDiscoveryStates()
    expect(states).toHaveLength(5)
    expect(states.every((s) => s.state === 'hidden')).toBe(true)
  })

  it('initializeDiscoveryState is idempotent', async () => {
    await seedBasicData()
    await initializeDiscoveryState()
    await initializeDiscoveryState()

    const states = await getDiscoveryStates()
    expect(states).toHaveLength(5)
  })

  it('revealTropesForWork reveals tropes linked to the work', async () => {
    const { w1, t1, t5 } = await seedBasicData()
    await initializeDiscoveryState()

    const result = await revealTropesForWork(w1.id)

    expect(result.revealed).toContain(t1.id)
    expect(result.revealed).toContain(t5.id)

    const s1 = await getDiscoveryStateByTropeId(t1.id)
    expect(s1!.state).toBe('revealed')
    expect(s1!.revealedBy).toBe(w1.id)
  })

  it('revealTropesForWork sets adjacent tropes to foggy', async () => {
    const { w2, t3 } = await seedBasicData()
    await initializeDiscoveryState()

    // w2 links to t2 and t4. t2 is related to t3, so t3 should become foggy.
    await revealTropesForWork(w2.id)

    const s3 = await getDiscoveryStateByTropeId(t3.id)
    expect(s3!.state).toBe('foggy')
  })

  it('does not downgrade revealed tropes', async () => {
    const { w1, w2, t1 } = await seedBasicData()
    await initializeDiscoveryState()

    // Reveal w1 first (reveals t1 and t5)
    await revealTropesForWork(w1.id)
    const beforeState = await getDiscoveryStateByTropeId(t1.id)
    expect(beforeState!.state).toBe('revealed')

    // Reveal w2 (should not affect t1)
    await revealTropesForWork(w2.id)
    const afterState = await getDiscoveryStateByTropeId(t1.id)
    expect(afterState!.state).toBe('revealed')
  })

  it('updates userProgress after reveal', async () => {
    const { w1 } = await seedBasicData()
    await initializeDiscoveryState()

    await revealTropesForWork(w1.id)

    const progress = await getUserProgress()
    expect(progress!.worksLogged).toBe(1)
    expect(progress!.tropesDiscovered).toBeGreaterThan(0)
    expect(progress!.fogPercentRevealed).toBeGreaterThan(0)
  })

  it('getDiscoveryStats returns correct counts', async () => {
    const { w1 } = await seedBasicData()
    await initializeDiscoveryState()
    await revealTropesForWork(w1.id)

    const stats = await getDiscoveryStats()
    expect(stats.total).toBe(5)
    expect(stats.revealed).toBe(2) // t1 and t5
    expect(stats.hidden + stats.foggy + stats.revealed).toBe(stats.total)
    expect(stats.percentRevealed).toBeCloseTo(40, 0)
  })

  it('revealTropesForWork is idempotent for same work', async () => {
    const { w1 } = await seedBasicData()
    await initializeDiscoveryState()

    await revealTropesForWork(w1.id)
    const second = await revealTropesForWork(w1.id)

    // Second call should not reveal any new tropes
    expect(second.revealed).toHaveLength(0)
    // worksLogged still increments (each call is a log event)
    const progress = await getUserProgress()
    expect(progress!.worksLogged).toBe(2)
  })

  it('returns correct revealed and foggy arrays', async () => {
    const { w2, t2, t3, t4 } = await seedBasicData()
    await initializeDiscoveryState()

    const result = await revealTropesForWork(w2.id)

    // w2 links to t2 and t4, both should be revealed
    expect(result.revealed).toContain(t2.id)
    expect(result.revealed).toContain(t4.id)
    // t3 is adjacent to t2 via relation, should be foggy
    expect(result.foggy).toContain(t3.id)
    // No overlap between revealed and foggy
    for (const id of result.revealed) {
      expect(result.foggy).not.toContain(id)
    }
  })
})
