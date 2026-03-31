import { describe, it, expect, afterEach } from 'vitest'
import { query, resetDb } from '../connection'
import { runMigrations } from '../migrate'

describe('migrate', () => {
  afterEach(async () => {
    await resetDb()
  })

  it('runs migrations on empty DB and creates all tables', async () => {
    await runMigrations()

    const version = await query<{ version: number }>(
      'SELECT version FROM schema_version ORDER BY version DESC LIMIT 1',
    )
    expect(version[0].version).toBe(2)

    const tables = await query<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
    )
    const tableNames = tables.map((t) => t.name)
    expect(tableNames).toContain('works')
    expect(tableNames).toContain('dimensions')
    expect(tableNames).toContain('tropes')
    expect(tableNames).toContain('canvasElements')
    expect(tableNames).toContain('canvasConnections')
  })

  it('is idempotent: running twice causes no errors', async () => {
    await runMigrations()
    await runMigrations()

    const versions = await query<{ version: number }>(
      'SELECT version FROM schema_version ORDER BY version',
    )
    expect(versions).toHaveLength(2)
    expect(versions[0].version).toBe(1)
    expect(versions[1].version).toBe(2)
  })
})
