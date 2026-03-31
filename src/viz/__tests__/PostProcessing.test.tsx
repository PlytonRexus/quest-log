import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'

vi.mock('@react-three/postprocessing', () => ({
  EffectComposer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="effect-composer">{children}</div>
  ),
  Bloom: (props: Record<string, unknown>) => (
    <div data-testid="bloom" data-intensity={String(props.intensity)} />
  ),
}))

import { PostProcessing } from '../PostProcessing'

describe('PostProcessing', () => {
  it('renders EffectComposer with Bloom', () => {
    const { getByTestId } = render(<PostProcessing />)
    expect(getByTestId('effect-composer')).toBeInTheDocument()
    expect(getByTestId('bloom')).toBeInTheDocument()
  })

  it('uses default intensity', () => {
    const { getByTestId } = render(<PostProcessing />)
    expect(getByTestId('bloom').getAttribute('data-intensity')).toBe('0.5')
  })

  it('accepts custom intensity', () => {
    const { getByTestId } = render(<PostProcessing intensity={0.8} />)
    expect(getByTestId('bloom').getAttribute('data-intensity')).toBe('0.8')
  })
})
