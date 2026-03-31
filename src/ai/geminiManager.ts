// Gemini Flash manager: streaming REST API with same interface as LlmManager

import type { ModelStatus } from './protocol'

const GEMINI_MODEL = 'gemini-2.0-flash'
const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'
const STORAGE_KEY = 'gemini-api-key'

type StatusListener = (status: ModelStatus, progress?: number, message?: string) => void
type TokenListener = (token: string, done: boolean) => void

export class GeminiManager {
  private status: ModelStatus = 'idle'
  private statusListeners = new Set<StatusListener>()
  private abortController: AbortController | null = null

  constructor() {
    // If API key exists in storage, mark as ready
    if (this.getApiKey()) {
      this.status = 'ready'
    }
  }

  getApiKey(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEY)
    } catch {
      return null
    }
  }

  setApiKey(key: string) {
    try {
      if (key.trim()) {
        localStorage.setItem(STORAGE_KEY, key.trim())
        this.setStatus('ready')
      } else {
        localStorage.removeItem(STORAGE_KEY)
        this.setStatus('idle')
      }
    } catch {
      this.setStatus('error', undefined, 'Failed to save API key')
    }
  }

  private setStatus(status: ModelStatus, progress?: number, message?: string) {
    this.status = status
    for (const listener of this.statusListeners) {
      listener(status, progress, message)
    }
  }

  async generateFull(
    messages: { role: string; content: string }[],
    options?: { maxTokens?: number; onToken?: TokenListener },
  ): Promise<string> {
    const apiKey = this.getApiKey()
    if (!apiKey) {
      throw new Error('Gemini API key not set')
    }

    // Convert OpenAI-style messages to Gemini format
    const systemParts: string[] = []
    const contents: { role: string; parts: { text: string }[] }[] = []

    for (const msg of messages) {
      if (msg.role === 'system') {
        systemParts.push(msg.content)
      } else {
        contents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        })
      }
    }

    const body: Record<string, unknown> = { contents }
    if (systemParts.length > 0) {
      body.systemInstruction = {
        parts: systemParts.map((text) => ({ text })),
      }
    }
    if (options?.maxTokens) {
      body.generationConfig = { maxOutputTokens: options.maxTokens }
    }

    this.abortController = new AbortController()

    const url = `${API_BASE}/${GEMINI_MODEL}:streamGenerateContent?alt=sse&key=${apiKey}`
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: this.abortController.signal,
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText)
      throw new Error(`Gemini API error (${response.status}): ${errorText}`)
    }

    if (!response.body) {
      throw new Error('No response body from Gemini API')
    }

    // Parse SSE stream
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let fullText = ''
    let buffer = ''

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })

        // Process complete SSE events from the buffer
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const jsonStr = line.slice(6).trim()
          if (!jsonStr || jsonStr === '[DONE]') continue

          try {
            const parsed = JSON.parse(jsonStr)
            const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
            if (text) {
              fullText += text
              options?.onToken?.(text, false)
            }
          } catch {
            // Skip malformed JSON chunks
          }
        }
      }
    } finally {
      this.abortController = null
    }

    options?.onToken?.('', true)
    return fullText
  }

  abort() {
    if (this.abortController) {
      this.abortController.abort()
      this.abortController = null
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
}

export const geminiManager = new GeminiManager()
