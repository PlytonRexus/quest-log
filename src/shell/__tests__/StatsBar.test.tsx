import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { StatsBar } from '../StatsBar'

// Mock DB and game modules
vi.mock('../../db/dal', () => ({
  getOverallStats: vi.fn().mockResolvedValue({
    totalWorks: 28,
    totalTropes: 202,
    avgScore: 8.5,
  }),
  getUserProgress: vi.fn().mockResolvedValue({
    id: 1,
    totalXp: 750,
    worksLogged: 10,
    tropesDiscovered: 15,
    fogPercentRevealed: 35.5,
    lastActivity: '2026-03-31T12:00:00.000Z',
  }),
}))

vi.mock('../../game/discoveryEngine', () => ({
  getDiscoveryStats: vi.fn().mockResolvedValue({
    total: 202,
    hidden: 120,
    foggy: 60,
    revealed: 22,
    percentRevealed: 10.9,
  }),
}))

vi.mock('../../game/skillTree', () => ({
  getSkillTreeData: vi.fn().mockResolvedValue({
    nodes: [
      { id: 1, state: 'unlocked' },
      { id: 2, state: 'locked' },
      { id: 3, state: 'mastered' },
      { id: 4, state: 'locked' },
    ],
    categories: [],
  }),
}))

describe('StatsBar', () => {
  it('shows correct work count from DB', async () => {
    render(<StatsBar />)
    await waitFor(() => {
      expect(screen.getByText('28')).toBeInTheDocument()
    })
  })

  it('shows correct fog percentage', async () => {
    render(<StatsBar />)
    await waitFor(() => {
      expect(screen.getByText('10.9%')).toBeInTheDocument()
    })
  })

  it('shows correct XP total', async () => {
    render(<StatsBar />)
    await waitFor(() => {
      expect(screen.getByText('750')).toBeInTheDocument()
    })
  })

  it('shows skill completion percentage', async () => {
    // 2 out of 4 nodes are unlocked/mastered = 50%
    render(<StatsBar />)
    await waitFor(() => {
      expect(screen.getByText('50%')).toBeInTheDocument()
    })
  })

  it('has status role for accessibility', () => {
    render(<StatsBar />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('renders the stats bar container', () => {
    render(<StatsBar />)
    expect(screen.getByTestId('stats-bar')).toBeInTheDocument()
  })
})
