import { useState, useRef, useCallback } from 'react'

const NOTE_COLORS = ['#F59E0B', '#22C55E', '#3B82F6', '#EC4899', '#A855F7', '#EF4444']

interface StickyNoteProps {
  content: string
  color: string
  onContentChange: (content: string) => void
  onColorChange: (color: string) => void
}

export function StickyNote({ content, color, onContentChange, onColorChange }: StickyNoteProps) {
  const [editing, setEditing] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleDoubleClick = useCallback(() => {
    setEditing(true)
    setTimeout(() => textareaRef.current?.focus(), 0)
  }, [])

  const handleBlur = useCallback(() => {
    setEditing(false)
  }, [])

  return (
    <div
      className="w-full h-full rounded-lg p-3 relative overflow-hidden"
      style={{ backgroundColor: color + '33', border: `2px solid ${color}66` }}
      aria-label={content ? content.slice(0, 40) : 'Empty sticky note'}
      data-testid="sticky-note"
      onDoubleClick={handleDoubleClick}
    >
      {editing ? (
        <textarea
          ref={textareaRef}
          className="w-full h-full bg-transparent text-star text-xs resize-none outline-none"
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          onBlur={handleBlur}
          data-testid="sticky-note-editor"
        />
      ) : (
        <p className="text-xs text-star/80 whitespace-pre-wrap">
          {content || 'Double-click to edit'}
        </p>
      )}
      <button
        className="absolute top-1 right-1 text-[10px] text-star/40 hover:text-star"
        onClick={(e) => {
          e.stopPropagation()
          setShowColorPicker((prev) => !prev)
        }}
        aria-label="Change color"
      >
        \u25CF
      </button>
      {showColorPicker && (
        <div className="absolute top-6 right-1 flex gap-1 bg-void p-1 rounded z-10" data-testid="color-picker">
          {NOTE_COLORS.map((c) => (
            <button
              key={c}
              className="w-4 h-4 rounded-full border border-star/20"
              style={{ backgroundColor: c }}
              onClick={(e) => {
                e.stopPropagation()
                onColorChange(c)
                setShowColorPicker(false)
              }}
              aria-label={`Select color ${c}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export { NOTE_COLORS }
