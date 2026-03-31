// Transforms database entities into graph visualization data

import type { Work, Trope, Dimension, WorkTrope, TropeRelation } from '../types'
import type { GraphNode, GraphLink, GraphData } from './types'

export const MEDIUM_COLORS: Record<string, string> = {
  film: '#4FC3F7',
  anime: '#AB47BC',
  book: '#66BB6A',
  series: '#FFA726',
  game: '#EF5350',
}

export const TROPE_CATEGORY_HEX: Record<string, string> = {
  premise_structural: '#3B82F6',
  character_archetype: '#A855F7',
  pacing_mechanic: '#22C55E',
  emotional_dynamic: '#F43F5E',
  world_building: '#F59E0B',
  narrative_technique: '#06B6D4',
  relationship_pattern: '#EC4899',
  conflict_type: '#EF4444',
}

const DIMENSION_COLOR = '#FFFFFF'
const ANCHOR_RADIUS = 80
const DEFAULT_COLOR = '#888888'

export interface GraphMapperInput {
  works: Work[]
  tropes: Trope[]
  dimensions: Dimension[]
  workTropeLinks: WorkTrope[]
  tropeRelations: TropeRelation[]
  similarityEdges?: { workIdA: number; workIdB: number; similarity: number }[]
  fogStateMap?: Map<number, string>
}

function normalizeRange(values: number[], floor = 0.15): number[] {
  if (values.length === 0) return []
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min
  if (range === 0) return values.map(() => 0.5)
  return values.map((v) => floor + ((v - min) / range) * (1 - floor))
}

function buildWorkTropeCounts(links: WorkTrope[]): Map<number, number> {
  const counts = new Map<number, number>()
  for (const link of links) {
    counts.set(link.tropeId, (counts.get(link.tropeId) ?? 0) + 1)
  }
  return counts
}

function dimColor(hex: string, factor: number): string {
  const r = Math.round(parseInt(hex.slice(1, 3), 16) * factor)
  const g = Math.round(parseInt(hex.slice(3, 5), 16) * factor)
  const b = Math.round(parseInt(hex.slice(5, 7), 16) * factor)
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

export function buildGraphData(input: GraphMapperInput): GraphData {
  const { works, tropes, dimensions, workTropeLinks, tropeRelations, similarityEdges, fogStateMap } = input
  const nodes: GraphNode[] = []
  const links: GraphLink[] = []

  // Work nodes
  const workScores = works.map((w) => w.primaryScore ?? w.comfortScore ?? 5)
  const normalizedWorkSizes = normalizeRange(workScores)

  for (let i = 0; i < works.length; i++) {
    const work = works[i]
    nodes.push({
      id: `work:${work.id}`,
      kind: 'work',
      label: work.title,
      color: MEDIUM_COLORS[work.medium] ?? DEFAULT_COLOR,
      size: normalizedWorkSizes[i],
      entityId: work.id,
      medium: work.medium,
      score: work.primaryScore ?? work.comfortScore ?? undefined,
    })
  }

  // Trope nodes
  const tropeLinkCounts = buildWorkTropeCounts(workTropeLinks)
  const tropeCounts = tropes.map((t) => tropeLinkCounts.get(t.id) ?? 0)
  const normalizedTropeSizes = normalizeRange(tropeCounts, 0.1)

  for (let i = 0; i < tropes.length; i++) {
    const trope = tropes[i]
    const tropeState = fogStateMap?.get(trope.id)

    // Skip hidden tropes when fog state is provided
    if (fogStateMap && tropeState === 'hidden') continue

    const baseColor = TROPE_CATEGORY_HEX[trope.category] ?? DEFAULT_COLOR
    const isFoggy = fogStateMap && tropeState === 'foggy'

    nodes.push({
      id: `trope:${trope.id}`,
      kind: 'trope',
      label: trope.name,
      color: isFoggy ? dimColor(baseColor, 0.3) : baseColor,
      size: isFoggy ? normalizedTropeSizes[i] * 0.5 : normalizedTropeSizes[i],
      entityId: trope.id,
      category: trope.category,
      discoveryState: fogStateMap ? (tropeState === 'foggy' ? 'foggy' : 'revealed') : undefined,
    })
  }

  // Dimension anchor nodes, arranged in a ring on the XZ plane
  for (let i = 0; i < dimensions.length; i++) {
    const dim = dimensions[i]
    const angle = (i / dimensions.length) * 2 * Math.PI
    nodes.push({
      id: `dim:${dim.id}`,
      kind: 'dimension',
      label: dim.name,
      color: DIMENSION_COLOR,
      size: 1.0,
      entityId: dim.id,
      fx: ANCHOR_RADIUS * Math.cos(angle),
      fy: 0,
      fz: ANCHOR_RADIUS * Math.sin(angle),
    })
  }

  // Build node ID set for edge filtering (skip edges to hidden nodes)
  const nodeIds = new Set(nodes.map((n) => n.id))

  // Work-trope edges
  const edgeSet = new Set<string>()
  for (const link of workTropeLinks) {
    const source = `work:${link.workId}`
    const target = `trope:${link.tropeId}`
    if (!nodeIds.has(source) || !nodeIds.has(target)) continue
    const key = `${source}|${target}`
    if (!edgeSet.has(key)) {
      edgeSet.add(key)
      links.push({ source, target, weight: link.confidence, kind: 'work-trope' })
    }
  }

  // Trope-trope edges
  for (const rel of tropeRelations) {
    const source = `trope:${rel.tropeAId}`
    const target = `trope:${rel.tropeBId}`
    if (!nodeIds.has(source) || !nodeIds.has(target)) continue
    const key = source < target ? `${source}|${target}` : `${target}|${source}`
    if (!edgeSet.has(key)) {
      edgeSet.add(key)
      links.push({ source, target, weight: rel.weight, kind: 'trope-trope' })
    }
  }

  // Work-work similarity edges (optional, threshold > 0.5)
  if (similarityEdges) {
    for (const edge of similarityEdges) {
      if (edge.similarity <= 0.5) continue
      const source = `work:${edge.workIdA}`
      const target = `work:${edge.workIdB}`
      const key = source < target ? `${source}|${target}` : `${target}|${source}`
      if (!edgeSet.has(key)) {
        edgeSet.add(key)
        links.push({ source, target, weight: edge.similarity, kind: 'work-work' })
      }
    }
  }

  return { nodes, links }
}
