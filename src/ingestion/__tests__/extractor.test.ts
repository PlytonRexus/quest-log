import { describe, it, expect } from 'vitest'
import { parseMarkdown } from '../parser'
import {
  extractFrontmatter, extractTextContent,
  computeEngagementMetrics, extractKeywords, extractReviewData,
} from '../extractor'

describe('extractor', () => {
  describe('extractFrontmatter', () => {
    it('extracts title, rating, and medium from frontmatter', () => {
      const ast = parseMarkdown('---\ntitle: "Dune"\nrating: 9.1\nmedium: film\n---\n\nBody')
      const fm = extractFrontmatter(ast)
      expect(fm.title).toBe('Dune')
      expect(fm.rating).toBe(9.1)
      expect(fm.medium).toBe('film')
    })

    it('handles missing fields without crashing', () => {
      const ast = parseMarkdown('---\ntitle: "Dune"\n---\n\nBody')
      const fm = extractFrontmatter(ast)
      expect(fm.title).toBe('Dune')
      expect(fm.rating).toBeUndefined()
      expect(fm.medium).toBeUndefined()
    })
  })

  describe('extractTextContent', () => {
    it('extracts plain text from markdown with headers, lists, emphasis', () => {
      const ast = parseMarkdown('# Title\n\n**Bold** and *italic*\n\n- Item 1\n- Item 2')
      const text = extractTextContent(ast)
      expect(text).toContain('Title')
      expect(text).toContain('Bold')
      expect(text).toContain('italic')
      expect(text).toContain('Item 1')
    })
  })

  describe('computeEngagementMetrics', () => {
    it('computes higher engagement for longer, analytical text', () => {
      const longText = Array(100).fill(
        'The narrative structure is fundamentally compelling because the character development is nuanced and complex.',
      ).join(' ')
      const metrics = computeEngagementMetrics(longText)
      expect(metrics.wordCount).toBeGreaterThan(400)
      expect(metrics.engagementScore).toBeGreaterThan(0.5)
    })

    it('computes lower engagement for short text', () => {
      const metrics = computeEngagementMetrics('It was good.')
      expect(metrics.wordCount).toBeLessThan(100)
      expect(metrics.engagementScore).toBeLessThan(0.5)
    })
  })

  describe('extractKeywords', () => {
    it('identifies recurring terms', () => {
      const text = 'Eren fights. Eren leads. Eren sacrifices. Others watch.'
      const keywords = extractKeywords(text)
      expect(keywords).toContain('Eren')
    })
  })

  describe('extractReviewData', () => {
    it('produces complete ParsedReviewData from markdown with frontmatter', () => {
      const md = '---\ntitle: "Dune"\nrating: 9.1\nmedium: film\n---\n\nDune excels at systemic world-building. The narrative is compelling because the character arcs are nuanced.'
      const ast = parseMarkdown(md)
      const data = extractReviewData(ast)

      expect(data.frontmatter.title).toBe('Dune')
      expect(data.frontmatter.rating).toBe(9.1)
      expect(data.plainText.length).toBeGreaterThan(0)
      expect(data.wordCount).toBeGreaterThan(0)
      expect(data.engagementScore).toBeGreaterThanOrEqual(0)
    })
  })
})
