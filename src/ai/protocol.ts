// Message protocol for AI Web Workers
// Uses discriminated unions on 'type' field for exhaustive type checking

export type ModelStatus = 'idle' | 'loading' | 'ready' | 'error'
export type LlmProvider = 'local' | 'gemini'

let requestCounter = 0

export function generateRequestId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `req_${++requestCounter}_${Date.now()}`
}

// -- Transformers.js Worker --

export type TfWorkerRequest =
  | { type: 'init'; requestId: string }
  | { type: 'embed'; requestId: string; text: string }
  | { type: 'classify'; requestId: string; text: string; labels: string[] }
  | { type: 'classifyBatch'; requestId: string; items: { id: string; text: string }[]; labels: string[] }

export type TfWorkerResponse =
  | { type: 'status'; status: ModelStatus; progress?: number; message?: string }
  | { type: 'initResult'; requestId: string; success: boolean; error?: string }
  | { type: 'embedResult'; requestId: string; vector: number[]; error?: string }
  | { type: 'classifyResult'; requestId: string; scores: { label: string; score: number }[]; error?: string }
  | {
      type: 'classifyBatchResult'
      requestId: string
      results: { id: string; scores: { label: string; score: number }[] }[]
      error?: string
    }
  | { type: 'error'; requestId: string; message: string }

// -- WebLLM Worker --

export type LlmWorkerRequest =
  | { type: 'init'; requestId: string; modelId: string }
  | {
      type: 'generate'
      requestId: string
      messages: { role: string; content: string }[]
      maxTokens?: number
    }
  | { type: 'abort'; requestId: string }

export type LlmWorkerResponse =
  | { type: 'status'; status: ModelStatus; progress?: number; message?: string }
  | { type: 'initResult'; requestId: string; success: boolean; error?: string }
  | { type: 'token'; requestId: string; token: string; done: boolean }
  | { type: 'generateResult'; requestId: string; fullText: string; error?: string }
  | { type: 'error'; requestId: string; message: string }
