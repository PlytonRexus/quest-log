import { useState, useEffect, useCallback, useRef, type KeyboardEvent } from 'react'
import { InfiniteCanvas, type Viewport } from '../../canvas/InfiniteCanvas'
import { CanvasElement } from '../../canvas/CanvasElement'
import { CanvasToolbar, type CanvasTool } from '../../canvas/CanvasToolbar'
import { TropeCard } from '../../canvas/elements/TropeCard'
import { WorkCard } from '../../canvas/elements/WorkCard'
import { StickyNote } from '../../canvas/elements/StickyNote'
import { ConnectionLine } from '../../canvas/elements/ConnectionLine'
import {
  addCanvasElement,
  getCanvasElements,
  getCanvasConnections,
  updateCanvasElementPosition,
  updateCanvasElementContent,
  updateCanvasElementColor,
  addCanvasConnection,
  clearCanvas,
} from '../../canvas/canvasStore'
import { getWorks, getTropes } from '../../db/dal'
import { useLlm } from '../../hooks/useLlm'
import { buildCanvasAnalysisPrompt, computePlacementPosition } from '../../canvas/analysisPrompt'
import type { CanvasElement as CanvasElementType, CanvasConnection, Work, Trope } from '../../types'

function CanvasView() {
  const [viewport, setViewport] = useState<Viewport>({ x: 0, y: 0, zoom: 1 })
  const [activeTool, setActiveTool] = useState<CanvasTool>('select')
  const [elements, setElements] = useState<CanvasElementType[]>([])
  const [connections, setConnections] = useState<CanvasConnection[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [connectSource, setConnectSource] = useState<number | null>(null)
  const [focusedIndex, setFocusedIndex] = useState(0)
  const [works, setWorks] = useState<Work[]>([])
  const [tropes, setTropes] = useState<Trope[]>([])
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { isReady: llmReady, isGenerating, generate } = useLlm()

  // Load canvas and reference data on mount
  useEffect(() => {
    async function load() {
      const [els, conns, w, t] = await Promise.all([
        getCanvasElements(),
        getCanvasConnections(),
        getWorks(),
        getTropes(),
      ])
      setElements(els)
      setConnections(conns)
      setWorks(w)
      setTropes(t)
    }
    load()
  }, [])

  const debouncedSavePosition = useCallback(
    (id: number, x: number, y: number) => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(() => {
        updateCanvasElementPosition(id, x, y)
      }, 300)
    },
    [],
  )

  const handleCanvasClick = useCallback(
    async (viewport: Viewport, e: React.MouseEvent) => {
      // Only place elements when using add tools and clicking the background
      if (activeTool === 'select' || activeTool === 'connect') return
      if ((e.target as HTMLElement).closest('[data-testid="canvas-element"]')) return

      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
      const x = (e.clientX - rect.left - viewport.x) / viewport.zoom
      const y = (e.clientY - rect.top - viewport.y) / viewport.zoom

      if (activeTool === 'sticky') {
        const el = await addCanvasElement('sticky', x, y, {
          content: '',
          color: '#F59E0B',
        })
        setElements((prev) => [...prev, el])
        setActiveTool('select')
      } else if (activeTool === 'trope' && tropes.length > 0) {
        // Place a random trope for quick prototyping; search UI would be better
        const trope = tropes[Math.floor(Math.random() * tropes.length)]
        const el = await addCanvasElement('trope', x, y, {
          entityId: trope.id,
          content: trope.name,
        })
        setElements((prev) => [...prev, el])
        setActiveTool('select')
      } else if (activeTool === 'work' && works.length > 0) {
        const work = works[Math.floor(Math.random() * works.length)]
        const el = await addCanvasElement('work', x, y, {
          entityId: work.id,
          content: work.title,
        })
        setElements((prev) => [...prev, el])
        setActiveTool('select')
      }
    },
    [activeTool, tropes, works],
  )

  const handleElementClick = useCallback(
    async (elementId: number) => {
      if (activeTool === 'connect') {
        if (connectSource === null) {
          setConnectSource(elementId)
        } else if (connectSource !== elementId) {
          const conn = await addCanvasConnection(connectSource, elementId)
          setConnections((prev) => [...prev, conn])
          setConnectSource(null)
          setActiveTool('select')
        }
      } else {
        setSelectedId((prev) => (prev === elementId ? null : elementId))
      }
    },
    [activeTool, connectSource],
  )

  const handleMove = useCallback(
    (id: number, x: number, y: number) => {
      setElements((prev) =>
        prev.map((el) => (el.id === id ? { ...el, x, y } : el)),
      )
      debouncedSavePosition(id, x, y)
    },
    [debouncedSavePosition],
  )

  const handleContentChange = useCallback(async (id: number, content: string) => {
    setElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, content } : el)),
    )
    await updateCanvasElementContent(id, content)
  }, [])

  const handleColorChange = useCallback(async (id: number, color: string) => {
    setElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, color } : el)),
    )
    await updateCanvasElementColor(id, color)
  }, [])

  const handleAnalyze = useCallback(async () => {
    if (elements.length === 0) return
    try {
      const messages = buildCanvasAnalysisPrompt(elements, connections)
      const response = await generate(messages, { maxTokens: 500 })
      const pos = computePlacementPosition(elements)
      const note = await addCanvasElement('sticky', pos.x, pos.y, {
        content: response,
        color: '#06B6D4',
      })
      setElements((prev) => [...prev, note])
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Analysis failed'
      const pos = computePlacementPosition(elements)
      const note = await addCanvasElement('sticky', pos.x, pos.y, {
        content: `Error: ${errorMsg}`,
        color: '#EF4444',
      })
      setElements((prev) => [...prev, note])
    }
  }, [elements, connections, generate])

  const handleClear = useCallback(async () => {
    await clearCanvas()
    setElements([])
    setConnections([])
    setSelectedId(null)
    setConnectSource(null)
  }, [])

  const GRID_SNAP = 25

  const handleElementKeyDown = useCallback(
    (e: KeyboardEvent, elId: number) => {
      const el = elements.find((elem) => elem.id === elId)
      if (!el) return

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault()
          handleMove(elId, el.x, el.y - GRID_SNAP)
          break
        case 'ArrowDown':
          e.preventDefault()
          handleMove(elId, el.x, el.y + GRID_SNAP)
          break
        case 'ArrowLeft':
          e.preventDefault()
          handleMove(elId, el.x - GRID_SNAP, el.y)
          break
        case 'ArrowRight':
          e.preventDefault()
          handleMove(elId, el.x + GRID_SNAP, el.y)
          break
        case 'Enter':
          e.preventDefault()
          setSelectedId((prev) => (prev === elId ? null : elId))
          break
        case 'Escape':
          e.preventDefault()
          setSelectedId(null)
          break
        case 'Tab': {
          e.preventDefault()
          const len = elements.length
          if (len === 0) return
          const dir = e.shiftKey ? -1 : 1
          setFocusedIndex((prev) => ((prev + dir) % len + len) % len)
          break
        }
      }
    },
    [elements, handleMove],
  )

  // Build aria-label for the focused element
  const focusedElement = elements[focusedIndex]
  const focusedLabel = focusedElement
    ? `${focusedElement.type} element: ${focusedElement.content || 'untitled'}`
    : ''

  // Resolve entity data for rendering
  const getWork = useCallback(
    (entityId: number) => works.find((w) => w.id === entityId),
    [works],
  )

  const getTrope = useCallback(
    (entityId: number) => tropes.find((t) => t.id === entityId),
    [tropes],
  )

  const [loaded, setLoaded] = useState(false)

  // Mark initial load complete
  useEffect(() => {
    if (!loaded && elements.length === 0) {
      // Wait for first load to finish before showing empty state
      getCanvasElements().then((els) => {
        if (els.length === 0) setLoaded(true)
      })
    }
  }, [loaded, elements.length])

  // Dismiss empty state when elements appear
  useEffect(() => {
    if (elements.length > 0) setLoaded(false)
  }, [elements.length])

  const showEmptyHint = loaded && elements.length === 0

  return (
    <div className="h-full relative" data-testid="canvas-view">
      <CanvasToolbar
        activeTool={activeTool}
        onToolChange={setActiveTool}
        onClear={handleClear}
        onAnalyze={llmReady ? handleAnalyze : undefined}
        analyzing={isGenerating}
      />
      {/* Screen reader announcement for focused element */}
      <div aria-live="polite" className="sr-only" data-testid="canvas-sr-announce">
        {focusedLabel}
      </div>
      {showEmptyHint && (
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <div
            className="text-center max-w-sm px-6 py-8 rounded-xl"
            style={{
              backdropFilter: 'blur(12px)',
              background: 'rgba(0,0,0,0.6)',
            }}
          >
            <h3 className="text-lg font-semibold text-star mb-2">Canvas is empty</h3>
            <p className="text-star/60 text-sm">
              Use the toolbar above to place sticky notes, trope cards, or work cards.
              Connect elements to map out narrative patterns, or let the AI analyze your board.
            </p>
          </div>
        </div>
      )}
      <InfiniteCanvas viewport={viewport} onViewportChange={setViewport}>
        {(vp) => (
          <div
            onClick={(e) => handleCanvasClick(vp, e)}
            style={{ minWidth: '200vw', minHeight: '200vh' }}
            data-testid="canvas-click-area"
          >
            {/* Connection lines */}
            {connections.map((conn) => {
              const src = elements.find((el) => el.id === conn.sourceElementId)
              const tgt = elements.find((el) => el.id === conn.targetElementId)
              if (!src || !tgt) return null
              return (
                <ConnectionLine
                  key={`conn-${conn.id}`}
                  x1={src.x + src.width / 2}
                  y1={src.y + src.height / 2}
                  x2={tgt.x + tgt.width / 2}
                  y2={tgt.y + tgt.height / 2}
                  label={conn.label ?? undefined}
                />
              )
            })}

            {/* Canvas elements */}
            {elements.map((el, i) => (
              <CanvasElement
                key={el.id}
                x={el.x}
                y={el.y}
                width={el.width}
                height={el.height}
                selected={selectedId === el.id}
                onMove={(x, y) => handleMove(el.id, x, y)}
                onClick={() => handleElementClick(el.id)}
                tabIndex={i === focusedIndex ? 0 : -1}
                ariaLabel={`${el.type}: ${el.content || 'untitled'}`}
                onKeyDown={(e) => handleElementKeyDown(e, el.id)}
              >
                {el.type === 'trope' && el.entityId && (() => {
                  const trope = getTrope(el.entityId)
                  return trope ? (
                    <TropeCard
                      name={trope.name}
                      category={trope.category}
                      description={trope.description ?? undefined}
                    />
                  ) : (
                    <TropeCard name={el.content ?? 'Unknown'} category="unknown" />
                  )
                })()}
                {el.type === 'work' && el.entityId && (() => {
                  const work = getWork(el.entityId)
                  return work ? (
                    <WorkCard
                      title={work.title}
                      medium={work.medium}
                      score={work.primaryScore}
                    />
                  ) : (
                    <WorkCard title={el.content ?? 'Unknown'} medium="unknown" score={null} />
                  )
                })()}
                {el.type === 'sticky' && (
                  <StickyNote
                    content={el.content ?? ''}
                    color={el.color ?? '#F59E0B'}
                    onContentChange={(c) => handleContentChange(el.id, c)}
                    onColorChange={(c) => handleColorChange(el.id, c)}
                  />
                )}
              </CanvasElement>
            ))}
          </div>
        )}
      </InfiniteCanvas>
    </div>
  )
}

export default CanvasView
