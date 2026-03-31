import { useState, useEffect, useCallback } from 'react'
import { SkillTree } from '../../viz/SkillTree'
import { getSkillTreeData } from '../../game/skillTree'
import { checkAchievements, ACHIEVEMENTS } from '../../game/achievements'
import { AchievementNotification } from '../../game/AchievementNotification'
import { getUserProgress } from '../../db/dal'
import { getDiscoveryStats } from '../../game/discoveryEngine'
import type { SkillTreeNode } from '../../types'
import type { Achievement } from '../../game/achievements'

function SkillTreeView() {
  const [nodes, setNodes] = useState<SkillTreeNode[]>([])
  const [pendingAchievement, setPendingAchievement] = useState<Achievement | null>(null)
  const [earnedIds, setEarnedIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('earnedAchievements') ?? '[]')
    } catch {
      return []
    }
  })

  const refresh = useCallback(async () => {
    const data = await getSkillTreeData()
    setNodes(data.nodes)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    async function check() {
      const progress = await getUserProgress()
      const stats = await getDiscoveryStats()
      if (!progress) return
      const newAchievements = checkAchievements(progress, stats, earnedIds)
      if (newAchievements.length > 0) {
        const newIds = [...earnedIds, ...newAchievements.map((a) => a.id)]
        setEarnedIds(newIds)
        localStorage.setItem('earnedAchievements', JSON.stringify(newIds))
        setPendingAchievement(newAchievements[0])
      }
    }
    check()
  }, [earnedIds])

  const earnedAchievements = ACHIEVEMENTS.filter((a) => earnedIds.includes(a.id))

  return (
    <div className="h-full flex flex-col p-6 overflow-auto">
      <section className="flex-1 min-h-0">
        <h2 className="text-lg font-semibold mb-3 text-star/80">Skill Tree</h2>
        <div className="bg-surface rounded-lg border border-border p-4 h-[600px]">
          <SkillTree nodes={nodes} />
        </div>
      </section>
      <section className="mt-6">
        <h2 className="text-lg font-semibold mb-3 text-star/80">Achievements</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {earnedAchievements.length === 0 ? (
            <p className="text-star/50 col-span-full">
              No achievements earned yet. Log some works to get started.
            </p>
          ) : (
            earnedAchievements.map((a) => (
              <div key={a.id} className="bg-surface rounded-lg border border-yellow-500/30 p-3">
                <p className="text-sm font-semibold text-yellow-400">{a.name}</p>
                <p className="text-xs text-star/50 mt-1">{a.description}</p>
              </div>
            ))
          )}
        </div>
      </section>
      {pendingAchievement && (
        <AchievementNotification
          achievement={pendingAchievement}
          onDismiss={() => setPendingAchievement(null)}
        />
      )}
    </div>
  )
}

export default SkillTreeView
