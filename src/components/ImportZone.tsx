import { useState, useCallback } from 'react'
import { importMarkdownBatch } from '../ingestion/importer'
import type { ImportReport } from '../types'

interface Props {
  onImportComplete?: () => void
}

export function ImportZone({ onImportComplete }: Props) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [progress, setProgress] = useState({ processed: 0, total: 0 })
  const [report, setReport] = useState<ImportReport | null>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const isValidFile = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase()
    return ext === 'md' || ext === 'markdown' || ext === 'txt'
  }

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    const droppedFiles = Array.from(e.dataTransfer.files)
    const validFiles = droppedFiles.filter(isValidFile)

    if (validFiles.length === 0) {
      setReport({ imported: 0, skipped: 0, errors: ['No valid markdown files found. Accepted: .md, .markdown, .txt'] })
      return
    }

    setIsImporting(true)
    setReport(null)
    setProgress({ processed: 0, total: validFiles.length })

    const fileContents = await Promise.all(
      validFiles.map(async (f) => ({
        content: await f.text(),
        name: f.name,
      })),
    )

    const result = await importMarkdownBatch(fileContents, (processed, total) => {
      setProgress({ processed, total })
    })

    setReport(result)
    setIsImporting(false)
    onImportComplete?.()
  }, [onImportComplete])

  const handleFileInput = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const validFiles = Array.from(files).filter(isValidFile)
    if (validFiles.length === 0) {
      setReport({ imported: 0, skipped: 0, errors: ['No valid markdown files found.'] })
      return
    }

    setIsImporting(true)
    setReport(null)
    setProgress({ processed: 0, total: validFiles.length })

    const fileContents = await Promise.all(
      validFiles.map(async (f) => ({
        content: await f.text(),
        name: f.name,
      })),
    )

    const result = await importMarkdownBatch(fileContents, (processed, total) => {
      setProgress({ processed, total })
    })

    setReport(result)
    setIsImporting(false)
    onImportComplete?.()
  }, [onImportComplete])

  return (
    <div className="space-y-3">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${isDragOver
            ? 'border-accent bg-accent/10 text-accent'
            : 'border-border text-star/50 hover:border-star/30'
          }
        `}
        data-testid="import-zone"
      >
        <p className="text-lg mb-2">
          {isDragOver ? 'Drop files here' : 'Drag & drop markdown files'}
        </p>
        <p className="text-sm">
          Accepted formats: .md, .markdown, .txt
        </p>
        <label className="mt-4 inline-block px-4 py-2 bg-accent/20 text-accent rounded cursor-pointer hover:bg-accent/30 text-sm">
          Or click to browse
          <input
            type="file"
            multiple
            accept=".md,.markdown,.txt"
            onChange={handleFileInput}
            className="hidden"
          />
        </label>
      </div>

      {isImporting && (
        <div className="bg-surface rounded p-3">
          <div className="flex justify-between text-sm mb-1">
            <span>Importing...</span>
            <span>{progress.processed} / {progress.total}</span>
          </div>
          <div className="w-full bg-border rounded-full h-2">
            <div
              className="bg-accent h-2 rounded-full transition-all"
              style={{ width: `${progress.total > 0 ? (progress.processed / progress.total) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      {report && !isImporting && (
        <div className="bg-surface rounded p-3 text-sm" data-testid="import-report">
          <div className="flex gap-4">
            {report.imported > 0 && (
              <span className="text-green-400">Imported: {report.imported}</span>
            )}
            {report.skipped > 0 && (
              <span className="text-ember">Skipped: {report.skipped}</span>
            )}
            {report.errors.length > 0 && (
              <span className="text-red-400">Errors: {report.errors.length}</span>
            )}
          </div>
          {report.errors.length > 0 && (
            <ul className="mt-2 text-xs text-red-400 list-disc list-inside">
              {report.errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
