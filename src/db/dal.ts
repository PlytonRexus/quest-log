import { query, queryOne, exec, insertAndGetId } from './connection'
import type {
  Work,
  Dimension,
  DimensionScore,
  Trope,
  WorkTrope,
  TropeRelation,
  Review,
  Embedding,
  WorkProfile,
  DiscoveryState,
  SkillTreeNode,
  UserProgress,
} from '../types'

// --- Works ---

export async function insertWork(
  work: Omit<Work, 'id'>,
): Promise<Work> {
  const id = await insertAndGetId(
    `INSERT INTO works (title, medium, year, coverUrl, primaryScore, comfortScore, consumptionMode, dateConsumed, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      work.title, work.medium, work.year, work.coverUrl,
      work.primaryScore, work.comfortScore, work.consumptionMode,
      work.dateConsumed, work.notes,
    ],
  )
  return { id, ...work }
}

export async function getWorks(): Promise<Work[]> {
  return query<Work>('SELECT * FROM works ORDER BY id')
}

export async function getWorkById(id: number): Promise<Work | null> {
  return queryOne<Work>('SELECT * FROM works WHERE id = ?', [id])
}

export async function getWorksByMedium(medium: string): Promise<Work[]> {
  return query<Work>('SELECT * FROM works WHERE medium = ? ORDER BY id', [medium])
}

export async function updateWork(
  id: number,
  updates: Partial<Omit<Work, 'id'>>,
): Promise<Work> {
  const fields = Object.keys(updates)
  const values = Object.values(updates)
  const setClause = fields.map((f) => `${f} = ?`).join(', ')
  await exec(`UPDATE works SET ${setClause} WHERE id = ?`, [...values, id])
  const work = await getWorkById(id)
  if (!work) throw new Error(`Work ${id} not found after update`)
  return work
}

export async function deleteWork(id: number): Promise<void> {
  await exec('DELETE FROM works WHERE id = ?', [id])
}

// --- Dimensions ---

export async function insertDimension(
  dim: Omit<Dimension, 'id'>,
): Promise<Dimension> {
  const id = await insertAndGetId(
    `INSERT INTO dimensions (name, weight, isLoadBearing, framework, description)
     VALUES (?, ?, ?, ?, ?)`,
    [dim.name, dim.weight, dim.isLoadBearing, dim.framework, dim.description],
  )
  return { id, ...dim }
}

export async function getDimensions(
  framework?: 'primary' | 'comfort',
): Promise<Dimension[]> {
  if (framework) {
    return query<Dimension>(
      'SELECT * FROM dimensions WHERE framework = ? ORDER BY id',
      [framework],
    )
  }
  return query<Dimension>('SELECT * FROM dimensions ORDER BY id')
}

export async function getLoadBearingDimensions(): Promise<Dimension[]> {
  return query<Dimension>(
    'SELECT * FROM dimensions WHERE isLoadBearing = 1 ORDER BY id',
  )
}

// --- Dimension Scores ---

export async function setDimensionScore(
  workId: number,
  dimensionId: number,
  score: number,
  reasoning?: string,
): Promise<DimensionScore> {
  const id = await insertAndGetId(
    `INSERT OR REPLACE INTO dimensionScores (workId, dimensionId, score, reasoning)
     VALUES (?, ?, ?, ?)`,
    [workId, dimensionId, score, reasoning ?? null],
  )
  return { id, workId, dimensionId, score, reasoning: reasoning ?? null }
}

export async function getDimensionScoresForWork(
  workId: number,
): Promise<DimensionScore[]> {
  return query<DimensionScore>(
    'SELECT * FROM dimensionScores WHERE workId = ? ORDER BY dimensionId',
    [workId],
  )
}

export async function getWorksAboveScore(
  dimensionId: number,
  minScore: number,
): Promise<Work[]> {
  return query<Work>(
    `SELECT w.* FROM works w
     JOIN dimensionScores ds ON w.id = ds.workId
     WHERE ds.dimensionId = ? AND ds.score >= ?
     ORDER BY ds.score DESC`,
    [dimensionId, minScore],
  )
}

// --- Tropes ---

export async function insertTrope(
  trope: Omit<Trope, 'id'>,
): Promise<Trope> {
  const id = await insertAndGetId(
    'INSERT INTO tropes (name, category, description) VALUES (?, ?, ?)',
    [trope.name, trope.category, trope.description],
  )
  return { id, ...trope }
}

export async function getTropes(category?: string): Promise<Trope[]> {
  if (category) {
    return query<Trope>(
      'SELECT * FROM tropes WHERE category = ? ORDER BY id',
      [category],
    )
  }
  return query<Trope>('SELECT * FROM tropes ORDER BY id')
}

export async function getTropeByName(name: string): Promise<Trope | null> {
  return queryOne<Trope>('SELECT * FROM tropes WHERE name = ?', [name])
}

// --- Work-Trope associations ---

export async function linkWorkTrope(
  workId: number,
  tropeId: number,
  confidence: number,
  source: string,
): Promise<WorkTrope> {
  const id = await insertAndGetId(
    `INSERT OR REPLACE INTO workTropes (workId, tropeId, confidence, source)
     VALUES (?, ?, ?, ?)`,
    [workId, tropeId, confidence, source],
  )
  return { id, workId, tropeId, confidence, source }
}

export async function getTropesForWork(
  workId: number,
): Promise<(Trope & { confidence: number })[]> {
  return query<Trope & { confidence: number }>(
    `SELECT t.*, wt.confidence FROM tropes t
     JOIN workTropes wt ON t.id = wt.tropeId
     WHERE wt.workId = ?
     ORDER BY wt.confidence DESC`,
    [workId],
  )
}

export async function getWorksForTrope(
  tropeId: number,
): Promise<(Work & { confidence: number })[]> {
  return query<Work & { confidence: number }>(
    `SELECT w.*, wt.confidence FROM works w
     JOIN workTropes wt ON w.id = wt.workId
     WHERE wt.tropeId = ?
     ORDER BY wt.confidence DESC`,
    [tropeId],
  )
}

// --- Reviews ---

export async function insertReview(
  review: Omit<Review, 'id'>,
): Promise<Review> {
  const id = await insertAndGetId(
    `INSERT INTO reviews (workId, rawMarkdown, parsedMetadata, importedFrom, createdAt)
     VALUES (?, ?, ?, ?, ?)`,
    [
      review.workId, review.rawMarkdown, review.parsedMetadata,
      review.importedFrom, review.createdAt,
    ],
  )
  return { id, ...review }
}

export async function getReviewsForWork(workId: number): Promise<Review[]> {
  return query<Review>(
    'SELECT * FROM reviews WHERE workId = ? ORDER BY createdAt DESC',
    [workId],
  )
}

// --- Trope Relations ---

export async function insertTropeRelation(
  tropeAId: number,
  tropeBId: number,
  type: string,
  weight?: number,
): Promise<TropeRelation> {
  const id = await insertAndGetId(
    `INSERT INTO tropeRelations (tropeAId, tropeBId, relationshipType, weight)
     VALUES (?, ?, ?, ?)`,
    [tropeAId, tropeBId, type, weight ?? 1.0],
  )
  return {
    id, tropeAId, tropeBId,
    relationshipType: type, weight: weight ?? 1.0,
  }
}

export async function getRelatedTropes(
  tropeId: number,
): Promise<(Trope & { relationshipType: string; weight: number })[]> {
  return query<Trope & { relationshipType: string; weight: number }>(
    `SELECT t.*, tr.relationshipType, tr.weight FROM tropes t
     JOIN tropeRelations tr ON (t.id = tr.tropeBId AND tr.tropeAId = ?)
        OR (t.id = tr.tropeAId AND tr.tropeBId = ?)
     ORDER BY tr.weight DESC`,
    [tropeId, tropeId],
  )
}

// --- Embeddings ---

export async function storeEmbedding(
  entityType: string,
  entityId: number,
  vector: ArrayBuffer | Uint8Array,
  modelName: string,
): Promise<Embedding> {
  let buf: ArrayBuffer
  if (vector instanceof Uint8Array) {
    const copy = new Uint8Array(vector.byteLength)
    copy.set(vector)
    buf = copy.buffer
  } else {
    buf = vector
  }
  const id = await insertAndGetId(
    `INSERT OR REPLACE INTO embeddings (entityType, entityId, vector, modelName)
     VALUES (?, ?, ?, ?)`,
    [entityType, entityId, new Uint8Array(buf), modelName],
  )
  return { id, entityType, entityId, vector: buf, modelName }
}

export async function getEmbedding(
  entityType: string,
  entityId: number,
  modelName: string,
): Promise<Embedding | null> {
  return queryOne<Embedding>(
    'SELECT * FROM embeddings WHERE entityType = ? AND entityId = ? AND modelName = ?',
    [entityType, entityId, modelName],
  )
}

export async function getEmbeddingsByType(
  entityType: string,
  modelName: string,
): Promise<Embedding[]> {
  return query<Embedding>(
    'SELECT * FROM embeddings WHERE entityType = ? AND modelName = ? ORDER BY entityId',
    [entityType, modelName],
  )
}

export async function deleteEmbedding(
  entityType: string,
  entityId: number,
): Promise<void> {
  await exec(
    'DELETE FROM embeddings WHERE entityType = ? AND entityId = ?',
    [entityType, entityId],
  )
}

// --- Bulk queries (avoid N+1 in graph building) ---

export async function getAllWorkTropeLinks(): Promise<WorkTrope[]> {
  return query<WorkTrope>('SELECT * FROM workTropes ORDER BY workId, tropeId')
}

export async function getAllTropeRelations(): Promise<TropeRelation[]> {
  return query<TropeRelation>('SELECT * FROM tropeRelations ORDER BY id')
}

// --- Aggregate queries ---

export async function getWorkWithFullProfile(
  workId: number,
): Promise<WorkProfile | null> {
  const work = await getWorkById(workId)
  if (!work) return null

  const dimensionScores = await query<DimensionScore & { dimensionName: string }>(
    `SELECT ds.*, d.name as dimensionName FROM dimensionScores ds
     JOIN dimensions d ON ds.dimensionId = d.id
     WHERE ds.workId = ?
     ORDER BY d.id`,
    [workId],
  )

  const tropes = await getTropesForWork(workId)

  return { work, dimensionScores, tropes }
}

export async function getOverallStats(): Promise<{
  totalWorks: number
  totalTropes: number
  avgScore: number
}> {
  const worksResult = await queryOne<{ count: number }>(
    'SELECT COUNT(*) as count FROM works',
  )
  const tropesResult = await queryOne<{ count: number }>(
    'SELECT COUNT(*) as count FROM tropes',
  )
  const avgResult = await queryOne<{ avg: number | null }>(
    'SELECT AVG(primaryScore) as avg FROM works WHERE primaryScore IS NOT NULL',
  )

  return {
    totalWorks: worksResult?.count ?? 0,
    totalTropes: tropesResult?.count ?? 0,
    avgScore: avgResult?.avg ?? 0,
  }
}

// --- Discovery State ---

export async function getDiscoveryStates(): Promise<DiscoveryState[]> {
  return query<DiscoveryState>('SELECT * FROM discoveryState ORDER BY tropeId')
}

export async function getDiscoveryStateByTropeId(
  tropeId: number,
): Promise<DiscoveryState | null> {
  return queryOne<DiscoveryState>(
    'SELECT * FROM discoveryState WHERE tropeId = ?',
    [tropeId],
  )
}

export async function upsertDiscoveryState(
  tropeId: number,
  state: string,
  revealedBy?: number,
): Promise<DiscoveryState> {
  const revealedAt = state === 'revealed' ? new Date().toISOString() : null
  const id = await insertAndGetId(
    `INSERT INTO discoveryState (tropeId, state, revealedAt, revealedBy)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(tropeId) DO UPDATE SET state = ?, revealedAt = COALESCE(?, revealedAt), revealedBy = COALESCE(?, revealedBy)`,
    [tropeId, state, revealedAt, revealedBy ?? null, state, revealedAt, revealedBy ?? null],
  )
  return { id, tropeId, state, revealedAt, revealedBy: revealedBy ?? null }
}

export async function getDiscoveryStatesByState(
  state: string,
): Promise<DiscoveryState[]> {
  return query<DiscoveryState>(
    'SELECT * FROM discoveryState WHERE state = ? ORDER BY tropeId',
    [state],
  )
}

// --- Skill Tree Nodes ---

export async function insertSkillTreeNode(
  node: Omit<SkillTreeNode, 'id'>,
): Promise<SkillTreeNode> {
  const id = await insertAndGetId(
    `INSERT INTO skillTreeNodes (tropeId, parentNodeId, xpRequired, xpCurrent, state, tier)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [node.tropeId, node.parentNodeId, node.xpRequired, node.xpCurrent, node.state, node.tier],
  )
  return { id, ...node }
}

