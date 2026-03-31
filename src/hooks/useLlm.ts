import { useState, useEffect, useCallback } from 'react'
import { llmManager, LlmManager } from '../ai/llmManager'
import { geminiManager } from '../ai/geminiManager'
import type { ModelStatus, LlmProvider } from '../ai/protocol'
import type { LlmSize } from '../ai/models'

const PROVIDER_KEY = 'llm-provider'

function loadProvider(): LlmProvider {
  try {
    const saved = localStorage.getItem(PROVIDER_KEY)
    if (saved === 'local' || saved === 'gemini') return saved
  } catch { /* fallback */ }
  return 'gemini'
}

export function useLlm() {
  const [provider, setProviderState] = useState<LlmProvider>(loadProvider)
  const [localStatus, setLocalStatus] = useState<ModelStatus>(llmManager.getStatus())
  const [geminiStatus, setGeminiStatus] = useState<ModelStatus>(geminiManager.getStatus())
  const [progress, setProgress] = useState(0)
  const [message, setMessage] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    const unsub = llmManager.onStatusChange((s, p, m) => {
      setLocalStatus(s)
      if (p !== undefined) setProgress(p)
      if (m !== undefined) setMessage(m)
    })
    return unsub
  }, [])

  useEffect(() => {
    const unsub = geminiManager.onStatusChange((s) => {
      setGeminiStatus(s)
    })
    return unsub
  }, [])

  const setProvider = useCallback((p: LlmProvider) => {
    setProviderState(p)
    try { localStorage.setItem(PROVIDER_KEY, p) } catch { /* ignore */ }
  }, [])

  const status = provider === 'gemini' ? geminiStatus : localStatus

  const initLlm = useCallback(async (size: LlmSize) => {
    await llmManager.initLlm(size)
  }, [])

  const setApiKey = useCallback((key: string) => {
    geminiManager.setApiKey(key)
  }, [])

  const apiKey = geminiManager.getApiKey()

  const generate = useCallback(async (
    messages: { role: string; content: string }[],
    options?: { maxTokens?: number; onToken?: (token: string, done: boolean) => void },
  ): Promise<string> => {
    setIsGenerating(true)
    try {
      if (provider === 'gemini') {
        return await geminiManager.generateFull(messages, options)
      }
      return await llmManager.generateFull(messages, options)
    } finally {
      setIsGenerating(false)
    }
  }, [provider])

  const abort = useCallback(() => {
    if (provider === 'gemini') {
      geminiManager.abort()
    } else {
      llmManager.abort()
    }
  }, [provider])

  return {
    provider,
    setProvider,
    status,
    progress,
    message,
    isReady: status === 'ready',
    isLoading: status === 'loading',
    isError: status === 'error',
    isGenerating,
    isWebGpuAvailable: LlmManager.isWebGpuAvailable(),
    initLlm,
    generate,
    abort,
    apiKey,
    setApiKey,
  }
}
