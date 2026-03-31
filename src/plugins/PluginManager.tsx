import { useState, useCallback } from 'react'
import { usePlugins } from './PluginContext'
import { BUILTIN_PLUGINS } from './builtinPlugins'
import { PluginLoader } from './PluginLoader'
import type { PortalPlugin } from './types'

export function PluginManager() {
  const { state, register, unregister } = usePlugins()
  const [pluginUrl, setPluginUrl] = useState('')
  const [loadUrl, setLoadUrl] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  const registeredIds = new Set(state.plugins.map((p) => p.id))

  const handleLoadPlugin = useCallback(() => {
    if (!pluginUrl.trim()) return
    setLoadError(null)
    setLoadUrl(pluginUrl.trim())
  }, [pluginUrl])

  const handlePluginLoaded = useCallback(
    (plugin: PortalPlugin) => {
      register(plugin)
      setLoadUrl(null)
      setPluginUrl('')
    },
    [register],
  )

  const handlePluginError = useCallback((error: Error) => {
    setLoadError(error.message)
    setLoadUrl(null)
  }, [])

  return (
    <div className="space-y-3" data-testid="plugin-manager">
      <h3 className="text-sm font-semibold text-accent">Plugins</h3>
      <div className="space-y-2">
        {BUILTIN_PLUGINS.map((plugin) => {
          const isEnabled = registeredIds.has(plugin.id)
          return (
            <div
              key={plugin.id}
              className="flex items-center justify-between bg-surface rounded-lg border border-border p-3"
            >
              <div>
                <p className="text-sm font-medium text-star">{plugin.name}</p>
                <p className="text-xs text-star/50">{plugin.description}</p>
                <p className="text-[10px] text-star/30 mt-1">v{plugin.version}</p>
              </div>
              <button
                onClick={() => {
                  if (isEnabled) {
                    unregister(plugin.id)
                  } else {
                    register(plugin)
                  }
                }}
                className={`px-3 py-1 text-xs rounded ${
                  isEnabled
                    ? 'bg-red-400/20 text-red-400 hover:bg-red-400/30'
                    : 'bg-accent/20 text-accent hover:bg-accent/30'
                }`}
              >
                {isEnabled ? 'Disable' : 'Enable'}
              </button>
            </div>
          )
        })}
      </div>

      {/* External plugin loader */}
      <div className="pt-2 border-t border-border">
        <h4 className="text-xs font-semibold text-star/60 mb-2">External Plugins</h4>
        <div className="flex gap-2">
          <input
            type="text"
            value={pluginUrl}
            onChange={(e) => setPluginUrl(e.target.value)}
            placeholder="Plugin URL or path"
            className="flex-1 px-2 py-1 text-xs bg-void border border-border rounded text-star placeholder:text-star/30"
            aria-label="Plugin URL"
            data-testid="plugin-url-input"
          />
          <button
            onClick={handleLoadPlugin}
            disabled={!pluginUrl.trim() || loadUrl !== null}
            className="px-3 py-1 text-xs bg-accent/20 text-accent hover:bg-accent/30 rounded disabled:opacity-50"
            data-testid="load-plugin-btn"
          >
            Load
          </button>
        </div>
        {loadUrl && (
          <PluginLoader
            pluginUrl={loadUrl}
            onLoaded={handlePluginLoaded}
            onError={handlePluginError}
          />
        )}
        {loadError && (
          <p className="text-xs text-red-400 mt-1" data-testid="plugin-load-error">
            {loadError}
          </p>
        )}
      </div>
    </div>
  )
}
