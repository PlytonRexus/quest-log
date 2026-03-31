import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'

vi.mock('@react-three/drei', () => ({
  OrbitControls: (props: Record<string, unknown>) => (
    <div data-testid="orbit-controls" data-auto-rotate={String(props.autoRotate)} />
  ),
}))

import { CameraControls } from '../CameraControls'

describe('CameraControls', () => {
  it('renders OrbitControls', () => {
    const { getByTestId } = render(<CameraControls />)
    expect(getByTestId('orbit-controls')).toBeInTheDocument()
  })

  it('enables autoRotate by default', () => {
    const { getByTestId } = render(<CameraControls />)
    expect(getByTestId('orbit-controls').getAttribute('data-auto-rotate')).toBe('true')
  })

  it('can disable autoRotate', () => {
    const { getByTestId } = render(<CameraControls autoRotate={false} />)
    expect(getByTestId('orbit-controls').getAttribute('data-auto-rotate')).toBe('false')
  })
})
