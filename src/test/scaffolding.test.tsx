import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../App'

describe('scaffolding', () => {
  it('vitest infrastructure works', () => {
    expect(1 + 1).toBe(2)
  })

  it('tailwind classes render on App', () => {
    render(<App />)
    const heading = screen.getByText('Narrative Portal')
    expect(heading).toBeInTheDocument()
    expect(heading.className).toContain('text-')
  })
})
