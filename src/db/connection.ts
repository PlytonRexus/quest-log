import initSqlJs, { type Database } from 'sql.js'

let dbInstance: Database | null = null
let initPromise: Promise<Database> | null = null

export async function getDb(): Promise<Database> {
  if (dbInstance) return dbInstance

  if (initPromise) return initPromise

  initPromise = (async () => {
    // In test / Node environments, let sql.js resolve the WASM file via
    // its built-in Node path resolution. In the browser, serve the WASM
    // from the public directory.
    const isNode =
      typeof process !== 'undefined' &&
      process.versions != null &&
      process.versions.node != null
    const SQL = await initSqlJs(
      isNode
        ? undefined
        : { locateFile: (file: string) => `/${file}` },
    )
    dbInstance = new SQL.Database()
    dbInstance.run('PRAGMA foreign_keys = ON')
    return dbInstance
  })()

  return initPromise
}

export async function exec(sql: string, params?: unknown[]): Promise<void> {
  const db = await getDb()
  db.run(sql, params as never[])
}

export async function query<T>(
  sql: string,
  params?: unknown[],
): Promise<T[]> {
  const db = await getDb()
  const stmt = db.prepare(sql)
  if (params) {
    stmt.bind(params as never[])
  }

  const results: T[] = []
  while (stmt.step()) {
    const row = stmt.getAsObject()
    results.push(row as T)
  }
  stmt.free()
  return results
}

export async function queryOne<T>(
  sql: string,
  params?: unknown[],
): Promise<T | null> {
  const results = await query<T>(sql, params)
  return results[0] ?? null
}

export async function insertAndGetId(
  sql: string,
  params?: unknown[],
): Promise<number> {
  const db = await getDb()
  db.run(sql, params as never[])
  const result = db.exec('SELECT last_insert_rowid() as id')
  return result[0].values[0][0] as number
}

export async function closeDb(): Promise<void> {
  if (dbInstance) {
    dbInstance.close()
    dbInstance = null
    initPromise = null
  }
}

// Reset for testing: close and clear the singleton
export async function resetDb(): Promise<void> {
  await closeDb()
}
