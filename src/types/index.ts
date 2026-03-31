export interface Work {
  id: number
  title: string
  medium: string
  year: number | null
  coverUrl: string | null
  primaryScore: number | null
  comfortScore: number | null
  consumptionMode: string | null
  dateConsumed: string | null
  notes: string | null
}

export interface Dimension {
  id: number
  name: string
  weight: number
  isLoadBearing: number
  framework: string
  description: string | null
}

export interface DimensionScore {
  id: number
  workId: number
  dimensionId: number
  score: number
  reasoning: string | null
}

export interface Trope {
  id: number
  name: string
  category: string
  description: string | null
}

export interface WorkTrope {
  id: number
  workId: number
  tropeId: number
  confidence: number
  source: string
}

export interface TropeRelation {
  id: number
  tropeAId: number
  tropeBId: number
  relationshipType: string | null
  weight: number
}

export interface Review {
  id: number
  workId: number
  rawMarkdown: string
  parsedMetadata: string | null
  importedFrom: string | null
  createdAt: string
}

export interface Embedding {
  id: number
  entityType: string
  entityId: number
  vector: ArrayBuffer
  modelName: string
}

export interface DiscoveryState {
  id: number
  tropeId: number
  state: string
  revealedAt: string | null
  revealedBy: number | null
}

export interface SkillTreeNode {
  id: number
  tropeId: number | null
  parentNodeId: number | null
  xpRequired: number
  xpCurrent: number
  state: string
  tier: number
}

export interface UserProgress {
  id: number
  totalXp: number
  worksLogged: number
  tropesDiscovered: number
  fogPercentRevealed: number
  lastActivity: string | null
}

export interface WorkProfile {
  work: Work
  dimensionScores: (DimensionScore & { dimensionName: string })[]
  tropes: (Trope & { confidence: number })[]
}

export interface ParsedReviewData {
  frontmatter: {
    title?: string
    rating?: number
    date?: string
    tags?: string[]
    medium?: string
  }
  plainText: string
  wordCount: number
  keywords: string[]
  engagementScore: number
}

export interface ImportReport {
  imported: number
  skipped: number
  errors: string[]
}

export type CanvasElementType = 'trope' | 'work' | 'sticky'

export interface CanvasElement {
  id: number
  type: CanvasElementType
  entityId: number | null
  x: number
  y: number
  width: number
  height: number
  content: string | null
  color: string | null
}

export interface CanvasConnection {
  id: number
  sourceElementId: number
  targetElementId: number
  label: string | null
}
