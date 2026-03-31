import { describe, it, expect } from 'vitest'
import { estimateTokens } from '../rag'

describe('estimateTokens', () => {
  it('estimates token count from text', () => {
    const text = 'Hello world this is a test'
    const tokens = estimateTokens(text)
    // 6 words / 0.75 = 8 tokens
    expect(tokens).toBe(8)
  })

  it('returns 0 for empty string', () => {
    expect(estimateTokens('')).toBe(0)
  })

  it('handles multi-line text', () => {
    const text = 'Line one\nLine two\nLine three'
    const tokens = estimateTokens(text)
    // 6 words / 0.75 = 8
    expect(tokens).toBe(8)
  })

  it('handles long text with reasonable estimate', () => {
    const words = Array.from({ length: 750 }, () => 'word').join(' ')
    const tokens = estimateTokens(words)
    // 750 / 0.75 = 1000
    expect(tokens).toBe(1000)
  })

  it('handles text with extra whitespace', () => {
    const text = '  hello   world  '
    const tokens = estimateTokens(text)
    // 2 words / 0.75 = 3 (rounded up)
    expect(tokens).toBe(3)
  })
})
