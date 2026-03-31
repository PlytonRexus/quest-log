import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { LlmManager } from '../llmManager'
import type { LlmWorkerResponse } from '../protocol'

interface MockWorker {
  postMessage: ReturnType<typeof vi.fn>
  terminate: ReturnType<typeof vi.fn>
  onmessage: ((e: MessageEvent<LlmWorkerResponse>) => void) | null
  onerror: ((e: ErrorEvent) => void) | null
  simulateMessage: (data: LlmWorkerResponse) => void
}

function createMockWorker(): MockWorker {
  const mock: MockWorker = {
    postMessage: vi.fn(),
    terminate: vi.fn(),
    onmessage: null,
    onerror: null,
    simulateMessage(data: LlmWorkerResponse) {
      if (mock.onmessage) {
        mock.onmessage(new MessageEvent('message', { data }))
      }
    },
  }
  return mock
}

describe('LlmManager', () => {
  let mockWorker: MockWorker
  let manager: LlmManager

  beforeEach(() => {
    mockWorker = createMockWorker()
    manager = new LlmManager({
      workerFactory: () => mockWorker as unknown as Worker,
      requestTimeoutMs: 5000,
    })
  })

  afterEach(() => {
    manager.terminate()
  })

  it('starts in idle status', () => {
    expect(manager.getStatus()).toBe('idle')
    expect(manager.isReady()).toBe(false)
  })

  it('initLlm sends init message with model ID', async () => {
    const initPromise = manager.initLlm('small')

    expect(mockWorker.postMessage).toHaveBeenCalledOnce()
    const msg = mockWorker.postMessage.mock.calls[0][0]
    expect(msg.type).toBe('init')
    expect(msg.modelId).toBe('Llama-3.2-1B-Instruct-q4f16_1-MLC')

    mockWorker.simulateMessage({
      type: 'initResult',
      requestId: msg.requestId,
      success: true,
    })

    await expect(initPromise).resolves.toBeUndefined()
  })

  it('initLlm rejects on failure', async () => {
    const initPromise = manager.initLlm('small')
    const msg = mockWorker.postMessage.mock.calls[0][0]

    mockWorker.simulateMessage({
      type: 'initResult',
      requestId: msg.requestId,
      success: false,
      error: 'WebGPU not available',
    })

    await expect(initPromise).rejects.toThrow('WebGPU not available')
  })

  it('generateFull resolves with full text', async () => {
    const genPromise = manager.generateFull([
      { role: 'user', content: 'Hello' },
    ])
    const msg = mockWorker.postMessage.mock.calls[0][0]
    expect(msg.type).toBe('generate')

    mockWorker.simulateMessage({
      type: 'token', requestId: msg.requestId, token: 'Hi', done: false,
    })
    mockWorker.simulateMessage({
      type: 'token', requestId: msg.requestId, token: ' there', done: false,
    })
    mockWorker.simulateMessage({
      type: 'token', requestId: msg.requestId, token: '', done: true,
    })
    mockWorker.simulateMessage({
      type: 'generateResult', requestId: msg.requestId, fullText: 'Hi there',
    })

    const result = await genPromise
    expect(result).toBe('Hi there')
  })

  it('generateFull calls onToken callback for each token', async () => {
    const onToken = vi.fn()
    const genPromise = manager.generateFull(
      [{ role: 'user', content: 'Hello' }],
      { onToken },
    )
    const msg = mockWorker.postMessage.mock.calls[0][0]

    mockWorker.simulateMessage({
      type: 'token', requestId: msg.requestId, token: 'Hi', done: false,
    })
    mockWorker.simulateMessage({
      type: 'token', requestId: msg.requestId, token: ' there', done: true,
    })
    mockWorker.simulateMessage({
      type: 'generateResult', requestId: msg.requestId, fullText: 'Hi there',
    })

    await genPromise

    expect(onToken).toHaveBeenCalledTimes(2)
    expect(onToken).toHaveBeenCalledWith('Hi', false)
    expect(onToken).toHaveBeenCalledWith(' there', true)
  })

  it('abort sends abort message to worker', async () => {
    manager.generateFull([{ role: 'user', content: 'Hello' }]).catch(() => {})
    const msg = mockWorker.postMessage.mock.calls[0][0]

    manager.abort()

    expect(mockWorker.postMessage).toHaveBeenCalledTimes(2)
    const abortMsg = mockWorker.postMessage.mock.calls[1][0]
    expect(abortMsg.type).toBe('abort')
    expect(abortMsg.requestId).toBe(msg.requestId)

    // Clean up
    mockWorker.simulateMessage({
      type: 'generateResult', requestId: msg.requestId, fullText: '',
    })
  })

  it('tracks status changes', async () => {
    const listener = vi.fn()
    manager.onStatusChange(listener)

    const initPromise = manager.initLlm('small')
    const msg = mockWorker.postMessage.mock.calls[0][0]

    mockWorker.simulateMessage({
      type: 'status', status: 'loading', progress: 50, message: 'Downloading...',
    })

    expect(listener).toHaveBeenCalledWith('loading', 50, 'Downloading...')

    mockWorker.simulateMessage({
      type: 'initResult', requestId: msg.requestId, success: true,
    })
    await initPromise
  })

  it('terminate rejects pending requests', async () => {
    const genPromise = manager.generateFull([{ role: 'user', content: 'Hello' }])
    manager.terminate()
    await expect(genPromise).rejects.toThrow('LLM manager terminated')
  })

  it('isWebGpuAvailable returns false in test environment', () => {
    expect(LlmManager.isWebGpuAvailable()).toBe(false)
  })
})
