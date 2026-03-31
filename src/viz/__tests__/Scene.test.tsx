import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

// Mock R3F Canvas since there is no WebGL context in tests
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="r3f-canvas">{children}</div>
  ),
}))

import { Scene } from '../Scene'

describe('Scene', () => {
  it('renders the canvas wrapper with correct test id', () => {
    render(
      <Scene>
        <div data-testid="child" />
      </Scene>,
    )
    expect(screen.getByTestId('galaxy-scene')).toBeInTheDocument()
  })

  it('renders children inside the canvas', () => {
    render(
      <Scene>
        <div data-testid="child-element">Test Content</div>
      </Scene>,
    )
    expect(screen.getByTestId('child-element')).toBeInTheDocument()
  })

  it('renders the R3F canvas mock', () => {
    render(
      <Scene>
        <div />
      </Scene>,
    )
    expect(screen.getByTestId('r3f-canvas')).toBeInTheDocument()
  })
})
