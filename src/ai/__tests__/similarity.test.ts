import { describe, it, expect } from 'vitest'
import { cosineSimilarity } from '../similarity'

describe('cosineSimilarity', () => {
  it('returns 1.0 for identical vectors', () => {
    expect(cosineSimilarity([1, 0, 0], [1, 0, 0])).toBeCloseTo(1.0)
  })

  it('returns 0.0 for orthogonal vectors', () => {
    expect(cosineSimilarity([1, 0, 0], [0, 1, 0])).toBeCloseTo(0.0)
  })

  it('returns -1.0 for opposite vectors', () => {
    expect(cosineSimilarity([1, 0, 0], [-1, 0, 0])).toBeCloseTo(-1.0)
  })

  it('returns 1.0 for proportional vectors', () => {
    expect(cosineSimilarity([1, 2, 3], [2, 4, 6])).toBeCloseTo(1.0)
  })

  it('handles non-unit vectors correctly', () => {
    const a = [3, 4]
    const b = [4, 3]
    // dot = 12 + 12 = 24, |a| = 5, |b| = 5, cos = 24/25
    expect(cosineSimilarity(a, b)).toBeCloseTo(24 / 25)
  })

  it('returns 0 for zero vectors', () => {
    expect(cosineSimilarity([0, 0, 0], [1, 2, 3])).toBe(0)
  })

  it('throws on length mismatch', () => {
    expect(() => cosineSimilarity([1, 2], [1, 2, 3])).toThrow('Vector length mismatch')
  })

  it('returns 0 for empty vectors', () => {
    expect(cosineSimilarity([], [])).toBe(0)
  })

  it('computes correctly for high-dimensional vectors', () => {
    const a = Array.from({ length: 384 }, (_, i) => Math.sin(i))
    const b = Array.from({ length: 384 }, (_, i) => Math.sin(i))
    expect(cosineSimilarity(a, b)).toBeCloseTo(1.0)
  })
})
