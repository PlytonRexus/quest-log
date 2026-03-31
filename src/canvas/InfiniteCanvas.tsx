import { useRef, useCallback, type ReactNode, type WheelEvent, type PointerEvent } from 'react'

const MIN_ZOOM = 0.1
const MAX_ZOOM = 5
const GRID_SIZE = 50

interface Viewport {
  x: number
  y: number
  zoom: number
}

interface InfiniteCanvasProps {
  children: (viewport: Viewport) => ReactNode
  viewport: Viewport
  onViewportChange: (viewport: Viewport) => void
}

export function InfiniteCanvas({ children, viewport, onViewportChange }: InfiniteCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)
  const dragStart = useRef({ x: 0, y: 0 })

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault()
      const delta = e.deltaY > 0 ? 0.9 : 1.1
      const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, viewport.zoom * delta))
      onViewportChange({ ...viewport, zoom: newZoom })
    },
    [viewport, onViewportChange],
  )

  const handlePointerDown = useCallback(
    (e: PointerEvent) => {
      // Only pan on background clicks (not on child elements)
      if (e.target !== containerRef.current) return
      dragging.current = true
      dragStart.current = { x: e.clientX - viewport.x, y: e.clientY - viewport.y }
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    },
    [viewport],
  )

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!dragging.current) return
      const newX = e.clientX - dragStart.current.x
      const newY = e.clientY - dragStart.current.y
      onViewportChange({ ...viewport, x: newX, y: newY })
    },
    [viewport, onViewportChange],
  )

  const handlePointerUp = useCallback(() => {
    dragging.current = false
  }, [])

  // Generate grid pattern SVG
  const scaledGrid = GRID_SIZE * viewport.zoom
  const offsetX = viewport.x % scaledGrid
  const offsetY = viewport.y % scaledGrid

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-void cursor-grab active:cursor-grabbing"
      role="application"
      aria-label="Infinite canvas"
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      data-testid="infinite-canvas"
    >
      {/* Grid background */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        data-testid="canvas-grid"
      >
        <defs>
          <pattern
            id="grid"
            width={scaledGrid}
            height={scaledGrid}
            patternUnits="userSpaceOnUse"
            x={offsetX}
            y={offsetY}
          >
            <path
              d={`M ${scaledGrid} 0 L 0 0 0 ${scaledGrid}`}
              fill="none"
              stroke="rgba(42, 48, 96, 0.3)"
              strokeWidth={1}
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Content layer with transform */}
      <div
        className="absolute"
        style={{
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
          transformOrigin: '0 0',
        }}
        data-testid="canvas-content"
      >
        {children(viewport)}
      </div>
    </div>
  )
}

export type { Viewport }
