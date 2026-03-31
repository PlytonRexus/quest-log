import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ModelLoader } from '../ModelLoader'

const mockUseAi = vi.fn()

vi.mock('../../hooks/useAi', () => ({
  useAi: () => mockUseAi(),
}))

describe('ModelLoader', () => {
  const defaultState = {
    status: 'idle' as const,
    progress: 0,
    message: null,
    isReady: false,
    isLoading: false,
    isError: false,
    initModels: vi.fn(),
  }

  beforeEach(() => {
    mockUseAi.mockReturnValue(defaultState)
  })

  it('renders load button in idle state', () => {
    render(<ModelLoader />)
    const button = screen.getByText('Load AI Models')
    expect(button).toBeInTheDocument()
  })

  it('calls initModels when load button is clicked', () => {
    const initModels = vi.fn()
    mockUseAi.mockReturnValue({ ...defaultState, initModels })

    render(<ModelLoader />)
    fireEvent.click(screen.getByText('Load AI Models'))
    expect(initModels).toHaveBeenCalledOnce()
  })

  it('renders progress bar in loading state', () => {
    mockUseAi.mockReturnValue({
      ...defaultState,
      status: 'loading',
      isLoading: true,
      progress: 50,
      message: 'Loading embedding model...',
    })

    render(<ModelLoader />)
    expect(screen.getByText('Loading embedding model...')).toBeInTheDocument()
  })

  it('renders ready indicator when models are loaded', () => {
    mockUseAi.mockReturnValue({
      ...defaultState,
      status: 'ready',
      isReady: true,
    })

    render(<ModelLoader />)
    expect(screen.getByText('AI Ready')).toBeInTheDocument()
  })

  it('renders error state with retry button', () => {
    const initModels = vi.fn()
    mockUseAi.mockReturnValue({
      ...defaultState,
      status: 'error',
      isError: true,
      message: 'Failed to load',
      initModels,
    })

    render(<ModelLoader />)
    expect(screen.getByText('Failed to load')).toBeInTheDocument()

    const retryButton = screen.getByText('Retry')
    expect(retryButton).toBeInTheDocument()
    fireEvent.click(retryButton)
    expect(initModels).toHaveBeenCalledOnce()
  })
})
