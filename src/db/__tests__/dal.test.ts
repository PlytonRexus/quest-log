import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { resetDb } from '../connection'
import { runMigrations } from '../migrate'
import {
  insertWork, getWorks, getWorkById, getWorksByMedium,
  updateWork, deleteWork,
  insertDimension, getDimensions, getLoadBearingDimensions,
  setDimensionScore, getDimensionScoresForWork, getWorksAboveScore,
  insertTrope, getTropes, getTropeByName,
  linkWorkTrope, getTropesForWork, getWorksForTrope,
  insertReview, getReviewsForWork,
  insertTropeRelation, getRelatedTropes,
  storeEmbedding, getEmbedding, getEmbeddingsByType, deleteEmbedding,
  getWorkWithFullProfile, getOverallStats,
} from '../dal'

describe('dal', () => {
  beforeEach(async () => {
    await resetDb()
    await runMigrations()
  })

  afterEach(async () => {
    await resetDb()
  })

  // --- Works ---

  it('inserts and retrieves a work by id', async () => {
    const work = await insertWork({
      title: 'Attack on Titan', medium: 'anime', year: 2013,
      coverUrl: null, primaryScore: 9.6, comfortScore: null,
      consumptionMode: 'legitimacy', dateConsumed: null, notes: null,
    })
    expect(work.id).toBeGreaterThan(0)

    const retrieved = await getWorkById(work.id)
    expect(retrieved).not.toBeNull()
    expect(retrieved!.title).toBe('Attack on Titan')
    expect(retrieved!.primaryScore).toBe(9.6)
  })

  it('getWorks returns all inserted works', async () => {
    for (let i = 0; i < 5; i++) {
      await insertWork({
        title: `Work ${i}`, medium: 'film', year: 2020 + i,
        coverUrl: null, primaryScore: 7.0 + i * 0.5, comfortScore: null,
        consumptionMode: 'legitimacy', dateConsumed: null, notes: null,
      })
    }

    const works = await getWorks()
    expect(works).toHaveLength(5)
  })

  it('getWorksByMedium filters correctly', async () => {
    await insertWork({
      title: 'AoT', medium: 'anime', year: 2013,
      coverUrl: null, primaryScore: 9.6, comfortScore: null,
      consumptionMode: 'legitimacy', dateConsumed: null, notes: null,
    })
    await insertWork({
      title: 'Dune', medium: 'film', year: 2021,
      coverUrl: null, primaryScore: 9.1, comfortScore: null,
      consumptionMode: 'legitimacy', dateConsumed: null, notes: null,
    })

    const anime = await getWorksByMedium('anime')
    expect(anime).toHaveLength(1)
    expect(anime[0].title).toBe('AoT')
  })

  it('updateWork persists changes', async () => {
    const work = await insertWork({
      title: 'Test', medium: 'film', year: 2020,
      coverUrl: null, primaryScore: 7.0, comfortScore: null,
      consumptionMode: 'legitimacy', dateConsumed: null, notes: null,
    })

    const updated = await updateWork(work.id, { primaryScore: 9.0 })
    expect(updated.primaryScore).toBe(9.0)

    const retrieved = await getWorkById(work.id)
    expect(retrieved!.primaryScore).toBe(9.0)
  })

  it('deleteWork removes the work', async () => {
    const work = await insertWork({
      title: 'ToDelete', medium: 'film', year: 2020,
      coverUrl: null, primaryScore: 5.0, comfortScore: null,
      consumptionMode: 'legitimacy', dateConsumed: null, notes: null,
    })

    await deleteWork(work.id)
    const retrieved = await getWorkById(work.id)
    expect(retrieved).toBeNull()
  })

  // --- Dimensions ---

  it('inserts and retrieves dimensions by framework', async () => {
    await insertDimension({
      name: 'Incentive Coherence', weight: 5.0, isLoadBearing: 1,
      framework: 'primary', description: 'test',
    })
    await insertDimension({
      name: 'Emotional Safety', weight: 5.0, isLoadBearing: 0,
      framework: 'comfort', description: 'test',
    })

    const primary = await getDimensions('primary')
    expect(primary).toHaveLength(1)
    expect(primary[0].name).toBe('Incentive Coherence')

    const comfort = await getDimensions('comfort')
    expect(comfort).toHaveLength(1)
    expect(comfort[0].name).toBe('Emotional Safety')
  })

  it('getLoadBearingDimensions returns only load-bearing', async () => {
    await insertDimension({
      name: 'LB1', weight: 5.0, isLoadBearing: 1,
      framework: 'primary', description: null,
    })
    await insertDimension({
      name: 'NotLB', weight: 3.0, isLoadBearing: 0,
      framework: 'primary', description: null,
    })

    const lb = await getLoadBearingDimensions()
    expect(lb).toHaveLength(1)
    expect(lb[0].name).toBe('LB1')
  })

  // --- Dimension Scores ---

  it('sets and retrieves dimension scores for a work', async () => {
    const work = await insertWork({
      title: 'AoT', medium: 'anime', year: 2013,
      coverUrl: null, primaryScore: 9.6, comfortScore: null,
      consumptionMode: 'legitimacy', dateConsumed: null, notes: null,
    })
    const dim = await insertDimension({
      name: 'IC', weight: 5.0, isLoadBearing: 1,
      framework: 'primary', description: null,
    })

    await setDimensionScore(work.id, dim.id, 9.5, 'Great coherence')
    const scores = await getDimensionScoresForWork(work.id)
    expect(scores).toHaveLength(1)
    expect(scores[0].score).toBe(9.5)
    expect(scores[0].reasoning).toBe('Great coherence')
  })

  it('getWorksAboveScore returns correct subset', async () => {
    const dim = await insertDimension({
      name: 'IC', weight: 5.0, isLoadBearing: 1,
      framework: 'primary', description: null,
    })
    const w1 = await insertWork({
      title: 'High', medium: 'film', year: 2020,
      coverUrl: null, primaryScore: 9.0, comfortScore: null,
      consumptionMode: 'legitimacy', dateConsumed: null, notes: null,
    })
    const w2 = await insertWork({
      title: 'Low', medium: 'film', year: 2020,
      coverUrl: null, primaryScore: 5.0, comfortScore: null,
      consumptionMode: 'legitimacy', dateConsumed: null, notes: null,
    })

    await setDimensionScore(w1.id, dim.id, 9.0)
    await setDimensionScore(w2.id, dim.id, 5.0)

    const above8 = await getWorksAboveScore(dim.id, 8.0)
    expect(above8).toHaveLength(1)
    expect(above8[0].title).toBe('High')
  })

  // --- Tropes ---

  it('inserts tropes and retrieves by category', async () => {
    await insertTrope({
      name: 'cat-and-mouse', category: 'premise_structural',
      description: 'Escalating pursuit',
    })
    await insertTrope({
      name: 'morally grey antihero', category: 'character_archetype',
      description: 'Protagonist in grey zone',
    })

    const premise = await getTropes('premise_structural')
    expect(premise).toHaveLength(1)
    expect(premise[0].name).toBe('cat-and-mouse')
  })

  it('getTropeByName returns correct trope', async () => {
    await insertTrope({
      name: 'slow burn', category: 'pacing_mechanic',
      description: 'Gradual building',
    })

    const trope = await getTropeByName('slow burn')
    expect(trope).not.toBeNull()
    expect(trope!.category).toBe('pacing_mechanic')
  })

  // --- Work-Trope associations ---

  it('links works to tropes and retrieves both directions', async () => {
    const work = await insertWork({
      title: 'AoT', medium: 'anime', year: 2013,
      coverUrl: null, primaryScore: 9.6, comfortScore: null,
      consumptionMode: 'legitimacy', dateConsumed: null, notes: null,
    })
    const trope = await insertTrope({
      name: 'political intrigue', category: 'premise_structural',
      description: null,
    })

    await linkWorkTrope(work.id, trope.id, 0.95, 'manual')

    const tropesForWork = await getTropesForWork(work.id)
    expect(tropesForWork).toHaveLength(1)
    expect(tropesForWork[0].name).toBe('political intrigue')
    expect(tropesForWork[0].confidence).toBe(0.95)

    const worksForTrope = await getWorksForTrope(trope.id)
    expect(worksForTrope).toHaveLength(1)
    expect(worksForTrope[0].title).toBe('AoT')
  })

  // --- Reviews ---

  it('inserts and retrieves reviews', async () => {
    const work = await insertWork({
      title: 'Dune', medium: 'film', year: 2021,
      coverUrl: null, primaryScore: 9.1, comfortScore: null,
      consumptionMode: 'legitimacy', dateConsumed: null, notes: null,
    })

    await insertReview({
      workId: work.id,
      rawMarkdown: '# Great movie\nLoved the world-building.',
      parsedMetadata: '{"keywords":["world-building"]}',
      importedFrom: 'test',
      createdAt: '2024-01-01T00:00:00Z',
    })

    const reviews = await getReviewsForWork(work.id)
    expect(reviews).toHaveLength(1)
    expect(reviews[0].rawMarkdown).toContain('world-building')
    expect(reviews[0].parsedMetadata).toContain('keywords')
  })

  // --- Trope Relations ---

  it('inserts trope relations and retrieves related tropes', async () => {
    const t1 = await insertTrope({
      name: 'political intrigue', category: 'premise_structural',
      description: null,
    })
    const t2 = await insertTrope({
      name: 'institutional drama', category: 'premise_structural',
      description: null,
    })

    await insertTropeRelation(t1.id, t2.id, 'enhances', 0.8)

    const related = await getRelatedTropes(t1.id)
    expect(related).toHaveLength(1)
    expect(related[0].name).toBe('institutional drama')
    expect(related[0].relationshipType).toBe('enhances')
    expect(related[0].weight).toBe(0.8)
  })

  // --- Aggregate queries ---

  it('getWorkWithFullProfile returns complete joined data', async () => {
    const work = await insertWork({
      title: 'AoT', medium: 'anime', year: 2013,
      coverUrl: null, primaryScore: 9.6, comfortScore: null,
      consumptionMode: 'legitimacy', dateConsumed: null, notes: null,
    })
    const dim = await insertDimension({
      name: 'IC', weight: 5.0, isLoadBearing: 1,
      framework: 'primary', description: null,
    })
    const trope = await insertTrope({
      name: 'political intrigue', category: 'premise_structural',
      description: null,
    })

    await setDimensionScore(work.id, dim.id, 9.5)
    await linkWorkTrope(work.id, trope.id, 0.9, 'manual')

    const profile = await getWorkWithFullProfile(work.id)
    expect(profile).not.toBeNull()
    expect(profile!.work.title).toBe('AoT')
    expect(profile!.dimensionScores).toHaveLength(1)
    expect(profile!.dimensionScores[0].dimensionName).toBe('IC')
    expect(profile!.tropes).toHaveLength(1)
    expect(profile!.tropes[0].name).toBe('political intrigue')
  })

  it('getOverallStats returns correct aggregates', async () => {
    await insertWork({
      title: 'W1', medium: 'film', year: 2020,
      coverUrl: null, primaryScore: 8.0, comfortScore: null,
      consumptionMode: 'legitimacy', dateConsumed: null, notes: null,
    })
    await insertWork({
      title: 'W2', medium: 'film', year: 2020,
      coverUrl: null, primaryScore: 6.0, comfortScore: null,
      consumptionMode: 'legitimacy', dateConsumed: null, notes: null,
    })
    await insertTrope({
      name: 'trope1', category: 'premise_structural', description: null,
    })

    const stats = await getOverallStats()
    expect(stats.totalWorks).toBe(2)
    expect(stats.totalTropes).toBe(1)
    expect(stats.avgScore).toBe(7.0)
  })

  // --- Embeddings ---

  it('stores and retrieves an embedding', async () => {
    const vector = new Float32Array([0.1, 0.2, 0.3]).buffer
    const emb = await storeEmbedding('work', 1, vector, 'test-model')
    expect(emb.entityType).toBe('work')
    expect(emb.entityId).toBe(1)
    expect(emb.modelName).toBe('test-model')

    const retrieved = await getEmbedding('work', 1, 'test-model')
    expect(retrieved).not.toBeNull()
    expect(retrieved!.entityType).toBe('work')
    expect(retrieved!.entityId).toBe(1)
  })

  it('getEmbedding returns null for nonexistent embedding', async () => {
    const retrieved = await getEmbedding('work', 999, 'test-model')
    expect(retrieved).toBeNull()
  })

  it('getEmbeddingsByType returns correct subset', async () => {
    const v1 = new Float32Array([0.1]).buffer
    const v2 = new Float32Array([0.2]).buffer
    const v3 = new Float32Array([0.3]).buffer
    await storeEmbedding('work', 1, v1, 'test-model')
    await storeEmbedding('work', 2, v2, 'test-model')
    await storeEmbedding('trope', 1, v3, 'test-model')

    const workEmbeddings = await getEmbeddingsByType('work', 'test-model')
    expect(workEmbeddings).toHaveLength(2)

    const tropeEmbeddings = await getEmbeddingsByType('trope', 'test-model')
    expect(tropeEmbeddings).toHaveLength(1)
  })

  it('deleteEmbedding removes the record', async () => {
    const vector = new Float32Array([0.1, 0.2]).buffer
    await storeEmbedding('work', 1, vector, 'test-model')

    await deleteEmbedding('work', 1)
    const retrieved = await getEmbedding('work', 1, 'test-model')
    expect(retrieved).toBeNull()
  })

  it('storeEmbedding with duplicate key replaces', async () => {
    const v1 = new Float32Array([0.1]).buffer
    const v2 = new Float32Array([0.9]).buffer
    await storeEmbedding('work', 1, v1, 'test-model')
    await storeEmbedding('work', 1, v2, 'test-model')

    const all = await getEmbeddingsByType('work', 'test-model')
    expect(all).toHaveLength(1)
  })

  it('storeEmbedding handles Uint8Array input', async () => {
    const float32 = new Float32Array([0.5, 0.6])
    const uint8 = new Uint8Array(float32.buffer)
    const emb = await storeEmbedding('work', 1, uint8, 'test-model')
    expect(emb.entityType).toBe('work')

    const retrieved = await getEmbedding('work', 1, 'test-model')
    expect(retrieved).not.toBeNull()
  })

  it('duplicate UNIQUE(workId, dimensionId) replaces gracefully', async () => {
    const work = await insertWork({
      title: 'Test', medium: 'film', year: 2020,
      coverUrl: null, primaryScore: 7.0, comfortScore: null,
      consumptionMode: 'legitimacy', dateConsumed: null, notes: null,
    })
    const dim = await insertDimension({
      name: 'IC', weight: 5.0, isLoadBearing: 1,
      framework: 'primary', description: null,
    })

    await setDimensionScore(work.id, dim.id, 8.0)
    await setDimensionScore(work.id, dim.id, 9.0) // duplicate key, should replace

    const scores = await getDimensionScoresForWork(work.id)
    expect(scores).toHaveLength(1)
    expect(scores[0].score).toBe(9.0)
  })
})
