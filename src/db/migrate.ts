import { exec, query } from './connection'
import { CREATE_TABLES, CREATE_CANVAS_TABLES } from './schema'

interface SchemaVersion {
  version: number
  appliedAt: string
}

const CREATE_SCHEMA_VERSION_TABLE = `
  CREATE TABLE IF NOT EXISTS schema_version (
    version INTEGER PRIMARY KEY,
    appliedAt TEXT NOT NULL
  );
`

type Migration = {
  version: number
  name: string
  up: string
}

const migrations: Migration[] = [
  {
    version: 1,
    name: 'initial_schema',
    up: CREATE_TABLES,
  },
  {
    version: 2,
    name: 'canvas_tables',
    up: CREATE_CANVAS_TABLES,
  },
]

async function getCurrentVersion(): Promise<number> {
  const rows = await query<SchemaVersion>(
    'SELECT version FROM schema_version ORDER BY version DESC LIMIT 1',
  )
  return rows.length > 0 ? rows[0].version : 0
}

export async function runMigrations(): Promise<void> {
  // Create the schema_version table first
  await exec(CREATE_SCHEMA_VERSION_TABLE)

  const currentVersion = await getCurrentVersion()

  for (const migration of migrations) {
    if (migration.version > currentVersion) {
      // Split multi-statement SQL and execute each
      const statements = migration.up
        .split(';')
        .map((s) => s.trim())
        .filter((s) => s.length > 0)

      for (const statement of statements) {
        await exec(statement)
      }

      await exec(
        'INSERT INTO schema_version (version, appliedAt) VALUES (?, ?)',
        [migration.version, new Date().toISOString()],
      )
    }
  }
}
