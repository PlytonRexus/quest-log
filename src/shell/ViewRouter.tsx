import { Suspense, lazy, useEffect, useCallback } from 'react'
import { ErrorBoundary } from './ErrorBoundary'
import { LoadingSkeleton } from './LoadingSkeleton'

export type ViewId = 'galaxy' | 'skilltree' | 'canvas' | 'table' | 'chat'

interface ViewDef {
  id: ViewId
  label: string
  icon: string
  shortcut: string
}

export const VIEW_DEFS: ViewDef[] = [
  { id: 'galaxy', label: 'Galaxy', icon: '\u2726', shortcut: '1' },
  { id: 'skilltree', label: 'Skill Tree', icon: '\u25C8', shortcut: '2' },
  { id: 'canvas', label: 'Canvas', icon: '\u25A1', shortcut: '3' },
  { id: 'table', label: 'Table', icon: '\u2261', shortcut: '4' },
  { id: 'chat', label: 'Chat', icon: '\u25CB', shortcut: '5' },
]

const GalaxyView = lazy(() => import('../viz/GalaxyView'))
const SkillTreeView = lazy(() => import('./views/SkillTreeView'))
const CanvasView = lazy(() => import('./views/CanvasView'))
const TableView = lazy(() => import('./views/TableView'))
const ChatView = lazy(() => import('./views/ChatView'))

const VIEW_COMPONENTS: Record<ViewId, React.LazyExoticComponent<React.ComponentType>> = {
  galaxy: GalaxyView,
  skilltree: SkillTreeView,
  canvas: CanvasView,
  table: TableView,
  chat: ChatView,
}

function ViewFallback() {
  return (
    <div className="flex items-center justify-center h-full bg-void p-12">
      <LoadingSkeleton lines={5} className="w-64" />
    </div>
  )
}

interface ViewRouterProps {
  activeView: ViewId
  onViewChange: (view: ViewId) => void
}

export function ViewRouter({ activeView, onViewChange }: ViewRouterProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't handle shortcuts when focused in an input, textarea, or contentEditable
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement).isContentEditable) {
        return
      }
      const index = parseInt(e.key, 10)
      if (index >= 1 && index <= VIEW_DEFS.length) {
        e.preventDefault()
        onViewChange(VIEW_DEFS[index - 1].id)
      }
    },
    [onViewChange],
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const ActiveComponent = VIEW_COMPONENTS[activeView]

  return (
    <div className="flex flex-col h-full">
      <TabBar activeView={activeView} onViewChange={onViewChange} />
      <div className="flex-1 min-h-0" role="tabpanel" id={`view-panel-${activeView}`}>
        <ErrorBoundary>
          <Suspense fallback={<ViewFallback />}>
            <ActiveComponent />
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  )
}

interface TabBarProps {
  activeView: ViewId
  onViewChange: (view: ViewId) => void
}

function TabBar({ activeView, onViewChange }: TabBarProps) {
  return (
    <nav
      className="flex items-center gap-1 px-4 py-2 bg-surface border-b border-border"
      role="tablist"
      aria-label="View navigation"
    >
      {VIEW_DEFS.map((def) => {
        const isActive = activeView === def.id
        return (
          <button
            key={def.id}
            role="tab"
            aria-selected={isActive}
            aria-controls={`view-panel-${def.id}`}
            onClick={() => onViewChange(def.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded transition-colors ${
              isActive
                ? 'bg-accent text-void font-semibold'
                : 'text-star/60 hover:bg-surface-bright hover:text-star/80'
            }`}
            title={`${def.label} (${def.shortcut})`}
          >
            <span aria-hidden="true">{def.icon}</span>
            <span>{def.label}</span>
            <kbd className="ml-1 text-[10px] opacity-50">{def.shortcut}</kbd>
          </button>
        )
      })}
    </nav>
  )
}
