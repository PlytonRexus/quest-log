import { describe, it, expect } from 'vitest'
import { checkAchievements } from '../achievements'
import type { UserProgress } from '../../types'
import type { DiscoveryStats } from '../discoveryEngine'

function makeProgress(overrides: Partial<UserProgress> = {}): UserProgress {
  return {
    id: 1, totalXp: 0, worksLogged: 0, tropesDiscovered: 0,
    fogPercentRevealed: 0, lastActivity: null,
    ...overrides,
  }
}

function makeStats(overrides: Partial<DiscoveryStats> = {}): DiscoveryStats {
  return {
    total: 28, hidden: 28, foggy: 0, revealed: 0, percentRevealed: 0,
    ...overrides,
  }
}

describe('achievements', () => {
  it('returns first_discovery when tropesDiscovered >= 1', () => {
    const progress = makeProgress({ tropesDiscovered: 1 })
    const stats = makeStats({ revealed: 1, hidden: 27, percentRevealed: 3.6 })

    const earned = checkAchievements(progress, stats, [])
    const ids = earned.map((a) => a.id)
    expect(ids).toContain('first_discovery')
  })

  it('does not return already-earned achievements', () => {
    const progress = makeProgress({ tropesDiscovered: 1 })
    const stats = makeStats({ revealed: 1 })

    const earned = checkAchievements(progress, stats, ['first_discovery'])
    const ids = earned.map((a) => a.id)
    expect(ids).not.toContain('first_discovery')
  })

  it('returns multiple achievements when conditions are met simultaneously', () => {
    const progress = makeProgress({ worksLogged: 5, totalXp: 1500, tropesDiscovered: 10 })
    const stats = makeStats({ revealed: 10, hidden: 18, percentRevealed: 35.7 })

    const earned = checkAchievements(progress, stats, [])
    const ids = earned.map((a) => a.id)
    expect(ids).toContain('first_discovery')
    expect(ids).toContain('five_works')
    expect(ids).toContain('ten_tropes')
    expect(ids).toContain('xp_milestone')
    expect(ids.length).toBeGreaterThanOrEqual(4)
  })
})
