import { useState } from 'react'
import { useLlm } from '../hooks/useLlm'
import { LLM_MODELS, type LlmSize } from '../ai/models'

export function ModelSelector() {
  const { progress, message, isReady, isLoading, isError, isWebGpuAvailable, initLlm } = useLlm()
  const [selectedSize, setSelectedSize] = useState<LlmSize>('small')

  if (!isWebGpuAvailable) {
    return (
      <div className="p-4 bg-surface rounded-lg border border-border">
        <p className="text-star/60 text-sm">
          WebGPU is not available in this browser. The local LLM requires WebGPU support.
          Try Chrome 113+ or Edge 113+.
        </p>
      </div>
    )
  }

  if (isReady) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-400">
        <span>LLM Ready</span>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="p-4 bg-surface rounded-lg border border-border space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-48 h-2 bg-void rounded-full overflow-hidden">
            <div
              className="h-full bg-nebula transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-star/60 text-sm">{progress}%</span>
        </div>
        <p className="text-star/40 text-xs">{message ?? 'Loading LLM...'}</p>
      </div>
    )
  }

  return (
    <div className="p-4 bg-surface rounded-lg border border-border space-y-3">
      <h3 className="text-sm font-medium text-star/80">Local LLM</h3>

      <div className="space-y-2">
        {(Object.entries(LLM_MODELS) as [LlmSize, typeof LLM_MODELS[LlmSize]][]).map(([size, model]) => (
          <label key={size} className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="llmSize"
              value={size}
              checked={selectedSize === size}
              onChange={() => setSelectedSize(size)}
              className="accent-accent"
            />
            <span className="text-sm text-star">{model.label}</span>
          </label>
        ))}
      </div>

      {isError && (
        <p className="text-red-400 text-xs">{message ?? 'Failed to load model'}</p>
      )}

      <button
        onClick={() => initLlm(selectedSize)}
        className="px-3 py-1.5 text-sm bg-nebula/30 hover:bg-nebula/40 text-purple-300 border border-nebula/30 rounded transition-colors"
      >
        {isError ? 'Retry' : 'Load Model'}
      </button>
    </div>
  )
}
