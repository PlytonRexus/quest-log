import type { Work, Trope, DimensionScore } from '../types'
import type { GraphNode, GraphLink } from '../viz/types'

export type PluginPermission =
  | 'db:read'
  | 'db:write'
  | 'graph:inject'
  | 'ui:panel'
  | 'events:subscribe'

export type PluginEventType =
  | 'workLogged'
  | 'tropeRevealed'
  | 'fogCleared'
  | 'xpAwarded'

export interface PluginPanelDef {
  id: string
  title: string
  component: React.ComponentType
}

export interface PluginViewTabDef {
  id: string
  label: string
  icon: string
  component: React.ComponentType
}

export interface PluginToolbarButtonDef {
  id: string
  label: string
  onClick: () => void
}

export interface PluginAPI {
  db: {
    getWorks: () => Promise<Work[]>
    getTropes: () => Promise<Trope[]>
    getDimensionScoresForWork: (workId: number) => Promise<DimensionScore[]>
    insertWork?: (work: Omit<Work, 'id'>) => Promise<Work>
  }
  ui: {
    registerPanel: (panel: PluginPanelDef) => void
    registerToolbarButton: (button: PluginToolbarButtonDef) => void
    registerViewTab: (tab: PluginViewTabDef) => void
  }
  events: {
    on: (event: PluginEventType, handler: (...args: unknown[]) => void) => () => void
  }
  graph?: {
    injectNodes: (nodes: GraphNode[]) => void
    injectLinks: (links: GraphLink[]) => void
    removeNodes: (nodeIds: string[]) => void
    removeLinks: (nodeIds: string[]) => void
  }
}

export interface PortalPlugin {
  id: string
  name: string
  version: string
  description: string
  permissions: PluginPermission[]
  activate: (api: PluginAPI) => void
  deactivate: () => void
}
