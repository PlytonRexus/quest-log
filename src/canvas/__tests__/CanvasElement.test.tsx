import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CanvasElement } from '../CanvasElement'

describe('CanvasElement', () => {
  it('renders at the correct position', () => {
    render(
      <CanvasElement x={100} y={200} width={200} height={120} onMove={vi.fn()}>
        <div>Test Element</div>
      </CanvasElement>,
    )
    const el = screen.getByTestId('canvas-element')
    expect(el.style.left).toBe('100px')
    expect(el.style.top).toBe('200px')
  })

  it('updates position on drag (pointer events)', () => {
    const onMove = vi.fn()
    render(
      <CanvasElement x={100} y={200} width={200} height={120} onMove={onMove}>
        <div>Drag Me</div>
      </CanvasElement>,
    )
    const el = screen.getByTestId('canvas-element')

    // Mock setPointerCapture
    el.setPointerCapture = vi.fn()

    fireEvent.pointerDown(el, { clientX: 150, clientY: 250, pointerId: 1 })
    fireEvent.pointerMove(el, { clientX: 200, clientY: 300, pointerId: 1 })
    expect(onMove).toHaveBeenCalled()
  })

  it('shows selected state with ring', () => {
    render(
      <CanvasElement x={0} y={0} width={200} height={120} onMove={vi.fn()} selected>
        <div>Selected</div>
      </CanvasElement>,
    )
    const el = screen.getByTestId('canvas-element')
    expect(el.className).toContain('ring-2')
  })

  it('has role and aria attributes', () => {
    render(
      <CanvasElement
        x={0} y={0} width={200} height={120}
        onMove={vi.fn()}
        tabIndex={0}
        ariaLabel="test element"
        selected
      >
        <div>A11y</div>
      </CanvasElement>,
    )
    const el = screen.getByTestId('canvas-element')
    expect(el).toHaveAttribute('role', 'group')
    expect(el).toHaveAttribute('aria-label', 'test element')
    expect(el).toHaveAttribute('aria-selected', 'true')
    expect(el.tabIndex).toBe(0)
  })

  it('receives keyboard events via onKeyDown', () => {
    const onKeyDown = vi.fn()
    render(
      <CanvasElement
        x={0} y={0} width={200} height={120}
        onMove={vi.fn()}
        tabIndex={0}
        onKeyDown={onKeyDown}
      >
        <div>Keyboard</div>
      </CanvasElement>,
    )
    const el = screen.getByTestId('canvas-element')
    fireEvent.keyDown(el, { key: 'ArrowUp' })
    expect(onKeyDown).toHaveBeenCalledTimes(1)
    expect(onKeyDown.mock.calls[0][0].key).toBe('ArrowUp')
  })
})
