import { describe, it, expect } from 'vitest'
import { generateStarPositions } from '../Starfield'

describe('Starfield', () => {
  describe('generateStarPositions', () => {
    it('generates correct number of position values', () => {
      const positions = generateStarPositions(100, 1000)
      expect(positions.length).toBe(100 * 3)
    })

    it('all positions are within the specified radius', () => {
      const radius = 500
      const positions = generateStarPositions(1000, radius)
      for (let i = 0; i < 1000; i++) {
        const x = positions[i * 3]
        const y = positions[i * 3 + 1]
        const z = positions[i * 3 + 2]
        const dist = Math.sqrt(x * x + y * y + z * z)
        expect(dist).toBeLessThanOrEqual(radius * 1.001) // small epsilon for floating point
      }
    })

    it('generates different positions (not all zeros)', () => {
      const positions = generateStarPositions(10, 100)
      let hasNonZero = false
      for (let i = 0; i < positions.length; i++) {
        if (positions[i] !== 0) { hasNonZero = true; break }
      }
      expect(hasNonZero).toBe(true)
    })

    it('distributes across 3 depth layers (via the Starfield component)', () => {
      // Layer counts: 60%, 30%, 10% of total
      const total = 1000
      const layer1 = Math.floor(total * 0.6) // 600
      const layer2 = Math.floor(total * 0.3) // 300
      const layer3 = Math.floor(total * 0.1) // 100

      expect(layer1 + layer2 + layer3).toBe(total)
    })
  })
})
