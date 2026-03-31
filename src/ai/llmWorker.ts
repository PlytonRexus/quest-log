// WebLLM Web Worker for generative LLM inference
// Requires WebGPU. Runs in a separate thread.

import { CreateMLCEngine, type MLCEngine } from '@mlc-ai/web-llm'
import type { LlmWorkerRequest, LlmWorkerResponse } from './protocol'

let engine: MLCEngine | null = null

function postResponse(response: LlmWorkerResponse) {
  self.postMessage(response)
}

async function handleInit(requestId: string, modelId: string) {
  try {
    postResponse({ type: 'status', status: 'loading', progress: 0, message: 'Downloading model...' })

    engine = await CreateMLCEngine(modelId, {
      initProgressCallback: (report) => {
        const progress = Math.round(report.progress * 100)
        postResponse({
          type: 'status',
          status: 'loading',
          progress,
          message: report.text,
        })
      },
    })

    postResponse({ type: 'status', status: 'ready', progress: 100, message: 'Model ready' })
    postResponse({ type: 'initResult', requestId, success: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    postResponse({ type: 'status', status: 'error', message })
    postResponse({ type: 'initResult', requestId, success: false, error: message })
  }
}

let abortController: AbortController | null = null

async function handleGenerate(
  requestId: string,
  messages: { role: string; content: string }[],
  maxTokens?: number,
) {
  if (!engine) {
    postResponse({ type: 'error', requestId, message: 'LLM not loaded' })
    return
  }

  abortController = new AbortController()
  let fullText = ''

  try {
    const chatMessages = messages.map((m) => ({
      role: m.role as 'system' | 'user' | 'assistant',
      content: m.content,
    }))

    const chunks = await engine.chat.completions.create({
      messages: chatMessages,
      max_tokens: maxTokens ?? 1024,
      stream: true,
    })

    for await (const chunk of chunks) {
      if (abortController.signal.aborted) break

      const token = chunk.choices[0]?.delta?.content ?? ''
      if (token) {
        fullText += token
        postResponse({ type: 'token', requestId, token, done: false })
      }
    }

    postResponse({ type: 'token', requestId, token: '', done: true })
    postResponse({ type: 'generateResult', requestId, fullText })
  } catch (err) {
    if (abortController.signal.aborted) {
      postResponse({ type: 'generateResult', requestId, fullText })
    } else {
      const message = err instanceof Error ? err.message : String(err)
      postResponse({ type: 'error', requestId, message })
    }
  } finally {
    abortController = null
  }
}

function handleAbort() {
  if (abortController) {
    abortController.abort()
  }
}

self.onmessage = async (e: MessageEvent<LlmWorkerRequest>) => {
  const msg = e.data
  switch (msg.type) {
    case 'init':
      await handleInit(msg.requestId, msg.modelId)
      break
    case 'generate':
      await handleGenerate(msg.requestId, msg.messages, msg.maxTokens)
      break
    case 'abort':
      handleAbort()
      break
  }
}
