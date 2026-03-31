// Cosine similarity and work search

import { getEmbeddingsByType } from '../db/dal'
import { EMBEDDING_MODEL } from './models'
import { bufferToFloat32Array } from './embeddings'

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error(`Vector length mismatch: ${a.length} vs ${b.length}`)
  }
  if (a.length === 0) return 0

  let dot = 0
  let magA = 0
  let magB = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    magA += a[i] * a[i]
    magB += b[i] * b[i]
  }

  const denom = Math.sqrt(magA) * Math.sqrt(magB)
  return denom === 0 ? 0 : dot / denom
}

export async function findSimilarEntities(
  queryVector: number[],
  entityType: string,
  topK: number = 5,
  excludeEntityId?: number,
): Promise<{ entityId: number; similarity: number }[]> {
  const embeddings = await getEmbeddingsByType(entityType, EMBEDDING_MODEL.id)

  const scored = embeddings
    .filter((e) => e.entityId !== excludeEntityId)
    .map((e) => ({
      entityId: e.entityId,
      similarity: cosineSimilarity(queryVector, bufferToFloat32Array(e.vector)),
    }))
    .sort((a, b) => b.similarity - a.similarity)

  return scored.slice(0, topK)
}

export async function findSimilarWorks(
  queryVector: number[],
  topK: number = 5,
  excludeWorkId?: number,
): Promise<{ workId: number; similarity: number }[]> {
  const results = await findSimilarEntities(queryVector, 'work', topK, excludeWorkId)
  return results.map((r) => ({ workId: r.entityId, similarity: r.similarity }))
}
