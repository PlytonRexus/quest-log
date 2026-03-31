// SVG-based radial skill tree visualization

import { useMemo, useState, useCallback } from 'react'
import { hierarchy, tree as d3Tree } from 'd3-hierarchy'
import type { SkillTreeNode } from '../types'

const STATE_COLORS: Record<string, string> = {
  locked: '#4B5563',
  in_progress: '#F59E0B',
  completed: '#22C55E',
  mastered: '#EAB308',
}

const NODE_RADIUS = 18
const VIEW_SIZE = 800
const TREE_RADIUS = 300

interface TreeDatum {
  id: number
  name: string
  state: string
  xpCurrent: number
  xpRequired: number
  tier: number
  tropeId: number | null
  children?: TreeDatum[]
}

interface Props {
  nodes: SkillTreeNode[]
  tropeNames?: Map<number, string>
  categoryNames?: Map<number, string>
  onNodeClick?: (node: SkillTreeNode) => void
}

function buildTreeHierarchy(
  nodes: SkillTreeNode[],
  tropeNames?: Map<number, string>,
  categoryNames?: Map<number, string>,
): TreeDatum | null {
  const nodeMap = new Map<number, SkillTreeNode>()
  let root: SkillTreeNode | null = null

  for (const node of nodes) {
    nodeMap.set(node.id, node)
    if (node.parentNodeId === null) root = node
  }

  if (!root) return null

  function buildDatum(node: SkillTreeNode): TreeDatum {
    const children = nodes
      .filter((n) => n.parentNodeId === node.id)
      .map(buildDatum)

    let name = `Node ${node.id}`
    if (node.tropeId && tropeNames?.has(node.tropeId)) {
      name = tropeNames.get(node.tropeId)!
    } else if (node.tier === 1 && categoryNames?.has(node.id)) {
      name = categoryNames.get(node.id)!
    } else if (node.tier === 0) {
      name = 'Narrative Mastery'
    }

    return {
      id: node.id,
      name,
      state: node.state,
      xpCurrent: node.xpCurrent,
      xpRequired: node.xpRequired,
      tier: node.tier,
      tropeId: node.tropeId,
      children: children.length > 0 ? children : undefined,
    }
  }

  return buildDatum(root)
}

function polarToCartesian(angle: number, radius: number): [number, number] {
  return [
    VIEW_SIZE / 2 + radius * Math.cos(angle - Math.PI / 2),
    VIEW_SIZE / 2 + radius * Math.sin(angle - Math.PI / 2),
  ]
}

export function SkillTree({ nodes, tropeNames, categoryNames, onNodeClick }: Props) {
  const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null)
  const [focusedIndex, setFocusedIndex] = useState<number>(0)

  const treeData = useMemo(() => {
    const rootDatum = buildTreeHierarchy(nodes, tropeNames, categoryNames)
    if (!rootDatum) return null

    const root = hierarchy(rootDatum)
    const layout = d3Tree<TreeDatum>()
      .size([2 * Math.PI, TREE_RADIUS])
      .separation((a, b) => (a.parent === b.parent ? 1 : 2) / a.depth)

    layout(root)
    return root
  }, [nodes, tropeNames, categoryNames])

  const handleClick = useCallback((nodeId: number) => {
    setSelectedNodeId((prev) => (prev === nodeId ? null : nodeId))
    if (onNodeClick) {
      const node = nodes.find((n) => n.id === nodeId)
      if (node) onNodeClick(node)
    }
  }, [nodes, onNodeClick])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!treeData) return
    const allNodesList = treeData.descendants()
    const count = allNodesList.length
    if (count === 0) return

    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault()
      const next = (focusedIndex + 1) % count
      setFocusedIndex(next)
      handleClick(allNodesList[next].data.id)
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault()
      const prev = (focusedIndex - 1 + count) % count
      setFocusedIndex(prev)
      handleClick(allNodesList[prev].data.id)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (allNodesList[focusedIndex]) {
        handleClick(allNodesList[focusedIndex].data.id)
      }
    }
  }, [treeData, focusedIndex, handleClick])

  if (!treeData) {
    return <div className="text-star/50 text-center p-8">No skill tree data</div>
  }

  const allNodes = treeData.descendants()
  const allLinks = treeData.links()

  return (
    <svg
      viewBox={`0 0 ${VIEW_SIZE} ${VIEW_SIZE}`}
      className="w-full h-full outline-none"
      role="img"
      aria-label="Skill tree visualization"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <defs>
        <filter id="glow-gold">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Edges */}
      {allLinks.map((link, i) => {
        const [sx, sy] = polarToCartesian(
          link.source.x as number,
          link.source.y as number,
        )
        const [tx, ty] = polarToCartesian(
          link.target.x as number,
          link.target.y as number,
        )
        return (
          <line
            key={`edge-${i}`}
            x1={sx} y1={sy} x2={tx} y2={ty}
            stroke={STATE_COLORS[link.target.data.state] ?? '#333'}
            strokeWidth={1.5}
            strokeOpacity={0.4}
          />
        )
      })}

      {/* Nodes */}
      {allNodes.map((d) => {
        const [cx, cy] = polarToCartesian(d.x as number, d.y as number)
        const fill = STATE_COLORS[d.data.state] ?? '#4B5563'
        const isLocked = d.data.state === 'locked'
        const isMastered = d.data.state === 'mastered'
        const isSelected = selectedNodeId === d.data.id
        const progressPercent = d.data.xpRequired > 0
          ? Math.min(1, d.data.xpCurrent / d.data.xpRequired)
          : 0

        return (
          <g
            key={`node-${d.data.id}`}
            onClick={() => handleClick(d.data.id)}
            style={{ cursor: 'pointer' }}
            role="button"
            aria-label={`${d.data.name}: ${d.data.state}`}
          >
            {/* Progress arc for in-progress nodes */}
            {d.data.state === 'in_progress' && (
              <circle
                cx={cx} cy={cy}
                r={NODE_RADIUS + 3}
                fill="none"
                stroke="#F59E0B"
                strokeWidth={3}
                strokeDasharray={`${progressPercent * 2 * Math.PI * (NODE_RADIUS + 3)} ${2 * Math.PI * (NODE_RADIUS + 3)}`}
                strokeDashoffset={0}
                transform={`rotate(-90 ${cx} ${cy})`}
              />
            )}

            {/* Main circle */}
            <circle
              cx={cx} cy={cy}
              r={NODE_RADIUS}
              fill={fill}
              fillOpacity={isLocked ? 0.4 : 1}
              stroke={isSelected ? '#fff' : fill}
              strokeWidth={isSelected ? 3 : 1.5}
              strokeDasharray={isLocked ? '4 3' : 'none'}
              filter={isMastered ? 'url(#glow-gold)' : undefined}
            />

            {/* Label */}
            <text
              x={cx}
              y={cy + NODE_RADIUS + 14}
              textAnchor="middle"
              fill="#E5E7EB"
              fontSize={d.data.tier === 0 ? 12 : 9}
              fontWeight={d.data.tier <= 1 ? 'bold' : 'normal'}
              opacity={isLocked ? 0.5 : 0.9}
            >
              {d.data.name.length > 20
                ? d.data.name.slice(0, 18) + '...'
                : d.data.name}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
