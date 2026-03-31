import { useState, useEffect } from 'react'
import { getEmbedding, getWorkById } from '../db/dal'
import { EMBEDDING_MODEL } from '../ai/models'
import { bufferToFloat32Array } from '../ai/embeddings'
import { findSimilarWorks } from '../ai/similarity'
import type { Work } from '../types'

interface SimilarWork {
  work: Work
  similarity: number
}

interface Props {
  workId: number
  onWorkSelect?: (workId: number) => void
}

export function SimilarWorks({ workId, onWorkSelect }: Props) {
  const [results, setResults] = useState<SimilarWork[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      setError(null)

      try {
        const embedding = await getEmbedding('work', workId, EMBEDDING_MODEL.id)
        if (!embedding) {
          setResults([])
          setIsLoading(false)
          return
        }

        const queryVector = bufferToFloat32Array(embedding.vector)
        const similar = await findSimilarWorks(queryVector, 5, workId)

        const works: SimilarWork[] = []
        for (const s of similar) {
          const work = await getWorkById(s.workId)
          if (work && !cancelled) {
            works.push({ work, similarity: s.similarity })
          }
        }

        if (!cancelled) {
          setResults(works)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err))
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    load()
    return () => { cancelled = true }
  }, [workId])

  if (isLoading) {
    return <div className="text-star/50 text-sm">Finding similar works...</div>
  }

  if (error) {
    return <div className="text-red-400 text-sm">{error}</div>
  }

  if (results.length === 0) {
    return <div className="text-star/40 text-sm">No embeddings available for similarity search</div>
  }

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-star/70">Similar Works</h4>
      {results.map(({ work, similarity }) => (
        <div
          key={work.id}
          className="flex items-center gap-3 cursor-pointer hover:bg-surface-bright p-2 rounded transition-colors"
          onClick={() => onWorkSelect?.(work.id)}
        >
          <div className="flex-1 min-w-0">
            <span className="text-sm text-star truncate block">{work.title}</span>
            <span className="text-xs text-star/40">{work.medium}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-16 h-1.5 bg-surface rounded-full overflow-hidden">
              <div
                className="h-full bg-accent rounded-full"
                style={{ width: `${Math.round(similarity * 100)}%` }}
              />
            </div>
            <span className="text-xs text-accent w-10 text-right">
              {Math.round(similarity * 100)}%
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
