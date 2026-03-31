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

function renderHud(props?: Partial<React.ComponentProps<typeof HudOverlay>>) {
  const defaultProps = {
    activeView: 'galaxy' as const,
    onViewChange: vi.fn(),
    ...props,
  }
  return render(
    <FocusProvider>
      <HudOverlay {...defaultProps} />
    </FocusProvider>,
  )
}

describe('HudOverlay', () => {
  it('renders left panel, right panel', () => {
    renderHud()
    expect(screen.getByTestId('hud-left-panel')).toBeInTheDocument()
    expect(screen.getByTestId('hud-right-panel')).toBeInTheDocument()
  })

  it('panels have backdrop-filter blur style applied', () => {
    renderHud()
    const leftPanel = screen.getByTestId('hud-left-panel')
    expect(leftPanel.style.backdropFilter).toBe('blur(12px)')
  })

  it('toggle button hides and shows panels', () => {
    renderHud()
    expect(screen.getByTestId('hud-overlay')).toBeInTheDocument()

    // Click hide
    const hideBtn = screen.getByLabelText('Hide HUD panels')
    fireEvent.click(hideBtn)
    expect(screen.queryByTestId('hud-overlay')).not.toBeInTheDocument()

    // Click show
    const showBtn = screen.getByLabelText('Show HUD panels')
    fireEvent.click(showBtn)
    expect(screen.getByTestId('hud-overlay')).toBeInTheDocument()
  })

  it('keyboard shortcut H toggles panels', () => {
    renderHud()
    expect(screen.getByTestId('hud-overlay')).toBeInTheDocument()

    fireEvent.keyDown(window, { key: 'H' })
    expect(screen.queryByTestId('hud-overlay')).not.toBeInTheDocument()

    fireEvent.keyDown(window, { key: 'h' })
    expect(screen.getByTestId('hud-overlay')).toBeInTheDocument()
  })
})
