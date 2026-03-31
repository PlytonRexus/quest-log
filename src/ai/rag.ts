// Retrieval-Augmented Generation: builds context for LLM queries

import { aiManager } from './manager'
import { findSimilarWorks } from './similarity'

type GenerateFn = (
  messages: { role: string; content: string }[],
  options?: { maxTokens?: number; onToken?: (token: string, done: boolean) => void },
) => Promise<string>
import { getWorks, getWorkById, getWorkWithFullProfile, getReviewsForWork, getDimensions } from '../db/dal'
import type { Work, WorkProfile, Review, Dimension } from '../types'

export interface RagContext {
  systemPrompt: string
  retrievedWorks: { work: Work; similarity: number; excerpt: string }[]
  tokenEstimate: number
}

export function estimateTokens(text: string): number {
  const words = text.split(/\s+/).filter((w) => w.length > 0)
  return Math.ceil(words.length / 0.75)
}

function formatWorkContext(
  work: Work,
  profile: WorkProfile | null,
  reviews: Review[],
): string {
  const lines: string[] = []

  lines.push(`## ${work.title} (${work.medium}${work.year ? ', ' + work.year : ''})`)
  lines.push(`Primary Score: ${work.primaryScore ?? 'N/A'} | Comfort Score: ${work.comfortScore ?? 'N/A'} | Mode: ${work.consumptionMode ?? 'N/A'}`)

  if (profile && profile.tropes.length > 0) {
    const tropeList = profile.tropes
      .slice(0, 5)
      .map((t) => `${t.name} (${Math.round(t.confidence * 100)}%)`)
      .join(', ')
    lines.push(`Tropes: ${tropeList}`)
  }

  if (profile && profile.dimensionScores.length > 0) {
    const scoreList = profile.dimensionScores
      .map((s) => `${s.dimensionName}: ${s.score}`)
      .join(', ')
    lines.push(`Dimensions: ${scoreList}`)
  }

  if (reviews.length > 0) {
    const excerpt = reviews[0].rawMarkdown.slice(0, 400)
    lines.push(`Review excerpt: ${excerpt}`)
  }

  return lines.join('\n')
}

function buildDimensionContext(dimensions: Dimension[]): string {
  const lines = ['## Scoring Dimensions']
  for (const dim of dimensions) {
    const lb = dim.isLoadBearing ? ' [LOAD-BEARING]' : ''
    lines.push(`- ${dim.name} (weight: ${dim.weight}, ${dim.framework})${lb}`)
  }
  return lines.join('\n')
}

function buildSystemPrompt(
  workBlocks: string[],
  dimensionContext: string,
): string {
  return `You are a narrative analysis assistant for a personal media tracker called Narrative Portal. The user has a detailed taste profile with scored works, detected tropes, and multi-dimensional ratings. Answer questions about their taste, suggest recommendations based on patterns, and discuss narrative analysis.

${dimensionContext}

Here is relevant context from the user's collection:

${workBlocks.join('\n\n---\n\n')}

Respond conversationally but analytically. Reference specific works and tropes from the context. When discussing patterns, cite concrete examples from the user's data.`
}

export async function buildContext(
  queryText: string,
  options?: { maxWorks?: number; maxTokens?: number },
): Promise<RagContext> {
  const maxWorks = options?.maxWorks ?? 5
  const maxTokens = options?.maxTokens ?? 2000

  // If AI models not ready, build context from DB data only
  let similar: { workId: number; similarity: number }[] = []

  if (aiManager.isReady()) {
    const queryVector = await aiManager.embed(queryText)
    similar = await findSimilarWorks(queryVector, maxWorks * 2)
  }

  // If no embeddings, fall back to all works sorted by score
  let workIds: number[]
  if (similar.length > 0) {
    workIds = similar.map((s) => s.workId)
  } else {
    const allWorks = await getWorks()
    workIds = allWorks
      .sort((a, b) => (b.primaryScore ?? 0) - (a.primaryScore ?? 0))
      .slice(0, maxWorks * 2)
      .map((w) => w.id)
  }

  const dimensions = await getDimensions()
  const dimensionContext = buildDimensionContext(dimensions)

  const blocks: { work: Work; similarity: number; excerpt: string }[] = []
  let totalTokens = estimateTokens(dimensionContext)

  for (const workId of workIds) {
    const work = await getWorkById(workId)
    if (!work) continue

    const profile = await getWorkWithFullProfile(workId)
    const reviews = await getReviewsForWork(workId)
    const block = formatWorkContext(work, profile, reviews)
    const blockTokens = estimateTokens(block)

    if (totalTokens + blockTokens > maxTokens) break
    const similarity = similar.find((s) => s.workId === workId)?.similarity ?? 0
    blocks.push({ work, similarity, excerpt: block })
    totalTokens += blockTokens

    if (blocks.length >= maxWorks) break
  }

  const systemPrompt = buildSystemPrompt(
    blocks.map((b) => b.excerpt),
    dimensionContext,
  )

  return { systemPrompt, retrievedWorks: blocks, tokenEstimate: totalTokens }
}

export async function queryWithContext(
  userQuery: string,
  generateFn: GenerateFn,
  options?: { maxTokens?: number; onToken?: (token: string, done: boolean) => void },
): Promise<{ context: RagContext; response: string }> {
  const context = await buildContext(userQuery)
  const messages = [
    { role: 'system', content: context.systemPrompt },
    { role: 'user', content: userQuery },
  ]

  const response = await generateFn(messages, {
    maxTokens: options?.maxTokens,
    onToken: options?.onToken,
  })

  return { context, response }
}
