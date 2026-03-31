import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ViewRouter, VIEW_DEFS } from '../ViewRouter'

// Mock the lazy-loaded view components so we can verify mounting
vi.mock('../views/SkillTreeView', () => ({
  default: () => <div data-testid="view-skilltree">SkillTreeView</div>,
}))
vi.mock('../views/CanvasView', () => ({
  default: () => <div data-testid="view-canvas">CanvasView</div>,
}))
vi.mock('../views/TableView', () => ({
  default: () => <div data-testid="view-table">TableView</div>,
}))
vi.mock('../views/ChatView', () => ({
  default: () => <div data-testid="view-chat">ChatView</div>,
}))
vi.mock('../../viz/GalaxyView', () => ({
  default: () => <div data-testid="view-galaxy">GalaxyView</div>,
}))

describe('ViewRouter', () => {
  let onViewChange: (...args: unknown[]) => void

  beforeEach(() => {
    onViewChange = vi.fn()
  })

  it('renders the default galaxy view', async () => {
    render(<ViewRouter activeView="galaxy" onViewChange={onViewChange} />)
    await waitFor(() => {
      expect(screen.getByTestId('view-galaxy')).toBeInTheDocument()
    })
  })

  it('switches view on tab click', async () => {
    render(<ViewRouter activeView="galaxy" onViewChange={onViewChange} />)
    const tableTab = screen.getByRole('tab', { name: /Table/i })
    fireEvent.click(tableTab)
    expect(onViewChange).toHaveBeenCalledWith('table')
  })

  it('activates correct view via keyboard shortcuts 1-5', async () => {
    render(<ViewRouter activeView="galaxy" onViewChange={onViewChange} />)

    for (let i = 0; i < VIEW_DEFS.length; i++) {
      fireEvent.keyDown(window, { key: String(i + 1) })
      expect(onViewChange).toHaveBeenCalledWith(VIEW_DEFS[i].id)
    }

    expect(onViewChange).toHaveBeenCalledTimes(VIEW_DEFS.length)
  })

  it('shows active indicator on current view tab', () => {
    render(<ViewRouter activeView="table" onViewChange={onViewChange} />)
    const tableTab = screen.getByRole('tab', { name: /Table/i })
    expect(tableTab).toHaveAttribute('aria-selected', 'true')

    const galaxyTab = screen.getByRole('tab', { name: /Galaxy/i })
    expect(galaxyTab).toHaveAttribute('aria-selected', 'false')
  })

  it('renders only the active view component', async () => {
    const { rerender } = render(
      <ViewRouter activeView="table" onViewChange={onViewChange} />,
    )
    await waitFor(() => {
      expect(screen.getByTestId('view-table')).toBeInTheDocument()
    })
    expect(screen.queryByTestId('view-galaxy')).not.toBeInTheDocument()

    rerender(<ViewRouter activeView="galaxy" onViewChange={onViewChange} />)
    await waitFor(() => {
      expect(screen.getByTestId('view-galaxy')).toBeInTheDocument()
    })
    expect(screen.queryByTestId('view-table')).not.toBeInTheDocument()
  })

  it('renders all 5 tabs in the tab bar', () => {
    render(<ViewRouter activeView="galaxy" onViewChange={onViewChange} />)
    const tabs = screen.getAllByRole('tab')
    expect(tabs).toHaveLength(5)
  })

  it('does not trigger keyboard shortcuts when focused in an input', () => {
    render(
      <div>
        <input data-testid="text-input" />
        <ViewRouter activeView="galaxy" onViewChange={onViewChange} />
      </div>,
    )
    const input = screen.getByTestId('text-input')
    fireEvent.keyDown(input, { key: '2' })
    expect(onViewChange).not.toHaveBeenCalled()
  })

  it('shows the tab bar with navigation role', () => {
    render(<ViewRouter activeView="galaxy" onViewChange={onViewChange} />)
    expect(screen.getByRole('tablist')).toBeInTheDocument()
  })
})
