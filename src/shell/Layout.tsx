import { useState } from 'react'
import { ViewRouter, type ViewId } from './ViewRouter'
import { StatsBar } from './StatsBar'
import { HudOverlay } from './HudOverlay'
import { FocusProvider } from './FocusContext'
import { PluginProvider } from '../plugins/PluginContext'
import { ModelLoader } from '../components/ModelLoader'

export function Layout() {
  const [activeView, setActiveView] = useState<ViewId>('galaxy')

  return (
    <PluginProvider>
      <FocusProvider>
        <div className="flex flex-col h-screen bg-void text-star">
          <header
            className="flex items-center justify-between px-6 py-3 border-b border-border shrink-0"
            role="banner"
          >
            <h1 className="text-xl font-bold text-accent">Narrative Portal</h1>
            <ModelLoader />
          </header>
          <main className="flex-1 min-h-0 flex flex-col relative" role="main">
            <ViewRouter activeView={activeView} onViewChange={setActiveView} />
            <HudOverlay />
          </main>
          <StatsBar />
        </div>
      </FocusProvider>
    </PluginProvider>
  )
}
