// Main-thread LLM manager: promise-based API over the WebLLM Web Worker

import type { ModelStatus, LlmWorkerRequest, LlmWorkerResponse } from './protocol'
import { generateRequestId } from './protocol'
import { LLM_MODELS, type LlmSize } from './models'

interface PendingRequest {
  resolve: (value: unknown) => void
  reject: (error: Error) => void
  timer?: ReturnType<typeof setTimeout>
}

type StatusListener = (status: ModelStatus, progress?: number, message?: string) => void
type TokenListener = (token: string, done: boolean) => void

export interface LlmManagerOptions {
  workerFactory?: () => Worker
  requestTimeoutMs?: number
}

export class LlmManager {
  private worker: Worker | null = null
  private status: ModelStatus = 'idle'
  private pending = new Map<string, PendingRequest>()
  private statusListeners = new Set<StatusListener>()
  private tokenListeners = new Map<string, TokenListener>()
  private options: LlmManagerOptions
  private currentGenerateId: string | null = null

  constructor(options?: LlmManagerOptions) {
    this.options = options ?? {}
  }

  private createWorker(): Worker {
    if (this.options.workerFactory) {
      return this.options.workerFactory()
    }
    return new Worker(new URL('./llmWorker.ts', import.meta.url), { type: 'module' })
  }

  private ensureWorker(): Worker {
    if (!this.worker) {
      this.worker = this.createWorker()
      this.worker.onmessage = (e: MessageEvent<LlmWorkerResponse>) => {
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

  private handleMessage(msg: LlmWorkerResponse) {
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
          req.reject(new Error(msg.error ?? 'LLM init failed'))
        }
        break
      }

      case 'token': {
        const listener = this.tokenListeners.get(msg.requestId)
        if (listener) {
          listener(msg.token, msg.done)
        }
        break
      }

      case 'generateResult': {
        const req = this.pending.get(msg.requestId)
        if (!req) break
        this.pending.delete(msg.requestId)
        this.tokenListeners.delete(msg.requestId)
        if (req.timer) clearTimeout(req.timer)
        this.currentGenerateId = null
        if (msg.error) {
          req.reject(new Error(msg.error))
        } else {
          req.resolve(msg.fullText)
        }
        break
      }

      case 'error': {
        const req = this.pending.get(msg.requestId)
        if (!req) break
        this.pending.delete(msg.requestId)
        this.tokenListeners.delete(msg.requestId)
        if (req.timer) clearTimeout(req.timer)
        this.currentGenerateId = null
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

  async initLlm(size: LlmSize): Promise<void> {
    const model = LLM_MODELS[size]
    const worker = this.ensureWorker()
    const requestId = generateRequestId()
    const timeoutMs = this.options.requestTimeoutMs ?? 300000

    return new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(requestId)
        reject(new Error('LLM init timed out'))
      }, timeoutMs)

      this.pending.set(requestId, { resolve: resolve as (v: unknown) => void, reject, timer })
      worker.postMessage({ type: 'init', requestId, modelId: model.id } satisfies LlmWorkerRequest)
    })
  }

  async generateFull(
    messages: { role: string; content: string }[],
    options?: { maxTokens?: number; onToken?: TokenListener },
  ): Promise<string> {
    const worker = this.ensureWorker()
    const requestId = generateRequestId()
    const timeoutMs = this.options.requestTimeoutMs ?? 120000
    this.currentGenerateId = requestId

    if (options?.onToken) {
      this.tokenListeners.set(requestId, options.onToken)
    }

    return new Promise<string>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(requestId)
        this.tokenListeners.delete(requestId)
        this.currentGenerateId = null
        reject(new Error('Generation timed out'))
      }, timeoutMs)

      this.pending.set(requestId, { resolve: resolve as (v: unknown) => void, reject, timer })
      worker.postMessage({
        type: 'generate',
        requestId,
        messages,
        maxTokens: options?.maxTokens,
      } satisfies LlmWorkerRequest)
    })
  }

  abort() {
    if (this.currentGenerateId && this.worker) {
      this.worker.postMessage({
        type: 'abort',
        requestId: this.currentGenerateId,
      } satisfies LlmWorkerRequest)
    }
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
      req.reject(new Error('LLM manager terminated'))
    }
    this.pending.clear()
    this.tokenListeners.clear()
    this.currentGenerateId = null
    this.setStatus('idle')
  }

  static isWebGpuAvailable(): boolean {
    return typeof navigator !== 'undefined' && 'gpu' in navigator
  }
}

export const llmManager = new LlmManager()
