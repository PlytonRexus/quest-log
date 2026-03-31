import { useEffect, useState } from 'react'
import type { PortalPlugin } from './types'
import { validatePlugin } from './validatePlugin'

interface PluginLoaderProps {
  pluginUrl: string
  onLoaded: (plugin: PortalPlugin) => void
  onError: (error: Error) => void
}

export function PluginLoader({ pluginUrl, onLoaded, onError }: PluginLoaderProps) {
  const [status, setStatus] = useState<'loading' | 'done' | 'error'>('loading')

  useEffect(() => {
    let cancelled = false

    async function loadPlugin() {
      try {
        const module = await import(/* @vite-ignore */ pluginUrl)
        if (cancelled) return
        const plugin = validatePlugin(module)
        setStatus('done')
        onLoaded(plugin)
      } catch (err) {
        if (cancelled) return
        setStatus('error')
        onError(err instanceof Error ? err : new Error(String(err)))
      }
    }

    loadPlugin()

    return () => {
      cancelled = true
    }
  }, [pluginUrl, onLoaded, onError])

  if (status === 'loading') {
    return (
      <div className="text-xs text-star/50 animate-pulse" data-testid="plugin-loader-loading">
        Loading plugin...
      </div>
    )
  }

  return null
}
