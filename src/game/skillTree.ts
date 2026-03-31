// Builds and manages the RPG skill tree from trope categories and tropes

import {
  getTropes, insertSkillTreeNode, getSkillTreeNodes,
} from '../db/dal'
import { queryOne } from '../db/connection'
import type { SkillTreeNode } from '../types'

// Category display names for tree branch labels
export const CATEGORY_LABELS: Record<string, string> = {
  premise_structural: 'Premise & Structure',
  character_archetype: 'Character Archetypes',
  pacing_mechanic: 'Pacing & Mechanics',
  emotional_dynamic: 'Emotional Dynamics',
  world_building: 'World Building',
  narrative_technique: 'Narrative Technique',
  relationship_pattern: 'Relationship Patterns',
  conflict_type: 'Conflict Types',
}

export interface SkillTreeData {
  nodes: SkillTreeNode[]
  categories: string[]
}

// Populate the skillTreeNodes table from current trope data.
// Creates: root (tier 0), category branches (tier 1), trope leaves (tier 2).
// Idempotent: skips creation if nodes already exist.
export async function buildSkillTree(): Promise<void> {
  const existing = await getSkillTreeNodes()
  if (existing.length > 0) return

  // Root node
  const root = await insertSkillTreeNode({
    tropeId: null,
    parentNodeId: null,
    xpRequired: 0,
    xpCurrent: 0,
    state: 'completed',
    tier: 0,
  })

  // Get all tropes and group by category
  const tropes = await getTropes()
  const categories = new Map<string, number[]>()
  for (const trope of tropes) {
    if (!categories.has(trope.category)) {
      categories.set(trope.category, [])
    }
    categories.get(trope.category)!.push(trope.id)
  }

  // Create category branch nodes (tier 1)
  for (const [, tropeIds] of categories) {
    const branch = await insertSkillTreeNode({
      tropeId: null,
      parentNodeId: root.id,
      xpRequired: 300,
      xpCurrent: 0,
      state: 'locked',
      tier: 1,
    })

    // Create trope leaf nodes (tier 2)
    for (const tropeId of tropeIds) {
      await insertSkillTreeNode({
        tropeId,
        parentNodeId: branch.id,
        xpRequired: 200,
        xpCurrent: 0,
        state: 'locked',
        tier: 2,
      })
    }
  }
}

export async function getSkillTreeData(): Promise<SkillTreeData> {
  const nodes = await getSkillTreeNodes()

  // Get unique categories from trope leaf nodes
  const categorySet = new Set<string>()
  for (const node of nodes) {
    if (node.tropeId !== null) {
      // Look up category from the trope
      const trope = await queryOne<{ category: string }>(
        'SELECT category FROM tropes WHERE id = ?',
        [node.tropeId],
      )
      if (trope) categorySet.add(trope.category)
    }
  }

  return {
    nodes,
    categories: Array.from(categorySet).sort(),
  }
}
