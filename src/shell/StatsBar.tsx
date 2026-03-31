import { useState, useEffect, useCallback } from 'react'
import { getOverallStats, getUserProgress } from '../db/dal'
import { getDiscoveryStats } from '../game/discoveryEngine'
import { getSkillTreeData } from '../game/skillTree'

interface StatsBarData {
  totalWorks: number
  fogPercent: number
  totalXp: number
  skillCompletion: number
  lastActivity: string | null
}

export function StatsBar() {
  const [stats, setStats] = useState<StatsBarData>({
    totalWorks: 0,
    fogPercent: 0,
    totalXp: 0,
    skillCompletion: 0,
    lastActivity: null,
  })

  const refresh = useCallback(async () => {
    try {
      const [overallStats, progress, discovery, skillTree] = await Promise.all([
        getOverallStats(),
        getUserProgress(),
        getDiscoveryStats(),
        getSkillTreeData(),
      ])

      const unlockedNodes = skillTree.nodes.filter(
        (n) => n.state === 'unlocked' || n.state === 'mastered',
      ).length
      const totalNodes = skillTree.nodes.length

      setStats({
        totalWorks: overallStats.totalWorks,
        fogPercent: discovery.percentRevealed,
        totalXp: progress?.totalXp ?? 0,
        skillCompletion: totalNodes > 0 ? (unlockedNodes / totalNodes) * 100 : 0,
        lastActivity: progress?.lastActivity ?? null,
      })
    } catch {
      // Stats bar is non-critical, silently handle errors
    }
  }, [])

  useEffect(() => {
    refresh()
    // Refresh stats every 5 seconds to pick up changes from other views
    const interval = setInterval(refresh, 5000)
    return () => clearInterval(interval)
  }, [refresh])

  return (
    <div
      className="flex items-center justify-between px-6 py-2 bg-surface border-t border-border text-sm shrink-0"
      role="status"
      aria-label="Application statistics"
      data-testid="stats-bar"
    >
      <div className="flex items-center gap-6">
        <span className="text-star/60">
          Works: <strong className="text-star">{stats.totalWorks}</strong>
        </span>
        <span className="text-star/60 flex items-center gap-2">
          Fog:
          <span className="inline-flex items-center gap-1">
            <span className="inline-block w-16 h-1.5 bg-void rounded-full overflow-hidden">
              <span
                className="block h-full bg-accent rounded-full transition-all"
                style={{ width: `${Math.min(stats.fogPercent, 100)}%` }}
              />
            </span>
            <strong className="text-star">{stats.fogPercent.toFixed(1)}%</strong>
          </span>
        </span>
        <span className="text-star/60">
          XP: <strong className="text-ember">{stats.totalXp}</strong>
        </span>
        <span className="text-star/60">
          Skills: <strong className="text-star">{stats.skillCompletion.toFixed(0)}%</strong>
        </span>
      </div>
      {stats.lastActivity && (
        <span className="text-star/40 text-xs">
          Last: {new Date(stats.lastActivity).toLocaleDateString()}
        </span>
      )}
    </div>
  )
}
