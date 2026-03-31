// Finds adjacent tropes via relation graph traversal and embedding similarity

import { getRelatedTropes, getEmbedding, getEmbeddingsByType } from '../db/dal'
import { cosineSimilarity } from '../ai/similarity'
import { bufferToFloat32Array } from '../ai/embeddings'
import { EMBEDDING_MODEL } from '../ai/models'

export interface AdjacentTrope {
  tropeId: number
  distance: number
  source: 'relation' | 'similarity'
  weight: number
}

export async function getAdjacentTropes(
  tropeId: number,
  maxDistance: number = 1,
): Promise<AdjacentTrope[]> {
  const results = new Map<number, AdjacentTrope>()

  // BFS over tropeRelations graph
  const visited = new Set<number>([tropeId])
  let frontier = [tropeId]

  for (let dist = 1; dist <= maxDistance; dist++) {
    const nextFrontier: number[] = []
    for (const current of frontier) {
      const related = await getRelatedTropes(current)
      for (const rel of related) {
        if (visited.has(rel.id)) continue
        visited.add(rel.id)
        nextFrontier.push(rel.id)
        if (!results.has(rel.id) || results.get(rel.id)!.distance > dist) {
          results.set(rel.id, {
            tropeId: rel.id,
            distance: dist,
            source: 'relation',
            weight: rel.weight,
          })
        }
      }
    }
    frontier = nextFrontier
  }

  // Embedding similarity (gracefully degrade if no embeddings)
  try {
    const sourceEmbedding = await getEmbedding('trope', tropeId, EMBEDDING_MODEL.id)
    if (sourceEmbedding) {
      const allTropeEmbeddings = await getEmbeddingsByType('trope', EMBEDDING_MODEL.id)
      const sourceVector = bufferToFloat32Array(sourceEmbedding.vector)

      for (const emb of allTropeEmbeddings) {
        if (emb.entityId === tropeId) continue
        const sim = cosineSimilarity(sourceVector, bufferToFloat32Array(emb.vector))
        if (sim >= 0.6) {
          const existing = results.get(emb.entityId)
          // Only add if not already found with a shorter distance
          if (!existing || existing.distance > 1) {
            results.set(emb.entityId, {
              tropeId: emb.entityId,
              distance: 1,
              source: existing ? existing.source : 'similarity',
              weight: existing ? Math.max(existing.weight, sim) : sim,
            })
          }
        }
      }
    }
  } catch {
    // No embeddings available, rely on relation-based adjacency only
  }

  return Array.from(results.values()).sort((a, b) => b.weight - a.weight)
}
