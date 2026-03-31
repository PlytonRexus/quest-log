import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { axe } from 'vitest-axe'

// Mock dependencies for Layout
vi.mock('../ViewRouter', () => ({
  ViewRouter: ({ activeView }: { activeView: string }) => (
    <div data-testid="view-router" data-active-view={activeView}>
      <button>Focusable A</button>
      <button>Focusable B</button>
    </div>
  ),
  VIEW_DEFS: [
    { id: 'galaxy', label: 'Galaxy', icon: 'G', shortcut: '1' },
  ],
}))

vi.mock('../StatsBar', () => ({
  StatsBar: () => (
    <div data-testid="stats-bar" role="status" aria-label="Application statistics">
      StatsBar
    </div>
  ),
}))

vi.mock('../HudOverlay', () => ({
  HudOverlay: () => <div data-testid="hud-overlay" />,
}))

vi.mock('../../components/ModelLoader', () => ({
  ModelLoader: () => <div data-testid="model-loader" />,
}))

vi.mock('../../plugins/PluginContext', () => ({
  PluginProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

import { Layout } from '../Layout'
import { ErrorBoundary } from '../ErrorBoundary'
import { LoadingSkeleton } from '../LoadingSkeleton'

describe('Accessibility', () => {
  describe('Layout landmarks', () => {
    it('has banner (header) and main landmarks', () => {
      render(<Layout />)
      expect(screen.getByRole('banner')).toBeInTheDocument()
      expect(screen.getByRole('main')).toBeInTheDocument()
    })

    it('stats bar has status role', () => {
      render(<Layout />)
      expect(screen.getByRole('status')).toBeInTheDocument()
    })
  })

  describe('ErrorBoundary', () => {
    it('renders children when no error', () => {
      render(
        <ErrorBoundary>
          <div data-testid="child">OK</div>
        </ErrorBoundary>,
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('renders error state with alert role', () => {
      function ThrowingComponent(): React.ReactNode {
        throw new Error('Test error')
      }
      // Suppress console.error for expected error
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
      render(
        <ErrorBoundary>
          <ThrowingComponent />
        </ErrorBoundary>,
      )
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByText(/Test error/)).toBeInTheDocument()
      spy.mockRestore()
    })

    it('try again button resets error state', () => {
      let shouldThrow = true
      function ConditionalThrow() {
        if (shouldThrow) throw new Error('Boom')
        return <div data-testid="recovered">Recovered</div>
      }
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
      render(
        <ErrorBoundary>
          <ConditionalThrow />
        </ErrorBoundary>,
      )
      expect(screen.getByRole('alert')).toBeInTheDocument()
      shouldThrow = false
      fireEvent.click(screen.getByText('Try again'))
      expect(screen.getByTestId('recovered')).toBeInTheDocument()
      spy.mockRestore()
    })
  })

  describe('LoadingSkeleton', () => {
    it('renders with loading status', () => {
      render(<LoadingSkeleton />)
      expect(screen.getByRole('status')).toBeInTheDocument()
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('renders specified number of lines', () => {
      const { container } = render(<LoadingSkeleton lines={4} />)
      const bars = container.querySelectorAll('.bg-surface-bright')
      expect(bars).toHaveLength(4)
    })
  })

  describe('Keyboard navigation', () => {
    it('all buttons are reachable via tab', () => {
      render(<Layout />)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
      // All buttons should be focusable (no tabIndex=-1)
      for (const btn of buttons) {
        expect(btn.tabIndex).not.toBe(-1)
      }
    })
  })

  describe('axe audits', () => {
    it('Layout has no WCAG violations', async () => {
      const { container } = render(<Layout />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('ErrorBoundary error state has no WCAG violations', async () => {
      function ThrowingComponent(): React.ReactNode {
        throw new Error('Axe test error')
      }
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const { container } = render(
        <ErrorBoundary>
          <ThrowingComponent />
        </ErrorBoundary>,
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
      spy.mockRestore()
    })

    it('LoadingSkeleton has no WCAG violations', async () => {
      const { container } = render(<LoadingSkeleton />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('CanvasToolbar has no WCAG violations', async () => {
      const { CanvasToolbar } = await import('../../canvas/CanvasToolbar')
      const { container } = render(
        <CanvasToolbar
          activeTool="select"
          onToolChange={() => {}}
          onClear={() => {}}
          onAnalyze={() => {}}
        />,
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
})
