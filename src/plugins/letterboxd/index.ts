import type { PortalPlugin, PluginAPI } from '../types'

export interface LetterboxdEntry {
  title: string
  year: number | null
  rating: number | null
  review: string
}

export function parseLetterboxdCsv(csv: string): LetterboxdEntry[] {
  const lines = csv.split('\n')
  if (lines.length < 2) return []

  // Parse header to find column indices
  const header = lines[0].split(',').map((h) => h.trim().toLowerCase())
  const titleIdx = header.findIndex((h) => h === 'name' || h === 'title')
  const yearIdx = header.findIndex((h) => h === 'year')
  const ratingIdx = header.findIndex((h) => h === 'rating')
  const reviewIdx = header.findIndex((h) => h === 'review')

  if (titleIdx === -1) return []

  const entries: LetterboxdEntry[] = []

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    // Simple CSV parse (does not handle quoted commas)
    const cols = line.split(',')
    const title = cols[titleIdx]?.trim()
    if (!title) continue

    entries.push({
      title,
      year: yearIdx >= 0 ? parseInt(cols[yearIdx], 10) || null : null,
      rating: ratingIdx >= 0 ? parseFloat(cols[ratingIdx]) || null : null,
      review: reviewIdx >= 0 ? cols[reviewIdx]?.trim() ?? '' : '',
    })
  }

  return entries
}

export async function importLetterboxdEntries(
  entries: LetterboxdEntry[],
  api: PluginAPI,
): Promise<{ imported: number; skipped: number }> {
  if (!api.db.insertWork) {
    return { imported: 0, skipped: entries.length }
  }

  const existingWorks = await api.db.getWorks()
  const existingTitles = new Set(existingWorks.map((w) => w.title.toLowerCase()))

  let imported = 0
  let skipped = 0

  for (const entry of entries) {
    if (existingTitles.has(entry.title.toLowerCase())) {
      skipped++
      continue
    }

    await api.db.insertWork({
      title: entry.title,
      medium: 'film',
      year: entry.year,
      coverUrl: null,
      primaryScore: entry.rating ? entry.rating * 2 : null, // Letterboxd 5-star to 10-point
      comfortScore: null,
      consumptionMode: null,
      dateConsumed: null,
      notes: entry.review || null,
    })
    imported++
  }

  return { imported, skipped }
}

export const letterboxdPlugin: PortalPlugin = {
  id: 'letterboxd-importer',
  name: 'Letterboxd Importer',
  version: '1.0.0',
  description: 'Import film diary from Letterboxd CSV exports',
  permissions: ['db:read', 'db:write'],
  activate(_api: PluginAPI) {
    // Plugin is ready; import is triggered by user action
  },
  deactivate() {},
}
