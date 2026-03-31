// XP calculation and award system for gamified progression

import {
  getWorkById, getWorksByMedium, getTropesForWork,
  getReviewsForWork, getSkillTreeNodeByTrope,
  getUserProgress, updateUserProgress, updateSkillTreeNode,
} from '../db/dal'
import { revealTropesForWork } from './discoveryEngine'
import type { SkillTreeNode } from '../types'

export interface XpBreakdown {
  baseXp: number
  noveltyMultiplier: number
  depthMultiplier: number
  totalXp: number
}

export interface AwardResult {
  xpAwarded: number
  newTotal: number
  nodesProgressed: SkillTreeNode[]
  nodesCompleted: SkillTreeNode[]
  revealed: number[]
  foggy: number[]
}

export interface MasteryStatus {
  xpCurrent: number
  xpRequired: number
  percentComplete: number
  state: string
}

export async function calculateXpForWork(
  workId: number,
): Promise<XpBreakdown> {
  const baseXp = 100

  // Novelty: ratio based on how many works share the same medium
  const work = await getWorkById(workId)
  let noveltyMultiplier = 1.5
  if (work) {
    const sameGenre = await getWorksByMedium(work.medium)
    // Exclude this work from the count
    const existing = sameGenre.filter((w) => w.id !== workId).length
    noveltyMultiplier = 1.0 + (1.0 / (1 + existing))
  }
  noveltyMultiplier = Math.max(0.5, Math.min(2.0, noveltyMultiplier))

  // Depth: longer reviews yield more XP
  let depthMultiplier = 1.0
  const reviews = await getReviewsForWork(workId)
  if (reviews.length > 0) {
    const totalWords = reviews.reduce((sum, r) => {
      const wordCount = r.rawMarkdown.split(/\s+/).filter(Boolean).length
      return sum + wordCount
    }, 0)
    depthMultiplier = Math.min(2.0, 1.0 + totalWords / 1000)
  }

  const totalXp = Math.round(baseXp * noveltyMultiplier * depthMultiplier)

  return { baseXp, noveltyMultiplier, depthMultiplier, totalXp }
}

export async function awardXp(
  workId: number,
): Promise<AwardResult> {
  const breakdown = await calculateXpForWork(workId)
  const discovery = await revealTropesForWork(workId)

  // Update total XP
  const progress = await getUserProgress()
  const newTotal = (progress?.totalXp ?? 0) + breakdown.totalXp
  await updateUserProgress({
    totalXp: newTotal,
    lastActivity: new Date().toISOString(),
  })

  // Distribute XP to skill tree nodes for the work's tropes
  const workTropes = await getTropesForWork(workId)
  const xpPerTrope = workTropes.length > 0
    ? Math.round(breakdown.totalXp / workTropes.length)
    : 0

  const nodesProgressed: SkillTreeNode[] = []
  const nodesCompleted: SkillTreeNode[] = []

  for (const trope of workTropes) {
    const node = await getSkillTreeNodeByTrope(trope.id)
    if (!node) continue

    const newXp = node.xpCurrent + xpPerTrope
    let newState = node.state

    if (node.state === 'locked' && newXp > 0) {
      newState = 'in_progress'
    }
    if (newXp >= node.xpRequired && node.xpRequired > 0) {
      newState = 'completed'
    }

    const updated = await updateSkillTreeNode(node.id, {
      xpCurrent: newXp,
      state: newState,
    })

    if (newState !== node.state) {
      if (newState === 'completed') {
        nodesCompleted.push(updated)
      } else {
        nodesProgressed.push(updated)
      }
    }
  }

  return {
    xpAwarded: breakdown.totalXp,
    newTotal,
    nodesProgressed,
    nodesCompleted,
    revealed: discovery.revealed,
    foggy: discovery.foggy,
  }
}

export async function getMasteryStatus(
  tropeId: number,
): Promise<MasteryStatus> {
  const node = await getSkillTreeNodeByTrope(tropeId)
  if (!node) {
    return { xpCurrent: 0, xpRequired: 0, percentComplete: 0, state: 'locked' }
  }

  const percentComplete = node.xpRequired > 0
    ? Math.min(100, (node.xpCurrent / node.xpRequired) * 100)
    : 0

  return {
    xpCurrent: node.xpCurrent,
    xpRequired: node.xpRequired,
    percentComplete,
    state: node.state,
  }
}
