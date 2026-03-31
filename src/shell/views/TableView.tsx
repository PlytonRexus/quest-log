import { useCallback } from 'react'
import { useDb } from '../../hooks/useDb'
import { DebugTable } from '../../components/DebugTable'
import { ImportZone } from '../../components/ImportZone'
import { ModelSelector } from '../../components/ModelSelector'

function TableView() {
  const db = useDb()

  const handleImportComplete = useCallback(async () => {
    await db.refresh()
  }, [db.refresh])

  return (
    <div className="h-full overflow-auto">
      <main className="max-w-6xl mx-auto p-6 space-y-8">
        <section>
          <h2 className="text-lg font-semibold mb-3 text-star/80">Import Reviews</h2>
          <ImportZone onImportComplete={handleImportComplete} />
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3 text-star/80">
            Works ({db.works.length})
          </h2>
          <DebugTable
            works={db.works}
            getTropesForWork={db.getTropesForWork}
            getDimensionScoresForWork={db.getDimensionScoresForWork}
          />
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3 text-star/80">Local LLM</h2>
          <ModelSelector />
        </section>
      </main>
    </div>
  )
}

export default TableView
