import { describe, it, expect, afterEach } from 'vitest'
import { exec, query, queryOne, resetDb, insertAndGetId } from '../connection'
import { runMigrations } from '../migrate'

describe('connection', () => {
  afterEach(async () => {
    await resetDb()
  })

  it('INSERT + SELECT round-trip preserves data', async () => {
    await runMigrations()

    await exec(
      `INSERT INTO works (title, medium, year, primaryScore, consumptionMode)
       VALUES (?, ?, ?, ?, ?)`,
      ['Test Film', 'film', 2024, 8.5, 'legitimacy'],
    )

    const rows = await query<{ title: string; medium: string; primaryScore: number }>(
      'SELECT title, medium, primaryScore FROM works WHERE title = ?',
      ['Test Film'],
    )

    expect(rows).toHaveLength(1)
    expect(rows[0].title).toBe('Test Film')
    expect(rows[0].medium).toBe('film')
    expect(rows[0].primaryScore).toBe(8.5)
  })

  it('returns typed error on malformed SQL', async () => {
    await expect(exec('INVALID SQL STATEMENT')).rejects.toThrow()
  })

  it('handles multiple concurrent queries', async () => {
    await runMigrations()

    const queries = Array.from({ length: 5 }, (_, i) =>
      exec(
        `INSERT INTO works (title, medium, primaryScore, consumptionMode) VALUES (?, ?, ?, ?)`,
        [`Work ${i}`, 'film', i, 'legitimacy'],
      ),
    )

    await Promise.all(queries)

    const rows = await query<{ title: string }>('SELECT title FROM works ORDER BY title')
    expect(rows).toHaveLength(5)
  })

  it('insertAndGetId returns the correct row id', async () => {
    await runMigrations()

    const id = await insertAndGetId(
      `INSERT INTO works (title, medium, consumptionMode) VALUES (?, ?, ?)`,
      ['Test', 'film', 'legitimacy'],
    )

    expect(id).toBeGreaterThan(0)

    const row = await queryOne<{ id: number; title: string }>(
      'SELECT id, title FROM works WHERE id = ?',
      [id],
    )
    expect(row?.title).toBe('Test')
  })
})
