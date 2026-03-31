import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { AiManager } from '../manager'
import type { TfWorkerResponse } from '../protocol'

interface MockWorker {
  postMessage: ReturnType<typeof vi.fn>
  terminate: ReturnType<typeof vi.fn>
  onmessage: ((e: MessageEvent<TfWorkerResponse>) => void) | null
  onerror: ((e: ErrorEvent) => void) | null
  simulateMessage: (data: TfWorkerResponse) => void
  simulateError: (message: string) => void
}

function createMockWorker(): MockWorker {
  const mock: MockWorker = {
    postMessage: vi.fn(),
    terminate: vi.fn(),
    onmessage: null,
    onerror: null,
    simulateMessage(data: TfWorkerResponse) {
      if (mock.onmessage) {
        mock.onmessage(new MessageEvent('message', { data }))
      }
    },
    simulateError(message: string) {
      if (mock.onerror) {
        mock.onerror(new ErrorEvent('error', { message }))
      }
    },
  }
  return mock
}

describe('AiManager', () => {
  let mockWorker: MockWorker
  let manager: AiManager

  beforeEach(() => {
    mockWorker = createMockWorker()
    manager = new AiManager({
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

  it('initModels sends init message and resolves on success', async () => {
    const initPromise = manager.initModels()

    expect(mockWorker.postMessage).toHaveBeenCalledOnce()
    const msg = mockWorker.postMessage.mock.calls[0][0]
    expect(msg.type).toBe('init')
    expect(msg.requestId).toBeTruthy()

    mockWorker.simulateMessage({
      type: 'initResult',
      requestId: msg.requestId,
      success: true,
    })

    await expect(initPromise).resolves.toBeUndefined()
  })

  it('initModels rejects on failure', async () => {
    const initPromise = manager.initModels()
    const msg = mockWorker.postMessage.mock.calls[0][0]

    mockWorker.simulateMessage({
      type: 'initResult',
      requestId: msg.requestId,
      success: false,
      error: 'Model not found',
    })

    await expect(initPromise).rejects.toThrow('Model not found')
  })

  it('embed sends embed message and resolves with vector', async () => {
    const embedPromise = manager.embed('hello world')
    const msg = mockWorker.postMessage.mock.calls[0][0]
    expect(msg.type).toBe('embed')
    expect(msg.text).toBe('hello world')

    const fakeVector = [0.1, 0.2, 0.3]
    mockWorker.simulateMessage({
      type: 'embedResult',
      requestId: msg.requestId,
      vector: fakeVector,
    })

    const result = await embedPromise
    expect(result).toEqual(fakeVector)
  })

  it('classify sends classify message and resolves with scores', async () => {
    const classifyPromise = manager.classify('a cat and mouse game', ['thriller', 'comedy'])
    const msg = mockWorker.postMessage.mock.calls[0][0]
    expect(msg.type).toBe('classify')
    expect(msg.labels).toEqual(['thriller', 'comedy'])

    const fakeScores = [
      { label: 'thriller', score: 0.9 },
      { label: 'comedy', score: 0.1 },
    ]
    mockWorker.simulateMessage({
      type: 'classifyResult',
      requestId: msg.requestId,
      scores: fakeScores,
    })

    const result = await classifyPromise
    expect(result).toEqual(fakeScores)
  })

  it('classifyBatch returns batch results', async () => {
    const batchPromise = manager.classifyBatch(
      [{ id: '1', text: 'text1' }],
      ['label1'],
    )
    const msg = mockWorker.postMessage.mock.calls[0][0]
    expect(msg.type).toBe('classifyBatch')

    const fakeResults = [{ id: '1', scores: [{ label: 'label1', score: 0.8 }] }]
    mockWorker.simulateMessage({
      type: 'classifyBatchResult',
      requestId: msg.requestId,
      results: fakeResults,
    })

    const result = await batchPromise
    expect(result).toEqual(fakeResults)
  })

  it('rejects on worker error message', async () => {
    const embedPromise = manager.embed('test')
    const msg = mockWorker.postMessage.mock.calls[0][0]

    mockWorker.simulateMessage({
      type: 'error',
      requestId: msg.requestId,
      message: 'Something went wrong',
    })

    await expect(embedPromise).rejects.toThrow('Something went wrong')
  })

  it('rejects pending requests on timeout', async () => {
    vi.useFakeTimers()
    const embedPromise = manager.embed('test')

    vi.advanceTimersByTime(5001)

    await expect(embedPromise).rejects.toThrow('timed out')
    vi.useRealTimers()
  })

  it('notifies status listeners on status change', async () => {
    const listener = vi.fn()
    manager.onStatusChange(listener)

    const initPromise = manager.initModels()
    const msg = mockWorker.postMessage.mock.calls[0][0]

    mockWorker.simulateMessage({
      type: 'status',
      status: 'loading',
      progress: 50,
      message: 'Loading...',
    })

    expect(listener).toHaveBeenCalledWith('loading', 50, 'Loading...')

    mockWorker.simulateMessage({
      type: 'status',
      status: 'ready',
      progress: 100,
      message: 'Done',
    })

    expect(listener).toHaveBeenCalledWith('ready', 100, 'Done')
    expect(manager.getStatus()).toBe('ready')
    expect(manager.isReady()).toBe(true)

    mockWorker.simulateMessage({
      type: 'initResult',
      requestId: msg.requestId,
      success: true,
    })

    await initPromise
  })

  it('unsubscribes status listeners', () => {
    const listener = vi.fn()
    const unsub = manager.onStatusChange(listener)
    unsub()

    // Trigger a status message by calling initModels (creates the worker)
    manager.initModels().catch(() => {})
    mockWorker.simulateMessage({
      type: 'status',
      status: 'loading',
    })

    expect(listener).not.toHaveBeenCalled()
  })

  it('terminate rejects all pending requests', async () => {
    const embedPromise = manager.embed('test')

    manager.terminate()

    await expect(embedPromise).rejects.toThrow('Manager terminated')
    expect(mockWorker.terminate).toHaveBeenCalled()
    expect(manager.getStatus()).toBe('idle')
  })

  it('handles multiple concurrent requests', async () => {
    const promise1 = manager.embed('text1')
    const promise2 = manager.embed('text2')

    expect(mockWorker.postMessage).toHaveBeenCalledTimes(2)

    const msg1 = mockWorker.postMessage.mock.calls[0][0]
    const msg2 = mockWorker.postMessage.mock.calls[1][0]
    expect(msg1.requestId).not.toBe(msg2.requestId)

    mockWorker.simulateMessage({
      type: 'embedResult',
      requestId: msg2.requestId,
      vector: [0.2],
    })
    mockWorker.simulateMessage({
      type: 'embedResult',
      requestId: msg1.requestId,
      vector: [0.1],
    })

    const [result1, result2] = await Promise.all([promise1, promise2])
    expect(result1).toEqual([0.1])
    expect(result2).toEqual([0.2])
  })

  it('handles worker onerror event', async () => {
    const embedPromise = manager.embed('test')

    mockWorker.simulateError('Worker crashed')

    await expect(embedPromise).rejects.toThrow('Worker crashed')
    expect(manager.getStatus()).toBe('error')
  })
})
