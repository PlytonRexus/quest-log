import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { resetDb } from '../../db/connection'
import { runMigrations } from '../../db/migrate'
import { insertTrope, getSkillTreeNodes } from '../../db/dal'
import { buildSkillTree, getSkillTreeData } from '../skillTree'

describe('skillTree', () => {
  beforeEach(async () => {
    await resetDb()
    await runMigrations()
  })

  afterEach(async () => {
    await resetDb()
  })

  async function seedTropes() {
    await insertTrope({ name: 'political intrigue', category: 'premise_structural', description: '' })
    await insertTrope({ name: 'class warfare', category: 'premise_structural', description: '' })
    await insertTrope({ name: 'morally grey antihero', category: 'character_archetype', description: '' })
    await insertTrope({ name: 'broken genius', category: 'character_archetype', description: '' })
    await insertTrope({ name: 'slow burn', category: 'pacing_mechanic', description: '' })
  }

  it('creates root node with tier 0', async () => {
    await seedTropes()
    await buildSkillTree()

    const nodes = await getSkillTreeNodes()
    const root = nodes.filter((n) => n.tier === 0)
    expect(root).toHaveLength(1)
    expect(root[0].parentNodeId).toBeNull()
    expect(root[0].tropeId).toBeNull()
    expect(root[0].state).toBe('completed')
  })

  it('creates category branch nodes for each trope category', async () => {
    await seedTropes()
    await buildSkillTree()

    const nodes = await getSkillTreeNodes()
    const branches = nodes.filter((n) => n.tier === 1)
    // 3 categories: premise_structural, character_archetype, pacing_mechanic
    expect(branches).toHaveLength(3)
    expect(branches.every((b) => b.tropeId === null)).toBe(true)
    expect(branches.every((b) => b.xpRequired === 300)).toBe(true)
  })

  it('creates leaf nodes for all tropes at tier 2', async () => {
    await seedTropes()
    await buildSkillTree()

    const nodes = await getSkillTreeNodes()
    const leaves = nodes.filter((n) => n.tier === 2)
    // 5 tropes total
    expect(leaves).toHaveLength(5)
    expect(leaves.every((l) => l.tropeId !== null)).toBe(true)
    expect(leaves.every((l) => l.xpRequired === 200)).toBe(true)
  })

  it('is idempotent', async () => {
    await seedTropes()
    await buildSkillTree()
    const firstCount = (await getSkillTreeNodes()).length

    await buildSkillTree()
    const secondCount = (await getSkillTreeNodes()).length

    expect(secondCount).toBe(firstCount)
  })

  it('getSkillTreeData returns nodes and categories', async () => {
    await seedTropes()
    await buildSkillTree()

    const data = await getSkillTreeData()
    // 1 root + 3 branches + 5 leaves = 9
    expect(data.nodes).toHaveLength(9)
    expect(data.categories).toContain('premise_structural')
    expect(data.categories).toContain('character_archetype')
    expect(data.categories).toContain('pacing_mechanic')
  })
})