export async function getSkillTreeNodes(): Promise<SkillTreeNode[]> {
  return query<SkillTreeNode>('SELECT * FROM skillTreeNodes ORDER BY tier, id')
}

export async function getSkillTreeNodeByTrope(
  tropeId: number,
): Promise<SkillTreeNode | null> {
  return queryOne<SkillTreeNode>(
    'SELECT * FROM skillTreeNodes WHERE tropeId = ?',
    [tropeId],
  )
}

export async function updateSkillTreeNode(
  id: number,
  updates: Partial<Omit<SkillTreeNode, 'id'>>,
): Promise<SkillTreeNode> {
  const fields = Object.keys(updates)
  const values = Object.values(updates)
  const setClause = fields.map((f) => `${f} = ?`).join(', ')
  await exec(`UPDATE skillTreeNodes SET ${setClause} WHERE id = ?`, [...values, id])
  const node = await queryOne<SkillTreeNode>(
    'SELECT * FROM skillTreeNodes WHERE id = ?',
    [id],
  )
  if (!node) throw new Error(`SkillTreeNode ${id} not found after update`)
  return node
}

// --- User Progress ---

export async function getUserProgress(): Promise<UserProgress | null> {
  return queryOne<UserProgress>('SELECT * FROM userProgress LIMIT 1')
}

export async function updateUserProgress(
  updates: Partial<Omit<UserProgress, 'id'>>,
): Promise<UserProgress> {
  const fields = Object.keys(updates)
  const values = Object.values(updates)
  const setClause = fields.map((f) => `${f} = ?`).join(', ')
  await exec(`UPDATE userProgress SET ${setClause} WHERE id = 1`, [...values])
  const progress = await getUserProgress()
  if (!progress) throw new Error('UserProgress not found after update')
  return progress
}
