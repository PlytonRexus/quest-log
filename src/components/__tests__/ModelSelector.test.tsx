import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ModelSelector } from '../ModelSelector'

const mockUseLlm = vi.fn()

vi.mock('../../hooks/useLlm', () => ({
  useLlm: () => mockUseLlm(),
}))

describe('ModelSelector', () => {
  const defaultState = {
    status: 'idle' as const,
    progress: 0,
    message: null,
    isReady: false,
    isLoading: false,
    isError: false,
    isWebGpuAvailable: true,
    isGenerating: false,
    initLlm: vi.fn(),
    generate: vi.fn(),
    abort: vi.fn(),
  }

  beforeEach(() => {
    mockUseLlm.mockReturnValue(defaultState)
  })

  it('shows WebGPU unavailable message when not supported', () => {
    mockUseLlm.mockReturnValue({ ...defaultState, isWebGpuAvailable: false })
    render(<ModelSelector />)
    expect(screen.getByText(/WebGPU is not available/)).toBeInTheDocument()
  })

  it('renders model size options in idle state', () => {
    render(<ModelSelector />)
    expect(screen.getByText('1B (fast, ~700MB)')).toBeInTheDocument()
    expect(screen.getByText('3B (balanced, ~1.8GB)')).toBeInTheDocument()
    expect(screen.getByText('Load Model')).toBeInTheDocument()
  })

  it('calls initLlm with selected size when Load Model is clicked', () => {
    const initLlm = vi.fn()
    mockUseLlm.mockReturnValue({ ...defaultState, initLlm })

    render(<ModelSelector />)

    // Select medium model
    fireEvent.click(screen.getByText('3B (balanced, ~1.8GB)'))
    fireEvent.click(screen.getByText('Load Model'))

    expect(initLlm).toHaveBeenCalledWith('medium')
  })

  it('shows progress bar during loading', () => {
    mockUseLlm.mockReturnValue({
      ...defaultState,
      status: 'loading',
      isLoading: true,
      progress: 45,
      message: 'Downloading model...',
    })

    render(<ModelSelector />)
    expect(screen.getByText('45%')).toBeInTheDocument()
    expect(screen.getByText('Downloading model...')).toBeInTheDocument()
  })

  it('shows ready indicator when loaded', () => {
    mockUseLlm.mockReturnValue({
      ...defaultState,
      status: 'ready',
      isReady: true,
    })

    render(<ModelSelector />)
    expect(screen.getByText('LLM Ready')).toBeInTheDocument()
  })

  it('shows error state with retry button', () => {
    mockUseLlm.mockReturnValue({
      ...defaultState,
      status: 'error',
      isError: true,
      message: 'WebGPU init failed',
    })

    render(<ModelSelector />)
    expect(screen.getByText('WebGPU init failed')).toBeInTheDocument()
    expect(screen.getByText('Retry')).toBeInTheDocument()
  })
})
