import {
  getWorks,
  getTropes,
  getDimensionScoresForWork,
  insertWork,
} from '../db/dal'
import {
  addOverlayNodes,
  addOverlayLinks,
  removeOverlayNodes,
  removeOverlayLinks,
} from './graphOverlay'
import type {
  PluginAPI,
  PluginPermission,
  PluginPanelDef,
  PluginViewTabDef,
  PluginToolbarButtonDef,
  PluginEventType,
} from './types'

export class PermissionError extends Error {
  constructor(permission: string, action: string) {
    super(`Plugin lacks '${permission}' permission for action: ${action}`)
    this.name = 'PermissionError'
  }
}

type EventListeners = Map<PluginEventType, Set<(...args: unknown[]) => void>>

interface PluginUIRegistry {
  panels: PluginPanelDef[]
  toolbarButtons: PluginToolbarButtonDef[]
  viewTabs: PluginViewTabDef[]
}

export function createPluginAPI(
  pluginId: string,
  permissions: PluginPermission[],
  uiRegistry: PluginUIRegistry,
  eventListeners: EventListeners,
): PluginAPI {
  const permSet = new Set(permissions)

  function requirePermission(perm: PluginPermission, action: string) {
    if (!permSet.has(perm)) {
      throw new PermissionError(perm, action)
    }
  }

  return {
    db: {
      getWorks: async () => {
        requirePermission('db:read', 'getWorks')
        return getWorks()
      },
      getTropes: async () => {
        requirePermission('db:read', 'getTropes')
        return getTropes()
      },
      getDimensionScoresForWork: async (workId: number) => {
        requirePermission('db:read', 'getDimensionScoresForWork')
        return getDimensionScoresForWork(workId)
      },
      insertWork: permSet.has('db:write')
        ? async (work) => insertWork(work as Parameters<typeof insertWork>[0])
        : undefined,
    },
    ui: {
      registerPanel: (panel: PluginPanelDef) => {
        requirePermission('ui:panel', 'registerPanel')
        uiRegistry.panels.push(panel)
      },
      registerToolbarButton: (button: PluginToolbarButtonDef) => {
        requirePermission('ui:panel', 'registerToolbarButton')
        uiRegistry.toolbarButtons.push(button)
      },
      registerViewTab: (tab: PluginViewTabDef) => {
        requirePermission('ui:panel', 'registerViewTab')
        uiRegistry.viewTabs.push(tab)
      },
    },
    events: {
      on: (event: PluginEventType, handler: (...args: unknown[]) => void) => {
        requirePermission('events:subscribe', 'on')
        if (!eventListeners.has(event)) {
          eventListeners.set(event, new Set())
        }
        eventListeners.get(event)!.add(handler)
        // Return unsubscribe function
        return () => {
          eventListeners.get(event)?.delete(handler)
        }
      },
    },
    graph: permSet.has('graph:inject')
      ? {
          injectNodes: (nodes) => {
            requirePermission('graph:inject', 'injectNodes')
            addOverlayNodes(pluginId, nodes)
          },
          injectLinks: (links) => {
            requirePermission('graph:inject', 'injectLinks')
            addOverlayLinks(pluginId, links)
          },
          removeNodes: (nodeIds) => {
            requirePermission('graph:inject', 'removeNodes')
            removeOverlayNodes(pluginId, nodeIds)
          },
          removeLinks: (nodeIds) => {
            requirePermission('graph:inject', 'removeLinks')
            removeOverlayLinks(pluginId, nodeIds)
          },
        }
      : undefined,
  }
}

// Fire an event to all registered listeners
export function firePluginEvent(
  listeners: EventListeners,
  event: PluginEventType,
  ...args: unknown[]
) {
  const handlers = listeners.get(event)
  if (handlers) {
    for (const handler of handlers) {
      try {
        handler(...args)
      } catch {
        // Plugin event handler errors should not crash the app
      }
    }
  }
}
