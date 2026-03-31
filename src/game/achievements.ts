// Achievement definitions and checking logic

import type { UserProgress } from '../types'
import type { DiscoveryStats } from './discoveryEngine'

export interface Achievement {
  id: string
  name: string
  description: string
  condition: (progress: UserProgress, stats: DiscoveryStats) => boolean
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_discovery',
    name: 'First Light',
    description: 'Discover your first trope.',
    condition: (_p, stats) => stats.revealed >= 1,
  },
  {
    id: 'five_works',
    name: 'Bookshelf Builder',
    description: 'Log 5 works.',
    condition: (p) => p.worksLogged >= 5,
  },
  {
    id: 'ten_tropes',
    name: 'Pattern Seeker',
    description: 'Discover 10 tropes.',
    condition: (_p, stats) => stats.revealed >= 10,
  },
  {
    id: 'half_revealed',
    name: 'Fog Breaker',
    description: 'Reveal 50% of the fog.',
    condition: (_p, stats) => stats.percentRevealed >= 50,
  },
  {
    id: 'full_reveal',
    name: 'Omniscient',
    description: 'Reveal all tropes.',
    condition: (_p, stats) => stats.percentRevealed >= 100,
  },
  {
    id: 'xp_milestone',
    name: 'Scholar',
    description: 'Reach 1500 XP.',
    condition: (p) => p.totalXp >= 1500,
  },
]

// Returns newly earned achievements that are not in the previouslyEarned list.
export function checkAchievements(
  progress: UserProgress,
  stats: DiscoveryStats,
  previouslyEarned: string[],
): Achievement[] {
  const earnedSet = new Set(previouslyEarned)
  return ACHIEVEMENTS.filter(
    (a) => !earnedSet.has(a.id) && a.condition(progress, stats),
  )
}
