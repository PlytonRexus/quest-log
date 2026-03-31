import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { HudOverlay } from '../HudOverlay'
import { FocusProvider } from '../FocusContext'

// Mock ContextPanel
vi.mock('../ContextPanel', () => ({
  ContextPanel: () => <div data-testid="context-panel">ContextPanel</div>,
}))

// Mock DAL for any indirect usage
vi.mock('../../db/dal', () => ({
  getOverallStats: vi.fn().mockResolvedValue({ totalWorks: 0, totalTropes: 0, avgScore: 0 }),
}))

function renderHud() {
  return render(
    <FocusProvider>
      <HudOverlay />
    </FocusProvider>,
  )
}

describe('HudOverlay', () => {
  it('renders right panel', () => {
    renderHud()
    expect(screen.getByTestId('hud-right-panel')).toBeInTheDocument()
  })

  it('right panel has backdrop-filter blur style applied', () => {
    renderHud()
    const rightPanel = screen.getByTestId('hud-right-panel')
    expect(rightPanel.style.backdropFilter).toBe('blur(12px)')
  })

  it('toggle button hides and shows panel', () => {
    renderHud()
    expect(screen.getByTestId('hud-overlay')).toBeInTheDocument()

    // Click hide
    const hideBtn = screen.getByLabelText('Hide context panel')
    fireEvent.click(hideBtn)
    expect(screen.queryByTestId('hud-overlay')).not.toBeInTheDocument()

    // Click show
    const showBtn = screen.getByLabelText('Show context panel')
    fireEvent.click(showBtn)
    expect(screen.getByTestId('hud-overlay')).toBeInTheDocument()
  })

  it('keyboard shortcut H toggles panel', () => {
    renderHud()
    expect(screen.getByTestId('hud-overlay')).toBeInTheDocument()

    fireEvent.keyDown(window, { key: 'H' })
    expect(screen.queryByTestId('hud-overlay')).not.toBeInTheDocument()

    fireEvent.keyDown(window, { key: 'h' })
    expect(screen.getByTestId('hud-overlay')).toBeInTheDocument()
  })
})
