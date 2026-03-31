import { describe, it, expect, afterEach } from 'vitest'
import { exec, query, resetDb } from '../connection'
import { CREATE_TABLES } from '../schema'

describe('schema', () => {
  afterEach(async () => {
    await resetDb()
  })

  it('creates all tables without errors', async () => {
    const statements = CREATE_TABLES
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0)

    for (const stmt of statements) {
      await exec(stmt)
    }

    const tables = await query<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
    )

    const tableNames = tables.map((t) => t.name)
    expect(tableNames).toContain('works')
    expect(tableNames).toContain('dimensions')
    expect(tableNames).toContain('dimensionScores')
    expect(tableNames).toContain('tropes')
    expect(tableNames).toContain('workTropes')
    expect(tableNames).toContain('tropeRelations')
    expect(tableNames).toContain('reviews')
    expect(tableNames).toContain('embeddings')
    expect(tableNames).toContain('discoveryState')
    expect(tableNames).toContain('skillTreeNodes')
    expect(tableNames).toContain('userProgress')
  })
})
