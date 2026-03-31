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

export function GalaxyView() {
  const { graphData, isLoading, error } = useGraphData()
  const [focusedNodeIndex, setFocusedNodeIndex] = useState(-1)
  const { setFocus, clearFocus } = useFocus()

  const nodes = useMemo(() => graphData?.nodes ?? [], [graphData])

  const focusedNode = focusedNodeIndex >= 0 && focusedNodeIndex < nodes.length
    ? nodes[focusedNodeIndex]
    : null

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
