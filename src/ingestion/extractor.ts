import { parse as parseYaml } from 'yaml'
import type { Root, Content } from 'mdast'
import type { ParsedReviewData } from '../types'

interface Frontmatter {
  title?: string
  rating?: number
  date?: string
  tags?: string[]
  medium?: string
}

export function extractFrontmatter(ast: Root): Frontmatter {
  const yamlNode = ast.children.find((node) => node.type === 'yaml')
  if (!yamlNode || yamlNode.type !== 'yaml') return {}

  try {
    const parsed = parseYaml(yamlNode.value)
    return {
      title: parsed.title,
      rating: typeof parsed.rating === 'number' ? parsed.rating : undefined,
      date: parsed.date,
      tags: Array.isArray(parsed.tags) ? parsed.tags : undefined,
      medium: parsed.medium,
    }
  } catch {
    return {}
  }
}

export function extractTextContent(ast: Root): string {
  const parts: string[] = []

  function walk(node: Root | Content): void {
    if (node.type === 'text') {
      parts.push(node.value)
    } else if ('children' in node && Array.isArray(node.children)) {
      for (const child of node.children) {
        walk(child as Content)
      }
    }
  }

  walk(ast)
  return parts.join(' ')
}

// Words that suggest deeper engagement with the material
const ENGAGEMENT_KEYWORDS = [
  'because', 'however', 'although', 'moreover', 'furthermore',
  'specifically', 'particularly', 'fundamentally', 'essentially',
  'thematically', 'narratively', 'structurally', 'character',
  'brilliant', 'masterful', 'disappointing', 'compelling',
  'nuanced', 'complex', 'subtle', 'profound',
]

export function computeEngagementMetrics(text: string): {
  wordCount: number
  sentenceCount: number
  engagementScore: number
} {
  const words = text.split(/\s+/).filter((w) => w.length > 0)
  const wordCount = words.length
  const sentenceCount = (text.match(/[.!?]+/g) || []).length || 1

  if (wordCount === 0) {
    return { wordCount: 0, sentenceCount: 0, engagementScore: 0 }
  }

  const lowerText = text.toLowerCase()
  let engagementHits = 0
  for (const keyword of ENGAGEMENT_KEYWORDS) {
    if (lowerText.includes(keyword)) engagementHits++
  }

  // Score based on length and keyword density
  const lengthFactor = Math.min(1.0, wordCount / 500)
  const keywordDensity = engagementHits / ENGAGEMENT_KEYWORDS.length
  const engagementScore = (lengthFactor * 0.6 + keywordDensity * 0.4)

  return { wordCount, sentenceCount, engagementScore }
}

export function extractKeywords(text: string): string[] {
  const words = text.split(/\s+/).filter((w) => w.length > 2)
  const frequency = new Map<string, number>()

  for (const word of words) {
    // Keep proper nouns (capitalized, not at start of sentence) and recurring terms
    const cleaned = word.replace(/[^a-zA-Z]/g, '')
    if (cleaned.length < 3) continue
    const key = cleaned
    frequency.set(key, (frequency.get(key) || 0) + 1)
  }

  // Return words that appear 2+ times or are capitalized (proper nouns)
  return [...frequency.entries()]
    .filter(([word, count]) => count >= 2 || /^[A-Z]/.test(word))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word]) => word)
}

export function extractReviewData(ast: Root): ParsedReviewData {
  const frontmatter = extractFrontmatter(ast)
  const plainText = extractTextContent(ast)
  const { wordCount, engagementScore } = computeEngagementMetrics(plainText)
  const keywords = extractKeywords(plainText)

  return {
    frontmatter,
    plainText,
    wordCount,
    keywords,
    engagementScore,
  }
}
