import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Layout } from '../Layout'

// Mock dependencies
vi.mock('../ViewRouter', () => ({
  ViewRouter: ({ activeView }: { activeView: string }) => (
    <div data-testid="view-router" data-active-view={activeView}>ViewRouter</div>
  ),
  VIEW_DEFS: [
    { id: 'galaxy', label: 'Galaxy', icon: 'G', shortcut: '1' },
  ],
}))

vi.mock('../StatsBar', () => ({
  StatsBar: () => <div data-testid="stats-bar">StatsBar</div>,
}))

vi.mock('../../components/ModelLoader', () => ({
  ModelLoader: () => <div data-testid="model-loader">ModelLoader</div>,
}))

describe('Layout', () => {
  it('renders header with title', () => {
    render(<Layout />)
    expect(screen.getByText('Narrative Portal')).toBeInTheDocument()
  })

  it('renders the view router', () => {
    render(<Layout />)
    expect(screen.getByTestId('view-router')).toBeInTheDocument()
  })

  it('renders the stats bar', () => {
    render(<Layout />)
    expect(screen.getByTestId('stats-bar')).toBeInTheDocument()
  })

  it('defaults to galaxy view', () => {
    render(<Layout />)
    expect(screen.getByTestId('view-router')).toHaveAttribute(
      'data-active-view',
      'galaxy',
    )
  })

  it('renders model loader in header', () => {
    render(<Layout />)
    expect(screen.getByTestId('model-loader')).toBeInTheDocument()
  })
})
