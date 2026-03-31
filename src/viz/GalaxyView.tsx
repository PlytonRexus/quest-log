// Top-level galaxy visualization composition component

import { useState, useCallback, useMemo, type KeyboardEvent } from 'react'
import { Scene } from './Scene'
import { GraphScene } from './GraphScene'
import { Starfield } from './Starfield'
import { Nebula } from './Nebula'
import { EdgeParticles } from './EdgeParticles'
import { CameraControls } from './CameraControls'
import { PostProcessing } from './PostProcessing'
import { useGraphData } from './useGraphData'
import { useFocus } from '../shell/FocusContext'
import { importMarkdownBatch } from '../ingestion/importer'

const SAMPLE_FILES = [
  'spirited-away.md',
  'the-name-of-the-wind.md',
  'hades.md',
  'attack-on-titan.md',
]

export function GalaxyView() {
  const { graphData, isLoading, error, rebuild } = useGraphData()
  const [focusedNodeIndex, setFocusedNodeIndex] = useState(-1)
  const { setFocus, clearFocus } = useFocus()
  const [loadingSamples, setLoadingSamples] = useState(false)

  const nodes = useMemo(() => graphData?.nodes ?? [], [graphData])

  const focusedNode = focusedNodeIndex >= 0 && focusedNodeIndex < nodes.length
    ? nodes[focusedNodeIndex]
    : null

  const handleLoadSamples = useCallback(async () => {
    setLoadingSamples(true)
    try {
      const files = await Promise.all(
        SAMPLE_FILES.map(async (name) => {
          const res = await fetch(`${import.meta.env.BASE_URL}samples/${name}`)
          const content = await res.text()
          return { content, name }
        }),
      )
      await importMarkdownBatch(files)
      await rebuild()
    } finally {
      setLoadingSamples(false)
    }
  }, [rebuild])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (nodes.length === 0) return

      switch (e.key) {
        case 'ArrowDown':
        case 'ArrowRight':
          e.preventDefault()
          setFocusedNodeIndex((prev) => {
            const next = prev < 0 ? 0 : (prev + 1) % nodes.length
            return next
          })
          break
        case 'ArrowUp':
        case 'ArrowLeft':
          e.preventDefault()
          setFocusedNodeIndex((prev) => {
            const next = prev <= 0 ? nodes.length - 1 : prev - 1
            return next
          })
          break
        case 'Enter': {
          e.preventDefault()
          if (focusedNode) {
            const focusType = focusedNode.kind === 'work' || focusedNode.kind === 'trope'
              ? focusedNode.kind
              : null
            if (focusType && focusedNode.entityId != null) {
              setFocus({ type: focusType, entityId: focusedNode.entityId })
            }
          }
          break
        }
        case 'Escape':
          e.preventDefault()
          setFocusedNodeIndex(-1)
          clearFocus()
          break
      }
    },
    [nodes, focusedNode, setFocus, clearFocus],
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)] bg-void">
        <p className="text-star/50">Building galaxy...</p>
      </div>
    )
  }

  if (error || !graphData) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)] bg-void">
        <p className="text-red-400">{error ?? 'Failed to build graph'}</p>
      </div>
    )
  }

  const isEmpty = graphData.nodes.length === 0

  if (isEmpty) {
    return (
      <div className="relative h-[calc(100vh-64px)]">
        <Scene>
          <Starfield />
          <Nebula />
          <CameraControls />
          <PostProcessing />
        </Scene>
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <div
            className="text-center max-w-md px-8 py-10 rounded-xl"
            style={{
              backdropFilter: 'blur(12px)',
              background: 'rgba(0,0,0,0.6)',
            }}
          >
            <h2 className="text-2xl font-bold text-star mb-3">Your galaxy is empty</h2>
            <p className="text-star/60 mb-6">
              Import your reviews of films, books, games, and other narrative works.
              The app will detect tropes, award XP, and build your taste profile as a 3D graph.
            </p>
            <div className="flex flex-col gap-3 items-center">
              <button
                onClick={handleLoadSamples}
                disabled={loadingSamples}
                className="px-5 py-2.5 bg-accent text-void font-semibold rounded-lg hover:bg-accent/80 transition-colors disabled:opacity-50"
              >
                {loadingSamples ? 'Loading...' : 'Try with sample reviews'}
              </button>
              <p className="text-star/40 text-sm">
                Or switch to the Table view (press 4) to import your own markdown files.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Build node map for edge particles
  const nodeMap = new Map(graphData.nodes.map((n) => [n.id, n]))

  const announcement = focusedNode
    ? `${focusedNode.label}, ${focusedNode.kind} node`
    : ''

  return (
    <div className="relative h-[calc(100vh-64px)]">
      {/* Keyboard navigation overlay */}
      <div
        className="absolute inset-0 z-10"
        tabIndex={0}
        role="img"
        aria-label="Galaxy graph. Use arrow keys to navigate nodes."
        onKeyDown={handleKeyDown}
        style={{ pointerEvents: 'none' }}
        onFocus={(e) => { e.currentTarget.style.pointerEvents = 'none' }}
        data-testid="galaxy-keyboard-overlay"
      />
      {/* Screen reader announcement */}
      <div aria-live="assertive" className="sr-only" data-testid="galaxy-sr-announce">
        {announcement}
      </div>
      <Scene>
        <Starfield />
        <Nebula />
        <GraphScene graphData={graphData} focusedNodeId={focusedNode?.id ?? null} />
        <EdgeParticles links={graphData.links} nodeMap={nodeMap} />
        <CameraControls />
        <PostProcessing />
      </Scene>
    </div>
  )
}

export default GalaxyView
