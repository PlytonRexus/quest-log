import { useEffect, useState } from 'react'
import { runMigrations } from './db/migrate'
import { runSeed } from './db/seed'
import { initializeDiscoveryState } from './game/discoveryEngine'
import { buildSkillTree } from './game/skillTree'
import { Layout } from './shell/Layout'

type InitState = 'loading' | 'ready' | 'error'

function App() {
  const [initState, setInitState] = useState<InitState>('loading')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function init() {
      try {
        await runMigrations()
        await runSeed()
        await initializeDiscoveryState()
        await buildSkillTree()
        setInitState('ready')
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err))
        setInitState('error')
      }
    }
    init()
  }, [])

  if (initState === 'loading') {
    return (
      <div className="min-h-screen bg-void text-star flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-accent mb-2">Narrative Portal</h1>
          <p className="text-star/50">Initializing...</p>
        </div>
      </div>
    )
  }

  if (initState === 'error') {
    return (
      <div className="min-h-screen bg-void text-star flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-2">Error</h1>
          <p className="text-star/70">{error}</p>
        </div>
      </div>
    )
  }

  return <Layout />
}

export default App
