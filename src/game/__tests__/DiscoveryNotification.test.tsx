import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { DiscoveryNotification } from '../DiscoveryNotification'
import type { Trope } from '../../types'

const mockTropes: Trope[] = [
  { id: 1, name: 'political intrigue', category: 'premise_structural', description: null },
  { id: 2, name: 'morally grey antihero', category: 'character_archetype', description: null },
]

describe('DiscoveryNotification', () => {
  it('renders trope names in the notification', () => {
    render(
      <DiscoveryNotification
        revealedTropes={mockTropes}
        onDismiss={() => {}}
      />,
    )

    expect(screen.getByText('political intrigue')).toBeDefined()
    expect(screen.getByText('morally grey antihero')).toBeDefined()
    expect(screen.getByText('New Constellations Revealed')).toBeDefined()
  })

  it('calls onDismiss after 5 seconds', () => {
    vi.useFakeTimers()
    const onDismiss = vi.fn()

    render(
      <DiscoveryNotification
        revealedTropes={mockTropes}
        onDismiss={onDismiss}
      />,
    )

    expect(onDismiss).not.toHaveBeenCalled()
    act(() => { vi.advanceTimersByTime(5000) })
    expect(onDismiss).toHaveBeenCalledTimes(1)

    vi.useRealTimers()
  })

  it('calls onFlyTo with correct tropeId when fly-to button is clicked', () => {
    const onFlyTo = vi.fn()

    render(
      <DiscoveryNotification
        revealedTropes={mockTropes}
        onDismiss={() => {}}
        onFlyTo={onFlyTo}
      />,
    )

    const flyToButtons = screen.getAllByText('Fly to')
    fireEvent.click(flyToButtons[0])
    expect(onFlyTo).toHaveBeenCalledWith(1)

    fireEvent.click(flyToButtons[1])
    expect(onFlyTo).toHaveBeenCalledWith(2)
  })
})
