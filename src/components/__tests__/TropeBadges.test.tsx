import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TropeBadges } from '../TropeBadges'

describe('TropeBadges', () => {
  const sampleTropes = [
    { id: 1, name: 'political intrigue', category: 'premise_structural', description: 'Test', confidence: 0.9 },
    { id: 2, name: 'morally grey antihero', category: 'character_archetype', description: 'Test', confidence: 0.75 },
    { id: 3, name: 'slow burn with pressurization', category: 'pacing_mechanic', description: 'Test', confidence: 0.6 },
  ]

  it('renders trope badges', () => {
    render(<TropeBadges tropes={sampleTropes} />)

    expect(screen.getByText('political intrigue')).toBeInTheDocument()
    expect(screen.getByText('morally grey antihero')).toBeInTheDocument()
    expect(screen.getByText('slow burn with pressurization')).toBeInTheDocument()
  })

  it('shows confidence percentages by default', () => {
    render(<TropeBadges tropes={sampleTropes} />)

    expect(screen.getByText('90%')).toBeInTheDocument()
    expect(screen.getByText('75%')).toBeInTheDocument()
    expect(screen.getByText('60%')).toBeInTheDocument()
  })

  it('hides confidence when showConfidence is false', () => {
    render(<TropeBadges tropes={sampleTropes} showConfidence={false} />)

    expect(screen.queryByText('90%')).not.toBeInTheDocument()
  })

  it('shows empty state message when no tropes', () => {
    render(<TropeBadges tropes={[]} />)
    expect(screen.getByText('No tropes detected')).toBeInTheDocument()
  })

  it('calls onTropeClick when a badge is clicked', () => {
    const onClick = vi.fn()
    render(<TropeBadges tropes={sampleTropes} onTropeClick={onClick} />)

    fireEvent.click(screen.getByText('political intrigue'))
    expect(onClick).toHaveBeenCalledWith(1)
  })

  it('badges have correct category in title attribute', () => {
    render(<TropeBadges tropes={sampleTropes} />)

    const badge = screen.getByText('political intrigue').closest('button')
    expect(badge?.getAttribute('title')).toContain('Premise/Structure')
    expect(badge?.getAttribute('title')).toContain('90%')
  })
})
