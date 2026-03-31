import { useAi } from '../hooks/useAi'

export function ModelLoader() {
  const { progress, message, isReady, isLoading, isError, initModels } = useAi()

  if (isReady) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-400">
        <span>AI Ready</span>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 text-sm">
        <div className="w-32 h-2 bg-surface rounded-full overflow-hidden">
          <div
            className="h-full bg-accent transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-star/60">{message ?? 'Loading models...'}</span>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="text-red-400">{message ?? 'Model loading failed'}</span>
        <button
          onClick={initModels}
          className="px-2 py-1 text-xs bg-surface hover:bg-surface-bright border border-border rounded transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  // idle
  return (
    <button
      onClick={initModels}
      className="px-3 py-1 text-sm bg-accent/20 hover:bg-accent/30 text-accent border border-accent/30 rounded transition-colors"
    >
      Load AI Models
    </button>
  )
}
