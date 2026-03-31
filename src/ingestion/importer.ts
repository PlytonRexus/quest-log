import { parseMarkdown } from './parser'
import { extractReviewData } from './extractor'
import { insertWork, insertReview, getWorks } from '../db/dal'
import type { ImportReport } from '../types'

export async function importMarkdownString(
  markdown: string,
  filename?: string,
): Promise<{ workId: number; skipped: boolean }> {
  const ast = parseMarkdown(markdown)
  const data = extractReviewData(ast)

  // Determine title from frontmatter or filename
  const title =
    data.frontmatter.title ||
    (filename ? filename.replace(/\.(md|markdown|txt)$/i, '') : 'Untitled')

  const medium = data.frontmatter.medium || 'unknown'
  const score = data.frontmatter.rating ?? null

  // Check for duplicate
  const existing = await getWorks()
  const duplicate = existing.find(
    (w) => w.title.toLowerCase() === title.toLowerCase() && w.medium === medium,
  )

  if (duplicate) {
    // Link new review to existing work
    await insertReview({
      workId: duplicate.id,
      rawMarkdown: markdown,
      parsedMetadata: JSON.stringify({
        keywords: data.keywords,
        engagementScore: data.engagementScore,
        wordCount: data.wordCount,
      }),
      importedFrom: filename ?? null,
      createdAt: new Date().toISOString(),
    })
    return { workId: duplicate.id, skipped: true }
  }

  // Create new work and review
  const work = await insertWork({
    title,
    medium,
    year: null,
    coverUrl: null,
    primaryScore: score,
    comfortScore: null,
    consumptionMode: null,
    dateConsumed: data.frontmatter.date ?? null,
    notes: null,
  })

  await insertReview({
    workId: work.id,
    rawMarkdown: markdown,
    parsedMetadata: JSON.stringify({
      keywords: data.keywords,
      engagementScore: data.engagementScore,
      wordCount: data.wordCount,
    }),
    importedFrom: filename ?? null,
    createdAt: new Date().toISOString(),
  })

  return { workId: work.id, skipped: false }
}

export async function importMarkdownBatch(
  files: { content: string; name: string }[],
  onProgress?: (processed: number, total: number) => void,
): Promise<ImportReport> {
  const report: ImportReport = { imported: 0, skipped: 0, errors: [] }

  for (let i = 0; i < files.length; i++) {
    try {
      const result = await importMarkdownString(files[i].content, files[i].name)
      if (result.skipped) {
        report.skipped++
      } else {
        report.imported++
      }
    } catch (err) {
      report.errors.push(
        `${files[i].name}: ${err instanceof Error ? err.message : String(err)}`,
      )
    }

    onProgress?.(i + 1, files.length)
  }

  return report
}
