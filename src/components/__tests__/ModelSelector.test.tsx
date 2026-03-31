import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ModelSelector } from '../ModelSelector'

const mockUseLlm = vi.fn()

vi.mock('../../hooks/useLlm', () => ({
  useLlm: () => mockUseLlm(),
}))

describe('ModelSelector', () => {
  const defaultState = {
    provider: 'gemini' as const,
    setProvider: vi.fn(),
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
    apiKey: null as string | null,
    setApiKey: vi.fn(),
  }

  beforeEach(() => {
    mockUseLlm.mockReturnValue(defaultState)
  })

  it('renders provider tabs', () => {
    render(<ModelSelector />)
    expect(screen.getByText('Gemini Flash')).toBeInTheDocument()
    expect(screen.getByText('Local LLM')).toBeInTheDocument()
  })

  it('shows Gemini tab by default with API key input', () => {
    render(<ModelSelector />)
    expect(screen.getByPlaceholderText('Paste API key')).toBeInTheDocument()
    expect(screen.getByText('Save')).toBeInTheDocument()
  })

  it('shows Gemini ready when API key is set and ready', () => {
    mockUseLlm.mockReturnValue({
      ...defaultState,
      isReady: true,
      apiKey: 'test-key',
    })
    render(<ModelSelector />)
    expect(screen.getByText('Gemini Flash ready')).toBeInTheDocument()
  })

  it('calls setApiKey when Save is clicked', () => {
    const setApiKey = vi.fn()
    mockUseLlm.mockReturnValue({ ...defaultState, setApiKey })

    render(<ModelSelector />)
    const input = screen.getByPlaceholderText('Paste API key')
    fireEvent.change(input, { target: { value: 'my-key' } })
    fireEvent.click(screen.getByText('Save'))

    expect(setApiKey).toHaveBeenCalledWith('my-key')
  })

  it('switches to Local LLM tab and shows model options', () => {
    const setProvider = vi.fn()
    mockUseLlm.mockReturnValue({ ...defaultState, provider: 'local', setProvider })

    render(<ModelSelector />)
    expect(screen.getByText('1B (fast, ~700MB)')).toBeInTheDocument()
    expect(screen.getByText('Load Model')).toBeInTheDocument()
  })

  it('shows WebGPU unavailable message on local tab', () => {
    mockUseLlm.mockReturnValue({
      ...defaultState,
      provider: 'local',
      isWebGpuAvailable: false,
    })
    render(<ModelSelector />)
    expect(screen.getByText(/WebGPU not available/)).toBeInTheDocument()
  })

  it('shows progress bar during local model loading', () => {
    mockUseLlm.mockReturnValue({
      ...defaultState,
      provider: 'local',
      status: 'loading',
      isLoading: true,
      progress: 45,
      message: 'Downloading model...',
    })

    render(<ModelSelector />)
    expect(screen.getByText('45%')).toBeInTheDocument()
    expect(screen.getByText('Downloading model...')).toBeInTheDocument()
  })

  it('shows local LLM ready indicator', () => {
    mockUseLlm.mockReturnValue({
      ...defaultState,
      provider: 'local',
      status: 'ready',
      isReady: true,
    })

    render(<ModelSelector />)
    expect(screen.getByText('Local LLM ready')).toBeInTheDocument()
  })
})
