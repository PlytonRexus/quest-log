import { useRef, useCallback, type ReactNode, type PointerEvent, type KeyboardEvent } from 'react'

const GRID_SNAP = 25

interface CanvasElementProps {
  x: number
  y: number
  width: number
  height: number
  snapToGrid?: boolean
  onMove: (x: number, y: number) => void
  onClick?: () => void
  selected?: boolean
  tabIndex?: number
  ariaLabel?: string
  onKeyDown?: (e: KeyboardEvent) => void
  children: ReactNode
}

export function CanvasElement({
  x,
  y,
  width,
  height,
  snapToGrid = false,
  onMove,
  onClick,
  selected = false,
  tabIndex,
  ariaLabel,
  onKeyDown,
  children,
}: CanvasElementProps) {
  const dragging = useRef(false)
  const startOffset = useRef({ x: 0, y: 0 })

  const handlePointerDown = useCallback(
    (e: PointerEvent) => {
      e.stopPropagation()
      dragging.current = true
      startOffset.current = { x: e.clientX - x, y: e.clientY - y }
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    },
    [x, y],
  )

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!dragging.current) return
      let newX = e.clientX - startOffset.current.x
      let newY = e.clientY - startOffset.current.y

      if (snapToGrid) {
        newX = Math.round(newX / GRID_SNAP) * GRID_SNAP
        newY = Math.round(newY / GRID_SNAP) * GRID_SNAP
      }

      onMove(newX, newY)
    },
    [snapToGrid, onMove],
  )

  const handlePointerUp = useCallback(
    (e: PointerEvent) => {
      if (dragging.current) {
        dragging.current = false
        // If barely moved, treat as click
        const dx = Math.abs(e.clientX - startOffset.current.x - x)
        const dy = Math.abs(e.clientY - startOffset.current.y - y)
        if (dx < 3 && dy < 3 && onClick) {
          onClick()
        }
      }
    },
    [x, y, onClick],
  )

  return (
    <div
      className={`absolute select-none cursor-move ${
        selected ? 'ring-2 ring-accent' : ''
      }`}
      style={{
        left: x,
        top: y,
        width,
        height,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onKeyDown={onKeyDown}
      tabIndex={tabIndex}
      role="group"
      aria-label={ariaLabel}
      aria-selected={selected}
      data-testid="canvas-element"
    >
      {children}
    </div>
  )
}
