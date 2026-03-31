import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TropeCard } from '../elements/TropeCard'
import { WorkCard } from '../elements/WorkCard'
import { StickyNote } from '../elements/StickyNote'
import { ConnectionLine } from '../elements/ConnectionLine'

describe('TropeCard', () => {
  it('renders with correct name and category color', () => {
    render(<TropeCard name="Political Intrigue" category="premise_structural" />)
    expect(screen.getByTestId('trope-card')).toBeInTheDocument()
    expect(screen.getByText('Political Intrigue')).toBeInTheDocument()
    expect(screen.getByText('premise structural')).toBeInTheDocument()
    // Check border color
    const card = screen.getByTestId('trope-card')
    expect(card.style.borderLeft).toContain('#3B82F6')
  })

  it('shows description when provided', () => {
    render(
      <TropeCard
        name="Test"
        category="test"
        description="A test trope"
      />,
    )
    expect(screen.getByText('A test trope')).toBeInTheDocument()
  })
})

describe('WorkCard', () => {
  it('renders with title and score badge', () => {
    render(<WorkCard title="Attack on Titan" medium="anime" score={9.6} />)
    expect(screen.getByTestId('work-card')).toBeInTheDocument()
    expect(screen.getByText('Attack on Titan')).toBeInTheDocument()
    expect(screen.getByText('9.6')).toBeInTheDocument()
    expect(screen.getByText('anime')).toBeInTheDocument()
  })

  it('handles null score', () => {
    render(<WorkCard title="Test" medium="film" score={null} />)
    expect(screen.getByText('Test')).toBeInTheDocument()
    // No score badge
    expect(screen.queryByText(/\d\.\d/)).not.toBeInTheDocument()
  })
})

describe('StickyNote', () => {
  it('renders content', () => {
    render(
      <StickyNote
        content="Hello world"
        color="#F59E0B"
        onContentChange={vi.fn()}
        onColorChange={vi.fn()}
      />,
    )
    expect(screen.getByTestId('sticky-note')).toBeInTheDocument()
    expect(screen.getByText('Hello world')).toBeInTheDocument()
  })

  it('enters edit mode on double-click', () => {
    render(
      <StickyNote
        content="Edit me"
        color="#F59E0B"
        onContentChange={vi.fn()}
        onColorChange={vi.fn()}
      />,
    )
    const note = screen.getByTestId('sticky-note')
    fireEvent.doubleClick(note)
    expect(screen.getByTestId('sticky-note-editor')).toBeInTheDocument()
  })

  it('shows color picker on button click', () => {
    render(
      <StickyNote
        content=""
        color="#F59E0B"
        onContentChange={vi.fn()}
        onColorChange={vi.fn()}
      />,
    )
    const colorBtn = screen.getByLabelText('Change color')
    fireEvent.click(colorBtn)
    expect(screen.getByTestId('color-picker')).toBeInTheDocument()
  })
})

describe('ConnectionLine', () => {
  it('renders a line between two points', () => {
    render(
      <ConnectionLine x1={0} y1={0} x2={100} y2={100} />,
    )
    const line = screen.getByTestId('connection-line')
    expect(line).toBeInTheDocument()
    const svgLine = line.querySelector('line')
    expect(svgLine).toBeTruthy()
    expect(svgLine?.getAttribute('x1')).toBe('0')
    expect(svgLine?.getAttribute('y2')).toBe('100')
  })

  it('renders label text', () => {
    render(
      <ConnectionLine x1={0} y1={0} x2={100} y2={100} label="related" />,
    )
    expect(screen.getByText('related')).toBeInTheDocument()
  })
})
