// Embedding generation, storage, and retrieval

import { aiManager } from './manager'
import { storeEmbedding, getEmbedding } from '../db/dal'
import { EMBEDDING_MODEL } from './models'

export function float32ArrayToBuffer(arr: number[]): ArrayBuffer {
  return new Float32Array(arr).buffer
}

export function bufferToFloat32Array(buf: ArrayBuffer | Uint8Array): number[] {
  if (buf instanceof Uint8Array) {
    return Array.from(new Float32Array(buf.buffer, buf.byteOffset, buf.byteLength / 4))
  }
  return Array.from(new Float32Array(buf))
}

export async function generateAndStoreEmbedding(
  entityType: string,
  entityId: number,
  text: string,
): Promise<number[]> {
  const vector = await aiManager.embed(text)
  const blob = float32ArrayToBuffer(vector)
  await storeEmbedding(entityType, entityId, blob, EMBEDDING_MODEL.id)
  return vector
}

export async function getOrGenerateEmbedding(
  entityType: string,
  entityId: number,
  text: string,
): Promise<number[]> {
  const existing = await getEmbedding(entityType, entityId, EMBEDDING_MODEL.id)
  if (existing) return bufferToFloat32Array(existing.vector)
  return generateAndStoreEmbedding(entityType, entityId, text)
}
