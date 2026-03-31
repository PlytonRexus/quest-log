import { useState, useEffect, useCallback } from 'react'
import { llmManager, LlmManager } from '../ai/llmManager'
import type { ModelStatus } from '../ai/protocol'
import type { LlmSize } from '../ai/models'

export function useLlm() {
  const [status, setStatus] = useState<ModelStatus>(llmManager.getStatus())
  const [progress, setProgress] = useState(0)
  const [message, setMessage] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    const unsub = llmManager.onStatusChange((s, p, m) => {
      setStatus(s)
      if (p !== undefined) setProgress(p)
      if (m !== undefined) setMessage(m)
    })
    return unsub
  }, [])

  const initLlm = useCallback(async (size: LlmSize) => {
    await llmManager.initLlm(size)
  }, [])

  const generate = useCallback(async (
    messages: { role: string; content: string }[],
    options?: { maxTokens?: number; onToken?: (token: string, done: boolean) => void },
  ): Promise<string> => {
    setIsGenerating(true)
    try {
      return await llmManager.generateFull(messages, options)
    } finally {
      setIsGenerating(false)
    }
  }, [])

  const abort = useCallback(() => {
    llmManager.abort()
  }, [])

  return {
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
  }
}
