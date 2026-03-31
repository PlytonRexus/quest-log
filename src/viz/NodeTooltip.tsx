// HTML overlay tooltip rendered at a hovered node's 3D position

import { Html } from '@react-three/drei'
import type { GraphNode } from './types'

interface Props {
  node: GraphNode
}

const KIND_LABELS: Record<string, string> = {
  work: 'Work',
  trope: 'Trope',
  dimension: 'Dimension',
}

export function NodeTooltip({ node }: Props) {
  return (
    <Html
      position={[node.x ?? 0, (node.y ?? 0) + node.size * 3 + 2, node.z ?? 0]}
      center
      distanceFactor={80}
      style={{ pointerEvents: 'none' }}
    >
      <div className="bg-surface/95 border border-border rounded-lg px-3 py-2 text-star text-xs shadow-lg backdrop-blur-sm max-w-[200px] whitespace-nowrap">
        <p className="font-semibold text-accent">{node.label}</p>
        <div className="flex items-center gap-2 text-star/60">
          <span>{KIND_LABELS[node.kind] ?? node.kind}</span>
          {node.medium && <span className="capitalize">{node.medium}</span>}
          {node.score !== undefined && <span>Score: {node.score.toFixed(1)}</span>}
          {node.category && <span className="capitalize">{node.category.replace(/_/g, ' ')}</span>}
        </div>
      </div>
    </Html>
  )
}
