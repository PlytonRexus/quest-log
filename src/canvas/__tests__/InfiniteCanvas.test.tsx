import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { InfiniteCanvas } from '../InfiniteCanvas'

describe('InfiniteCanvas', () => {
  const defaultViewport = { x: 0, y: 0, zoom: 1 }

  it('renders with grid background', () => {
    render(
      <InfiniteCanvas viewport={defaultViewport} onViewportChange={vi.fn()}>
        {() => <div>Content</div>}
      </InfiniteCanvas>,
    )
    expect(screen.getByTestId('canvas-grid')).toBeInTheDocument()
    expect(screen.getByTestId('infinite-canvas')).toBeInTheDocument()
  })

  it('calls onViewportChange on scroll (zoom)', () => {
    const onChange = vi.fn()
    render(
      <InfiniteCanvas viewport={defaultViewport} onViewportChange={onChange}>
        {() => <div>Content</div>}
      </InfiniteCanvas>,
    )
    const canvas = screen.getByTestId('infinite-canvas')
    // Scroll down -> zoom out
    fireEvent.wheel(canvas, { deltaY: 100 })
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ zoom: expect.any(Number) }),
    )
    // zoom should be < 1 (zoomed out)
    expect(onChange.mock.calls[0][0].zoom).toBeLessThan(1)
  })

  it('renders children in content layer', () => {
    render(
      <InfiniteCanvas viewport={defaultViewport} onViewportChange={vi.fn()}>
        {() => <div data-testid="canvas-child">Hello</div>}
      </InfiniteCanvas>,
    )
    expect(screen.getByTestId('canvas-child')).toBeInTheDocument()
  })

  it('applies viewport transform to content layer', () => {
    const vp = { x: 100, y: 50, zoom: 1.5 }
    render(
      <InfiniteCanvas viewport={vp} onViewportChange={vi.fn()}>
        {() => <div>Content</div>}
      </InfiniteCanvas>,
    )
    const content = screen.getByTestId('canvas-content')
    expect(content.style.transform).toContain('translate(100px, 50px)')
    expect(content.style.transform).toContain('scale(1.5)')
  })
})
