export type CanvasTool = 'select' | 'trope' | 'work' | 'sticky' | 'connect'

interface CanvasToolbarProps {
  activeTool: CanvasTool
  onToolChange: (tool: CanvasTool) => void
  onClear: () => void
  onAnalyze?: () => void
  analyzing?: boolean
}

const TOOLS: { id: CanvasTool; label: string; icon: string }[] = [
  { id: 'select', label: 'Select', icon: '\u2190' },
  { id: 'trope', label: 'Add Trope', icon: '\u25C8' },
  { id: 'work', label: 'Add Work', icon: '\u25A0' },
  { id: 'sticky', label: 'Sticky Note', icon: '\u25A1' },
  { id: 'connect', label: 'Connect', icon: '\u2014' },
]

export function CanvasToolbar({
  activeTool,
  onToolChange,
  onClear,
  onAnalyze,
  analyzing = false,
}: CanvasToolbarProps) {
  return (
    <div
      className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 px-3 py-2 rounded-lg bg-surface/90 border border-border backdrop-blur-sm"
      data-testid="canvas-toolbar"
    >
      {TOOLS.map((tool) => (
        <button
          key={tool.id}
          onClick={() => onToolChange(tool.id)}
          className={`px-3 py-1.5 text-sm rounded transition-colors ${
            activeTool === tool.id
              ? 'bg-accent text-void font-semibold'
              : 'text-star/60 hover:bg-surface-bright hover:text-star/80'
          }`}
          title={tool.label}
        >
          <span className="mr-1">{tool.icon}</span>
          {tool.label}
        </button>
      ))}
      <div className="w-px h-6 bg-border mx-1" />
      {onAnalyze && (
        <button
          onClick={onAnalyze}
          disabled={analyzing}
          className="px-3 py-1.5 text-sm rounded text-accent hover:bg-accent/10 disabled:opacity-50"
          title="Analyze canvas with AI"
        >
          {analyzing ? 'Analyzing...' : 'Analyze'}
        </button>
      )}
      <button
        onClick={onClear}
        className="px-3 py-1.5 text-sm rounded text-red-400 hover:bg-red-400/10"
        title="Clear canvas"
      >
        Clear
      </button>
    </div>
  )
}
