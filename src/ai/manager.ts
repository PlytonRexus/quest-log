// Main-thread AI manager: promise-based API over the Transformers.js Web Worker

import type { ModelStatus, TfWorkerRequest, TfWorkerResponse } from './protocol'
import { generateRequestId } from './protocol'

interface PendingRequest {
  resolve: (value: unknown) => void
  reject: (error: Error) => void
  timer?: ReturnType<typeof setTimeout>
}

type StatusListener = (status: ModelStatus, progress?: number, message?: string) => void

export interface AiManagerOptions {
  workerFactory?: () => Worker
  requestTimeoutMs?: number
}

export class AiManager {
  private worker: Worker | null = null
  private status: ModelStatus = 'idle'
  private pending = new Map<string, PendingRequest>()
  private statusListeners = new Set<StatusListener>()
  private options: AiManagerOptions

  constructor(options?: AiManagerOptions) {
    this.options = options ?? {}
  }

  private createWorker(): Worker {
    if (this.options.workerFactory) {
      return this.options.workerFactory()
    }
    return new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' })
  }

  private ensureWorker(): Worker {
    if (!this.worker) {
      this.worker = this.createWorker()
      this.worker.onmessage = (e: MessageEvent<TfWorkerResponse>) => {
        this.handleMessage(e.data)
      }
      this.worker.onerror = (e) => {
        this.setStatus('error')
        for (const [, req] of this.pending) {
          if (req.timer) clearTimeout(req.timer)
          req.reject(new Error(e.message || 'Worker error'))
        }
        this.pending.clear()
      }
    }
    return this.worker
  }

  private handleMessage(msg: TfWorkerResponse) {
    switch (msg.type) {
      case 'status':
        this.setStatus(msg.status, msg.progress, msg.message)
        break

      case 'initResult': {
        const req = this.pending.get(msg.requestId)
        if (!req) break
        this.pending.delete(msg.requestId)
        if (req.timer) clearTimeout(req.timer)
        if (msg.success) {
          req.resolve(undefined)
        } else {
          req.reject(new Error(msg.error ?? 'Init failed'))
        }
        break
      }

      case 'embedResult': {
        const req = this.pending.get(msg.requestId)
        if (!req) break
        this.pending.delete(msg.requestId)
        if (req.timer) clearTimeout(req.timer)
        if (msg.error) {
          req.reject(new Error(msg.error))
        } else {
          req.resolve(msg.vector)
        }
        break
      }

      case 'classifyResult': {
        const req = this.pending.get(msg.requestId)
        if (!req) break
        this.pending.delete(msg.requestId)
        if (req.timer) clearTimeout(req.timer)
        if (msg.error) {
          req.reject(new Error(msg.error))
        } else {
          req.resolve(msg.scores)
        }
        break
      }

      case 'classifyBatchResult': {
        const req = this.pending.get(msg.requestId)
        if (!req) break
        this.pending.delete(msg.requestId)
        if (req.timer) clearTimeout(req.timer)
        if (msg.error) {
          req.reject(new Error(msg.error))
        } else {
          req.resolve(msg.results)
        }
        break
      }

      case 'error': {
        const req = this.pending.get(msg.requestId)
        if (!req) break
        this.pending.delete(msg.requestId)
        if (req.timer) clearTimeout(req.timer)
        req.reject(new Error(msg.message))
        break
      }
    }
  }

  private setStatus(status: ModelStatus, progress?: number, message?: string) {
    this.status = status
    for (const listener of this.statusListeners) {
      listener(status, progress, message)
    }
  }

  private sendRequest<T>(msg: TfWorkerRequest): Promise<T> {
    const worker = this.ensureWorker()
    const timeoutMs = this.options.requestTimeoutMs ?? 60000

    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(msg.requestId)
        reject(new Error(`Request ${msg.type} timed out after ${timeoutMs}ms`))
      }, timeoutMs)

      this.pending.set(msg.requestId, {
        resolve: resolve as (v: unknown) => void,
        reject,
        timer,
      })

      worker.postMessage(msg)
    })
  }

  async initModels(): Promise<void> {
    const requestId = generateRequestId()
    await this.sendRequest<void>({ type: 'init', requestId })
  }

  async embed(text: string): Promise<number[]> {
    const requestId = generateRequestId()
    return this.sendRequest<number[]>({ type: 'embed', requestId, text })
  }

  async classify(
    text: string,
    labels: string[],
  ): Promise<{ label: string; score: number }[]> {
    const requestId = generateRequestId()
    return this.sendRequest<{ label: string; score: number }[]>({
      type: 'classify',
      requestId,
      text,
      labels,
    })
  }

  async classifyBatch(
    items: { id: string; text: string }[],
    labels: string[],
  ): Promise<{ id: string; scores: { label: string; score: number }[] }[]> {
    const requestId = generateRequestId()
    return this.sendRequest<{ id: string; scores: { label: string; score: number }[] }[]>({
      type: 'classifyBatch',
      requestId,
      items,
      labels,
    })
  }

  getStatus(): ModelStatus {
    return this.status
  }

  isReady(): boolean {
    return this.status === 'ready'
  }

  onStatusChange(listener: StatusListener): () => void {
    this.statusListeners.add(listener)
    return () => {
      this.statusListeners.delete(listener)
    }
  }

  terminate() {
    if (this.worker) {
      this.worker.terminate()
      this.worker = null
    }
    for (const [, req] of this.pending) {
      if (req.timer) clearTimeout(req.timer)
      req.reject(new Error('Manager terminated'))
    }
    this.pending.clear()
    this.setStatus('idle')
  }
}

// Module-level singleton for the app
export const aiManager = new AiManager()
