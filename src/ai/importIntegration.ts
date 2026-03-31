// Integration between import pipeline and AI embedding generation

import { getReviewsForWork, getWorks, getEmbedding } from '../db/dal'
import { generateAndStoreEmbedding } from './embeddings'
import { EMBEDDING_MODEL } from './models'
import { aiManager } from './manager'

export async function generateEmbeddingsForWork(workId: number): Promise<void> {
  if (!aiManager.isReady()) return

  const reviews = await getReviewsForWork(workId)
  if (reviews.length === 0) return

  const fullText = reviews.map((r) => r.rawMarkdown).join('\n\n')
  await generateAndStoreEmbedding('work', workId, fullText)
}

export async function generateEmbeddingsForAllWorks(
  onProgress?: (current: number, total: number) => void,
): Promise<{ processed: number; skipped: number }> {
  const works = await getWorks()
  let processed = 0
  let skipped = 0

  for (let i = 0; i < works.length; i++) {
    const existing = await getEmbedding('work', works[i].id, EMBEDDING_MODEL.id)
    if (existing) {
      skipped++
    } else {
      const reviews = await getReviewsForWork(works[i].id)
      if (reviews.length > 0) {
        const fullText = reviews.map((r) => r.rawMarkdown).join('\n\n')
        await generateAndStoreEmbedding('work', works[i].id, fullText)
        processed++
      } else {
        skipped++
      }
    }
    onProgress?.(i + 1, works.length)
  }

  return { processed, skipped }
}
