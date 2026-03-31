import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TasteTimeline } from '../tasteTimeline'
import type { Work } from '../../types'

function makeWork(overrides: Partial<Work> & { id: number }): Work {
  return {
    title: 'Test',
    medium: 'anime',
    year: 2020,
    coverUrl: null,
    primaryScore: 8,
    comfortScore: null,
    consumptionMode: null,
    dateConsumed: '2024-01-15',
    notes: null,
    ...overrides,
  }
}

describe('TasteTimeline', () => {
  it('renders scatter plot with correct number of dots', () => {
    const works = [
      makeWork({ id: 1, title: 'A', dateConsumed: '2024-01-01', primaryScore: 7, medium: 'anime' }),
      makeWork({ id: 2, title: 'B', dateConsumed: '2024-06-01', primaryScore: 9, medium: 'film' }),
      makeWork({ id: 3, title: 'C', dateConsumed: '2024-12-01', primaryScore: 8, medium: 'novel' }),
    ]
    render(<TasteTimeline works={works} />)
    expect(screen.getByTestId('taste-timeline')).toBeInTheDocument()
    expect(screen.getByTestId('timeline-dot-1')).toBeInTheDocument()
    expect(screen.getByTestId('timeline-dot-2')).toBeInTheDocument()
    expect(screen.getByTestId('timeline-dot-3')).toBeInTheDocument()
  })

  it('shows trend line', () => {
    const works = [
      makeWork({ id: 1, dateConsumed: '2024-01-01', primaryScore: 6 }),
      makeWork({ id: 2, dateConsumed: '2024-12-01', primaryScore: 9 }),
    ]
    render(<TasteTimeline works={works} />)
    expect(screen.getByTestId('trend-line')).toBeInTheDocument()
  })

  it('handles works without dates', () => {
    const works = [
      makeWork({ id: 1, dateConsumed: null, primaryScore: 8 }),
    ]
    render(<TasteTimeline works={works} />)
    // Should show empty state
    expect(screen.getByText(/No works with dates/i)).toBeInTheDocument()
  })

  it('dots have correct medium-based colors', () => {
    const works = [
      makeWork({ id: 1, dateConsumed: '2024-01-01', primaryScore: 7, medium: 'anime' }),
      makeWork({ id: 2, dateConsumed: '2024-06-01', primaryScore: 9, medium: 'film' }),
    ]
    render(<TasteTimeline works={works} />)
    const dot1 = screen.getByTestId('timeline-dot-1')
    const dot2 = screen.getByTestId('timeline-dot-2')
    expect(dot1.getAttribute('fill')).toBe('#AB47BC') // anime color
    expect(dot2.getAttribute('fill')).toBe('#4FC3F7') // film color
  })
})
