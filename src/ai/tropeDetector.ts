// Trope detection pipeline using zero-shot classification

import { aiManager } from './manager'
import { getTropeByName, insertTrope, linkWorkTrope } from '../db/dal'
import {
  TROPE_DICT,
  getTropesByCategory,
  buildLabelsForBatch,
  chunkArray,
  type TropeCategory,
} from './tropeDict'

export interface DetectedTrope {
  name: string
  category: TropeCategory
  confidence: number
}

export interface DetectOptions {
  minConfidence?: number
  maxTropesPerCategory?: number
  categories?: TropeCategory[]
}

export async function detectTropes(
  text: string,
  options?: DetectOptions,
): Promise<DetectedTrope[]> {
  if (!text.trim()) return []

  const minConfidence = options?.minConfidence ?? 0.3
  const maxPerCategory = options?.maxTropesPerCategory ?? 5
  const tropesByCategory = getTropesByCategory()
  const results: DetectedTrope[] = []

  for (const [category, tropes] of tropesByCategory) {
    if (options?.categories && !options.categories.includes(category)) continue

    const batches = chunkArray(tropes, 8)
    const categoryResults: DetectedTrope[] = []

    for (const batch of batches) {
      const labels = buildLabelsForBatch(batch)
      const scores = await aiManager.classify(text, labels)

      for (const { label, score } of scores) {
        if (score >= minConfidence) {
          const tropeName = label.split(':')[0].trim()
          categoryResults.push({ name: tropeName, category, confidence: score })
        }
      }
    }

    categoryResults.sort((a, b) => b.confidence - a.confidence)
    results.push(...categoryResults.slice(0, maxPerCategory))
  }

  return results.sort((a, b) => b.confidence - a.confidence)
}

export async function detectAndStoreTropes(
  workId: number,
  text: string,
  options?: DetectOptions,
): Promise<DetectedTrope[]> {
  const detected = await detectTropes(text, options)

  for (const trope of detected) {
    let dbTrope = await getTropeByName(trope.name)
    if (!dbTrope) {
      const dictEntry = TROPE_DICT.find((t) => t.name === trope.name)
      dbTrope = await insertTrope({
        name: trope.name,
        category: trope.category,
        description: dictEntry?.description ?? null,
      })
    }
    await linkWorkTrope(workId, dbTrope.id, trope.confidence, 'ai')
  }

  return detected
}

export async function detectTropesForAllWorks(
  getWorksFn: () => Promise<{ id: number }[]>,
  getReviewsFn: (workId: number) => Promise<{ rawMarkdown: string }[]>,
  onProgress?: (current: number, total: number) => void,
): Promise<{ workId: number; tropes: DetectedTrope[] }[]> {
  const works = await getWorksFn()
  const results: { workId: number; tropes: DetectedTrope[] }[] = []

  for (let i = 0; i < works.length; i++) {
    const reviews = await getReviewsFn(works[i].id)
    const text = reviews.map((r) => r.rawMarkdown).join('\n\n')

    if (text.trim().length > 0) {
      const tropes = await detectAndStoreTropes(works[i].id, text)
      results.push({ workId: works[i].id, tropes })
    }

    onProgress?.(i + 1, works.length)
  }

  return results
}
