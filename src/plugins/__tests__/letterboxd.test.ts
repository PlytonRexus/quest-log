import { describe, it, expect } from 'vitest'
import { parseLetterboxdCsv } from '../letterboxd'

const SAMPLE_CSV = `Name,Year,Rating,Review
Inception,2010,4.5,Mind-bending
Spirited Away,2001,5.0,Masterpiece
The Matrix,1999,4.0,
Inception,2010,4.5,Duplicate`

describe('letterboxd parser', () => {
  it('parses sample CSV with correct number of works', () => {
    const entries = parseLetterboxdCsv(SAMPLE_CSV)
    expect(entries).toHaveLength(4) // includes duplicate
  })

  it('maps fields correctly: title, year, rating', () => {
    const entries = parseLetterboxdCsv(SAMPLE_CSV)
    expect(entries[0].title).toBe('Inception')
    expect(entries[0].year).toBe(2010)
    expect(entries[0].rating).toBe(4.5)
  })

  it('handles empty review', () => {
    const entries = parseLetterboxdCsv(SAMPLE_CSV)
    expect(entries[2].review).toBe('')
  })

  it('handles empty CSV', () => {
    expect(parseLetterboxdCsv('')).toHaveLength(0)
    expect(parseLetterboxdCsv('header')).toHaveLength(0)
  })
})
