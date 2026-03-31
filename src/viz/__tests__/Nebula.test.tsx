import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'

vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}))

import { Nebula } from '../Nebula'

describe('Nebula', () => {
  it('renders without crashing', () => {
    const { container } = render(<Nebula />)
    expect(container).toBeTruthy()
  })
})
