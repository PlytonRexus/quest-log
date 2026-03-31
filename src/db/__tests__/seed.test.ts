import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { resetDb } from '../connection'
import { runMigrations } from '../migrate'
import {
  seedDimensions, seedWorks, seedTropes,
  seedWorkTropeLinks, seedTropeRelations, runSeed,
} from '../seed'
import {
  getDimensions, getLoadBearingDimensions,
  getWorks, getTropes, getTropesForWork,
  getRelatedTropes, getOverallStats,
} from '../dal'

describe('seed', () => {
  beforeEach(async () => {
    await resetDb()
    await runMigrations()
  })

  afterEach(async () => {
    await resetDb()
  })

  it('seedDimensions inserts 19 dimensions', async () => {
    await seedDimensions()
    const all = await getDimensions()
    expect(all).toHaveLength(19)
  })

  it('has exactly 12 primary and 7 comfort dimensions', async () => {
    await seedDimensions()
    const primary = await getDimensions('primary')
    const comfort = await getDimensions('comfort')
    expect(primary).toHaveLength(12)
    expect(comfort).toHaveLength(7)
  })

  it('has exactly 3 load-bearing dimensions', async () => {
    await seedDimensions()
    const lb = await getLoadBearingDimensions()
    expect(lb).toHaveLength(3)
    const names = lb.map((d) => d.name)
    expect(names).toContain('Incentive Coherence')
    expect(names).toContain('World Causality & Internal Logic')
    expect(names).toContain('Power Justification')
  })

  it('seedWorks inserts 28 works', async () => {
    await seedWorks()
    const works = await getWorks()
    expect(works).toHaveLength(28)
  })

  it('primary works have legitimacy mode, comfort works have hospitality', async () => {
    await seedWorks()
    const works = await getWorks()
    const legitimacy = works.filter((w) => w.consumptionMode === 'legitimacy')
    const hospitality = works.filter((w) => w.consumptionMode === 'hospitality')
    expect(legitimacy).toHaveLength(15)
    expect(hospitality).toHaveLength(13)
  })

  it('seedTropes inserts 28 tropes across 3 categories', async () => {
    await seedTropes()
    const all = await getTropes()
    expect(all).toHaveLength(28)

    const premise = await getTropes('premise_structural')
    const archetype = await getTropes('character_archetype')
    const pacing = await getTropes('pacing_mechanic')

    expect(premise.length).toBeGreaterThanOrEqual(10)
    expect(archetype.length).toBeGreaterThanOrEqual(8)
    expect(pacing.length).toBeGreaterThanOrEqual(6)
  })

  it('seedWorkTropeLinks connects works to tropes', async () => {
    await seedWorks()
    await seedTropes()
    await seedWorkTropeLinks()

    const works = await getWorks()
    const aot = works.find((w) => w.title === 'Attack on Titan')!
    const tropes = await getTropesForWork(aot.id)

    expect(tropes.length).toBeGreaterThan(0)
    const tropeNames = tropes.map((t) => t.name)
    expect(tropeNames).toContain('political intrigue')
    expect(tropeNames).toContain('morally grey antihero')
  })

  it('seedTropeRelations connects related tropes', async () => {
    await seedTropes()
    await seedTropeRelations()

    const tropes = await getTropes()
    const politicalIntrigue = tropes.find((t) => t.name === 'political intrigue')!
    const related = await getRelatedTropes(politicalIntrigue.id)

    expect(related.length).toBeGreaterThan(0)
    const relatedNames = related.map((r) => r.name)
    expect(relatedNames).toContain('institutional drama')
  })

  it('runSeed is idempotent', async () => {
    await runSeed()
    const firstCount = (await getWorks()).length
    await runSeed() // should be a no-op
    const secondCount = (await getWorks()).length
    expect(secondCount).toBe(firstCount)
  })

  it('getOverallStats after seeding returns correct totals', async () => {
    await runSeed()
    const stats = await getOverallStats()
    expect(stats.totalWorks).toBe(28)
    expect(stats.totalTropes).toBe(28)
  })

  it('full lifecycle: init, migrate, seed, query', async () => {
    await runSeed()

    const works = await getWorks()
    expect(works).toHaveLength(28)

    const dims = await getDimensions()
    expect(dims).toHaveLength(19)

    const tropes = await getTropes()
    expect(tropes).toHaveLength(28)

    const aot = works.find((w) => w.title === 'Attack on Titan')!
    expect(aot.primaryScore).toBe(9.6)
    expect(aot.medium).toBe('anime')
  })
})
