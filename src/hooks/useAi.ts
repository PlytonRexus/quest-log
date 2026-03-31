import { useState, useEffect, useCallback } from 'react'
import { aiManager } from '../ai/manager'
import type { ModelStatus } from '../ai/protocol'

export function useAi() {
  const [status, setStatus] = useState<ModelStatus>(aiManager.getStatus())
  const [progress, setProgress] = useState(0)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    const unsub = aiManager.onStatusChange((s, p, m) => {
      setStatus(s)
      if (p !== undefined) setProgress(p)
      if (m !== undefined) setMessage(m)
    })
    return unsub
  }, [])

  const initModels = useCallback(async () => {
    await aiManager.initModels()
  }, [])

  return {
    status,
    progress,
    message,
    isReady: status === 'ready',
    isLoading: status === 'loading',
    isError: status === 'error',
    initModels,
  }
}
