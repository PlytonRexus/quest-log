import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ChatPanel } from '../ChatPanel'

const mockUseLlm = vi.fn()

vi.mock('../../hooks/useLlm', () => ({
  useLlm: () => mockUseLlm(),
}))

vi.mock('../../ai/rag', () => ({
  queryWithContext: vi.fn(),
}))

describe('ChatPanel', () => {
  const defaultState = {
    status: 'idle' as const,
    progress: 0,
    message: null,
    isReady: false,
    isLoading: false,
    isError: false,
    isGenerating: false,
    isWebGpuAvailable: true,
    initLlm: vi.fn(),
    generate: vi.fn(),
    abort: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseLlm.mockReturnValue(defaultState)
  })

  it('shows disabled state when LLM not loaded', () => {
    render(<ChatPanel />)
    expect(screen.getByText(/Load a local LLM model/)).toBeInTheDocument()
  })

  it('shows example prompts when LLM is ready and no messages', () => {
    mockUseLlm.mockReturnValue({ ...defaultState, status: 'ready', isReady: true })
    render(<ChatPanel />)

    expect(screen.getByText('What patterns connect my highest-rated works?')).toBeInTheDocument()
    expect(screen.getByText('Which tropes am I drawn to most?')).toBeInTheDocument()
  })

  it('has input field and send button when ready', () => {
    mockUseLlm.mockReturnValue({ ...defaultState, status: 'ready', isReady: true })
    render(<ChatPanel />)

    expect(screen.getByPlaceholderText('Ask about your narrative taste...')).toBeInTheDocument()
    expect(screen.getByText('Send')).toBeInTheDocument()
  })

  it('clicking example prompt fills the input', () => {
    mockUseLlm.mockReturnValue({ ...defaultState, status: 'ready', isReady: true })
    render(<ChatPanel />)

    fireEvent.click(screen.getByText('Which tropes am I drawn to most?'))
    const input = screen.getByPlaceholderText('Ask about your narrative taste...') as HTMLInputElement
    expect(input.value).toBe('Which tropes am I drawn to most?')
  })

  it('send button is disabled when input is empty', () => {
    mockUseLlm.mockReturnValue({ ...defaultState, status: 'ready', isReady: true })
    render(<ChatPanel />)

    const sendButton = screen.getByText('Send')
    expect(sendButton).toBeDisabled()
  })

  it('shows stop button when generating', () => {
    mockUseLlm.mockReturnValue({ ...defaultState, status: 'ready', isReady: true, isGenerating: true })
    render(<ChatPanel />)

    expect(screen.getByText('Stop')).toBeInTheDocument()
  })

  it('calls abort when stop button is clicked', () => {
    const abort = vi.fn()
    mockUseLlm.mockReturnValue({
      ...defaultState,
      status: 'ready',
      isReady: true,
      isGenerating: true,
      abort,
    })

    render(<ChatPanel />)
    fireEvent.click(screen.getByText('Stop'))
    expect(abort).toHaveBeenCalledOnce()
  })
})
