import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react'
import { createPluginAPI } from './PluginAPI'
import type {
  PortalPlugin,
  PluginPanelDef,
  PluginViewTabDef,
  PluginToolbarButtonDef,
  PluginEventType,
} from './types'

interface PluginRegistryState {
  plugins: PortalPlugin[]
  panels: PluginPanelDef[]
  viewTabs: PluginViewTabDef[]
  toolbarButtons: PluginToolbarButtonDef[]
}

interface PluginContextValue {
  state: PluginRegistryState
  register: (plugin: PortalPlugin) => void
  unregister: (pluginId: string) => void
  listPlugins: () => PortalPlugin[]
  getPlugin: (id: string) => PortalPlugin | undefined
}

const PluginCtx = createContext<PluginContextValue>({
  state: { plugins: [], panels: [], viewTabs: [], toolbarButtons: [] },
  register: () => {},
  unregister: () => {},
  listPlugins: () => [],
  getPlugin: () => undefined,
})

export function PluginProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PluginRegistryState>({
    plugins: [],
    panels: [],
    viewTabs: [],
    toolbarButtons: [],
  })

  const eventListenersRef = useRef<Map<PluginEventType, Set<(...args: unknown[]) => void>>>(
    new Map(),
  )

  const register = useCallback((plugin: PortalPlugin) => {
    setState((prev) => {
      // Prevent double registration
      if (prev.plugins.some((p) => p.id === plugin.id)) return prev

      const uiRegistry = {
        panels: [...prev.panels],
        toolbarButtons: [...prev.toolbarButtons],
        viewTabs: [...prev.viewTabs],
      }

      const api = createPluginAPI(plugin.id, plugin.permissions, uiRegistry, eventListenersRef.current)
      plugin.activate(api)

      return {
        plugins: [...prev.plugins, plugin],
        panels: uiRegistry.panels,
        viewTabs: uiRegistry.viewTabs,
        toolbarButtons: uiRegistry.toolbarButtons,
      }
    })
  }, [])

  const unregister = useCallback((pluginId: string) => {
    setState((prev) => {
      const plugin = prev.plugins.find((p) => p.id === pluginId)
      if (!plugin) return prev

      plugin.deactivate()

      return {
        plugins: prev.plugins.filter((p) => p.id !== pluginId),
        // Remove UI registrations from this plugin
        panels: prev.panels.filter((p) => !p.id.startsWith(pluginId)),
        viewTabs: prev.viewTabs.filter((t) => !t.id.startsWith(pluginId)),
        toolbarButtons: prev.toolbarButtons.filter((b) => !b.id.startsWith(pluginId)),
      }
    })
  }, [])

  const listPlugins = useCallback(() => state.plugins, [state.plugins])

  const getPlugin = useCallback(
    (id: string) => state.plugins.find((p) => p.id === id),
    [state.plugins],
  )

  return (
    <PluginCtx.Provider value={{ state, register, unregister, listPlugins, getPlugin }}>
      {children}
    </PluginCtx.Provider>
  )
}

export function usePlugins() {
  return useContext(PluginCtx)
}
