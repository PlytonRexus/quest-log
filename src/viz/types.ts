// Graph visualization types for the 3D galaxy view

export type NodeKind = 'work' | 'trope' | 'dimension'

export interface GraphNode {
  id: string
  kind: NodeKind
  label: string
  color: string
  size: number
  entityId: number
  // Optional metadata for tooltips
  medium?: string
  category?: string
  score?: number
  // Fog of war discovery state
  discoveryState?: 'hidden' | 'foggy' | 'revealed'
  // d3-force mutable position fields
  x?: number
  y?: number
  z?: number
  fx?: number | null
  fy?: number | null
  fz?: number | null
}

export interface GraphLink {
  source: string
  target: string
  weight: number
  kind: 'work-trope' | 'trope-trope' | 'work-work'
}

export interface GraphData {
  nodes: GraphNode[]
  links: GraphLink[]
}
