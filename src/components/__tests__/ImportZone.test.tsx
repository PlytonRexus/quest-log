import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ImportZone } from '../ImportZone'

describe('ImportZone', () => {
  it('renders drop zone with instruction text', () => {
    render(<ImportZone />)
    expect(screen.getByText(/drag & drop markdown files/i)).toBeInTheDocument()
    expect(screen.getByText(/\.md, \.markdown, \.txt/i)).toBeInTheDocument()
  })

  it('renders the import zone element', () => {
    render(<ImportZone />)
    expect(screen.getByTestId('import-zone')).toBeInTheDocument()
  })

  it('shows browse button', () => {
    render(<ImportZone />)
    expect(screen.getByText(/click to browse/i)).toBeInTheDocument()
  })
})
