// All CREATE TABLE statements for the narrative portal database.
// Schema follows 3NF, matching the shared data model.

export const CREATE_TABLES = `
  CREATE TABLE IF NOT EXISTS works (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    medium TEXT NOT NULL,
    year INTEGER,
    coverUrl TEXT,
    primaryScore REAL,
    comfortScore REAL,
    consumptionMode TEXT,
    dateConsumed TEXT,
    notes TEXT
  );

  CREATE TABLE IF NOT EXISTS dimensions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    weight REAL NOT NULL,
    isLoadBearing INTEGER DEFAULT 0,
    framework TEXT NOT NULL,
    description TEXT
  );

  CREATE TABLE IF NOT EXISTS dimensionScores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    workId INTEGER REFERENCES works(id) ON DELETE CASCADE,
    dimensionId INTEGER REFERENCES dimensions(id) ON DELETE CASCADE,
    score REAL NOT NULL,
    reasoning TEXT,
    UNIQUE(workId, dimensionId)
  );

  CREATE TABLE IF NOT EXISTS tropes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    description TEXT
  );

  CREATE TABLE IF NOT EXISTS workTropes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    workId INTEGER REFERENCES works(id) ON DELETE CASCADE,
    tropeId INTEGER REFERENCES tropes(id) ON DELETE CASCADE,
    confidence REAL DEFAULT 1.0,
    source TEXT NOT NULL,
    UNIQUE(workId, tropeId)
  );

  CREATE TABLE IF NOT EXISTS tropeRelations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tropeAId INTEGER REFERENCES tropes(id) ON DELETE CASCADE,
    tropeBId INTEGER REFERENCES tropes(id) ON DELETE CASCADE,
    relationshipType TEXT,
    weight REAL DEFAULT 1.0
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    workId INTEGER REFERENCES works(id) ON DELETE CASCADE,
    rawMarkdown TEXT NOT NULL,
    parsedMetadata TEXT,
    importedFrom TEXT,
    createdAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS embeddings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entityType TEXT NOT NULL,
    entityId INTEGER NOT NULL,
    vector BLOB NOT NULL,
    modelName TEXT NOT NULL,
    UNIQUE(entityType, entityId, modelName)
  );

  CREATE TABLE IF NOT EXISTS discoveryState (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tropeId INTEGER REFERENCES tropes(id) ON DELETE CASCADE UNIQUE,
    state TEXT DEFAULT 'hidden',
    revealedAt TEXT,
    revealedBy INTEGER REFERENCES works(id)
  );

  CREATE TABLE IF NOT EXISTS skillTreeNodes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tropeId INTEGER REFERENCES tropes(id),
    parentNodeId INTEGER REFERENCES skillTreeNodes(id),
    xpRequired INTEGER DEFAULT 0,
    xpCurrent INTEGER DEFAULT 0,
    state TEXT DEFAULT 'locked',
    tier INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS userProgress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    totalXp INTEGER DEFAULT 0,
    worksLogged INTEGER DEFAULT 0,
    tropesDiscovered INTEGER DEFAULT 0,
    fogPercentRevealed REAL DEFAULT 0.0,
    lastActivity TEXT
  );
`

export const CREATE_CANVAS_TABLES = `
  CREATE TABLE IF NOT EXISTS canvasElements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    entityId INTEGER,
    x REAL NOT NULL DEFAULT 0,
    y REAL NOT NULL DEFAULT 0,
    width REAL NOT NULL DEFAULT 200,
    height REAL NOT NULL DEFAULT 120,
    content TEXT,
    color TEXT
  );

  CREATE TABLE IF NOT EXISTS canvasConnections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sourceElementId INTEGER REFERENCES canvasElements(id) ON DELETE CASCADE,
    targetElementId INTEGER REFERENCES canvasElements(id) ON DELETE CASCADE,
    label TEXT
  );
`
