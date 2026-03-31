import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { SimilarWorks } from '../SimilarWorks'

vi.mock('../../db/dal', () => ({
  getEmbedding: vi.fn(),
  getWorkById: vi.fn(),
  getEmbeddingsByType: vi.fn(),
}))

vi.mock('../../ai/similarity', () => ({
  findSimilarWorks: vi.fn(),
}))

vi.mock('../../ai/embeddings', () => ({
  bufferToFloat32Array: vi.fn(),
}))

import { getEmbedding, getWorkById } from '../../db/dal'
import { findSimilarWorks } from '../../ai/similarity'
import { bufferToFloat32Array } from '../../ai/embeddings'

const mockGetEmbedding = vi.mocked(getEmbedding)
const mockGetWorkById = vi.mocked(getWorkById)
const mockFindSimilar = vi.mocked(findSimilarWorks)
const mockBufferConvert = vi.mocked(bufferToFloat32Array)

describe('SimilarWorks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows no-embeddings message when work has no embedding', async () => {
    mockGetEmbedding.mockResolvedValue(null)

    render(<SimilarWorks workId={1} />)

    await waitFor(() => {
      expect(screen.getByText('No embeddings available for similarity search')).toBeInTheDocument()
    })
  })

  it('shows similar works with similarity percentages', async () => {
    mockGetEmbedding.mockResolvedValue({
      id: 1, entityType: 'work', entityId: 1,
      vector: new ArrayBuffer(8), modelName: 'test',
    })
    mockBufferConvert.mockReturnValue([0.1, 0.2])
    mockFindSimilar.mockResolvedValue([
      { workId: 2, similarity: 0.85 },
      { workId: 3, similarity: 0.72 },
    ])
    mockGetWorkById.mockImplementation(async (id: number) => ({
      id,
      title: id === 2 ? 'Death Note' : 'Code Geass',
      medium: 'anime',
      year: 2006,
      coverUrl: null,
      primaryScore: 9.0,
      comfortScore: null,
      consumptionMode: 'legitimacy',
      dateConsumed: null,
      notes: null,
    }))

    render(<SimilarWorks workId={1} />)

    await waitFor(() => {
      expect(screen.getByText('Death Note')).toBeInTheDocument()
      expect(screen.getByText('Code Geass')).toBeInTheDocument()
      expect(screen.getByText('85%')).toBeInTheDocument()
      expect(screen.getByText('72%')).toBeInTheDocument()
    })
  })

  it('shows loading state initially', () => {
    mockGetEmbedding.mockReturnValue(new Promise(() => {})) // never resolves

    render(<SimilarWorks workId={1} />)
    expect(screen.getByText('Finding similar works...')).toBeInTheDocument()
  })
})
