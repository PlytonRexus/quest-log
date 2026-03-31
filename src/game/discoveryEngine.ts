// Manages trope discovery state: hidden -> foggy -> revealed

import {
  getTropes, getTropesForWork,
  getDiscoveryStates, getDiscoveryStateByTropeId,
  upsertDiscoveryState, getUserProgress, updateUserProgress,
} from '../db/dal'
import { exec, queryOne } from '../db/connection'
import { getAdjacentTropes } from './adjacency'

export interface DiscoveryResult {
  revealed: number[]
  foggy: number[]
}

export interface DiscoveryStats {
  total: number
  hidden: number
  foggy: number
  revealed: number
  percentRevealed: number
}

// Ensure every trope has a discoveryState row (default 'hidden')
// and that a userProgress row exists.
export async function initializeDiscoveryState(): Promise<void> {
  const tropes = await getTropes()
  const existing = await getDiscoveryStates()
  const existingTropeIds = new Set(existing.map((ds) => ds.tropeId))

  for (const trope of tropes) {
    if (!existingTropeIds.has(trope.id)) {
      await upsertDiscoveryState(trope.id, 'hidden')
    }
  }

  // Ensure userProgress row exists
  const progress = await getUserProgress()
  if (!progress) {
    await exec(
      `INSERT INTO userProgress (totalXp, worksLogged, tropesDiscovered, fogPercentRevealed, lastActivity)
       VALUES (?, ?, ?, ?, ?)`,
      [0, 0, 0, 0.0, new Date().toISOString()],
    )
  }
}

// Reveal tropes linked to a work, and set adjacent tropes to foggy.
export async function revealTropesForWork(
  workId: number,
): Promise<DiscoveryResult> {
  const workTropes = await getTropesForWork(workId)
  const revealed: number[] = []
  const foggy: number[] = []

  // Reveal all tropes linked to this work
  for (const trope of workTropes) {
    const current = await getDiscoveryStateByTropeId(trope.id)
    if (!current || current.state !== 'revealed') {
      await upsertDiscoveryState(trope.id, 'revealed', workId)
      revealed.push(trope.id)
    }
  }

  // Set adjacent tropes to foggy (if currently hidden)
  for (const tropeId of revealed) {
    const adjacent = await getAdjacentTropes(tropeId)
    for (const adj of adjacent) {
      const adjState = await getDiscoveryStateByTropeId(adj.tropeId)
      if (adjState && adjState.state === 'hidden') {
        await upsertDiscoveryState(adj.tropeId, 'foggy')
        foggy.push(adj.tropeId)
      }
    }
  }

  // Update user progress
  const stats = await getDiscoveryStats()
  const progress = await getUserProgress()
  if (progress) {
    await updateUserProgress({
      worksLogged: progress.worksLogged + 1,
      tropesDiscovered: stats.revealed,
      fogPercentRevealed: stats.percentRevealed,
      lastActivity: new Date().toISOString(),
    })
  }

  return { revealed, foggy }
}

export async function getDiscoveryStats(): Promise<DiscoveryStats> {
  const total = await queryOne<{ count: number }>(
    'SELECT COUNT(*) as count FROM discoveryState',
  )
  const hidden = await queryOne<{ count: number }>(
    "SELECT COUNT(*) as count FROM discoveryState WHERE state = 'hidden'",
  )
  const foggyCount = await queryOne<{ count: number }>(
    "SELECT COUNT(*) as count FROM discoveryState WHERE state = 'foggy'",
  )
  const revealedCount = await queryOne<{ count: number }>(
    "SELECT COUNT(*) as count FROM discoveryState WHERE state = 'revealed'",
  )

  const totalNum = total?.count ?? 0
  const revealedNum = revealedCount?.count ?? 0

  return {
    total: totalNum,
    hidden: hidden?.count ?? 0,
    foggy: foggyCount?.count ?? 0,
    revealed: revealedNum,
    percentRevealed: totalNum > 0 ? (revealedNum / totalNum) * 100 : 0,
  }
}
