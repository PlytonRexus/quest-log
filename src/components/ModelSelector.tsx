import { useState } from 'react'
import { useLlm } from '../hooks/useLlm'
import { LLM_MODELS, type LlmSize } from '../ai/models'
import type { LlmProvider } from '../ai/protocol'

function GeminiTab() {
  const { apiKey, setApiKey, isReady } = useLlm()
  const [keyInput, setKeyInput] = useState(apiKey ?? '')

  const handleSave = () => {
    setApiKey(keyInput)
  }

  if (isReady && apiKey) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-400">
        <span>Gemini Flash ready</span>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-star/60 text-xs">
        Free API key from{' '}
        <a
          href="https://aistudio.google.com/app/apikey"
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent underline"
        >
          aistudio.google.com
        </a>
      </p>
      <div className="flex gap-2">
        <input
          type="password"
          value={keyInput}
          onChange={(e) => setKeyInput(e.target.value)}
          placeholder="Paste API key"
          className="flex-1 px-2 py-1.5 text-sm bg-void border border-border rounded text-star placeholder:text-star/30 focus:outline-none focus:border-accent"
        />
        <button
          onClick={handleSave}
          disabled={!keyInput.trim()}
          className="px-3 py-1.5 text-sm bg-accent/20 hover:bg-accent/30 text-accent border border-accent/30 rounded transition-colors disabled:opacity-40"
        >
          Save
        </button>
      </div>
    </div>
  )
}

function LocalTab() {
  const { progress, message, isReady, isLoading, isError, isWebGpuAvailable, initLlm } = useLlm()
  const [selectedSize, setSelectedSize] = useState<LlmSize>('small')

  if (!isWebGpuAvailable) {
    return (
      <p className="text-star/60 text-xs">
        WebGPU not available in this browser. Try Chrome 113+ or Edge 113+.
      </p>
    )
  }

  if (isReady) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-400">
        <span>Local LLM ready</span>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
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
    <div className="space-y-3">
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

const TABS: { id: LlmProvider; label: string }[] = [
  { id: 'gemini', label: 'Gemini Flash' },
  { id: 'local', label: 'Local LLM' },
]

export function ModelSelector() {
  const { provider, setProvider } = useLlm()

  return (
    <div className="p-4 bg-surface rounded-lg border border-border space-y-3">
      <div className="flex gap-1 bg-void rounded p-0.5">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setProvider(tab.id)}
            className={`flex-1 px-2 py-1 text-xs rounded transition-colors ${
              provider === tab.id
                ? 'bg-accent text-void font-semibold'
                : 'text-star/60 hover:text-star/80'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {provider === 'gemini' ? <GeminiTab /> : <LocalTab />}
    </div>
  )
}
