import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { resetDb } from '../../db/connection'
import { runMigrations } from '../../db/migrate'
import { insertTrope, insertTropeRelation } from '../../db/dal'
import { getAdjacentTropes } from '../adjacency'

describe('adjacency', () => {
  beforeEach(async () => {
    await resetDb()
    await runMigrations()
  })

  afterEach(async () => {
    await resetDb()
  })

  async function seedTropeGraph() {
    const t1 = await insertTrope({ name: 'political intrigue', category: 'premise_structural', description: 'Power struggles' })
    const t2 = await insertTrope({ name: 'institutional drama', category: 'premise_structural', description: 'Conflict within institutions' })
    const t3 = await insertTrope({ name: 'war of ideologies', category: 'premise_structural', description: 'Clash of worldviews' })
    const t4 = await insertTrope({ name: 'class warfare', category: 'premise_structural', description: 'Socioeconomic conflict' })
    const t5 = await insertTrope({ name: 'survival pressure', category: 'premise_structural', description: 'Existential threats' })

    // t1 -> t2, t1 -> t3
    await insertTropeRelation(t1.id, t2.id, 'enhances', 0.9)
    await insertTropeRelation(t1.id, t3.id, 'enhances', 0.85)
    // t2 -> t4 (so t4 is at distance 2 from t1)
    await insertTropeRelation(t2.id, t4.id, 'enhances', 0.8)
    // t5 is isolated (no relations)

    return { t1, t2, t3, t4, t5 }
  }

  it('returns relation-based neighbors at distance 1', async () => {
    const { t1, t2, t3 } = await seedTropeGraph()
    const adjacent = await getAdjacentTropes(t1.id, 1)

    const ids = adjacent.map((a) => a.tropeId)
    expect(ids).toContain(t2.id)
    expect(ids).toContain(t3.id)
    expect(adjacent.length).toBeGreaterThanOrEqual(2)
    expect(adjacent.every((a) => a.source === 'relation')).toBe(true)
  })

  it('excludes the source trope from results', async () => {
    const { t1 } = await seedTropeGraph()
    const adjacent = await getAdjacentTropes(t1.id)

    const ids = adjacent.map((a) => a.tropeId)
    expect(ids).not.toContain(t1.id)
  })

  it('returns second-hop neighbors with maxDistance 2', async () => {
    const { t1, t4 } = await seedTropeGraph()
    const adjacent = await getAdjacentTropes(t1.id, 2)

    const ids = adjacent.map((a) => a.tropeId)
    expect(ids).toContain(t4.id)
    const t4Entry = adjacent.find((a) => a.tropeId === t4.id)!
    expect(t4Entry.distance).toBe(2)
  })

  it('returns empty list for isolated trope', async () => {
    const { t5 } = await seedTropeGraph()
    const adjacent = await getAdjacentTropes(t5.id)

    expect(adjacent).toHaveLength(0)
  })
})
