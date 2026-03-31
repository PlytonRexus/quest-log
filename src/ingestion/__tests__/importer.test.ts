import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { resetDb } from '../../db/connection'
import { runMigrations } from '../../db/migrate'
import { getWorks, getReviewsForWork } from '../../db/dal'
import { importMarkdownString, importMarkdownBatch } from '../importer'

describe('importer', () => {
  beforeEach(async () => {
    await resetDb()
    await runMigrations()
  })

  afterEach(async () => {
    await resetDb()
  })

  it('imports a single markdown file with frontmatter', async () => {
    const md = '---\ntitle: "The Expanse"\nrating: 8.8\nmedium: series\n---\n\nGreat show.'
    const result = await importMarkdownString(md, 'expanse.md')

    expect(result.skipped).toBe(false)

    const works = await getWorks()
    const expanse = works.find((w) => w.title === 'The Expanse')
    expect(expanse).toBeDefined()
    expect(expanse!.primaryScore).toBe(8.8)
    expect(expanse!.medium).toBe('series')

    const reviews = await getReviewsForWork(expanse!.id)
    expect(reviews).toHaveLength(1)
    expect(reviews[0].rawMarkdown).toContain('Great show')
  })

  it('skips duplicate import and links review to existing work', async () => {
    const md = '---\ntitle: "The Expanse"\nrating: 8.8\nmedium: series\n---\n\nFirst review.'
    await importMarkdownString(md, 'expanse.md')

    const md2 = '---\ntitle: "The Expanse"\nrating: 8.8\nmedium: series\n---\n\nSecond review.'
    const result = await importMarkdownString(md2, 'expanse2.md')

    expect(result.skipped).toBe(true)

    const works = await getWorks()
    const expanseWorks = works.filter((w) => w.title === 'The Expanse')
    expect(expanseWorks).toHaveLength(1)

    const reviews = await getReviewsForWork(expanseWorks[0].id)
    expect(reviews).toHaveLength(2)
  })

  it('imports file without frontmatter using filename as title', async () => {
    const md = 'This is just a plain review.'
    const result = await importMarkdownString(md, 'my-review.md')
    expect(result.skipped).toBe(false)

    const works = await getWorks()
    expect(works.find((w) => w.title === 'my-review')).toBeDefined()
  })

  it('batch imports multiple files', async () => {
    const files = [
      { content: '---\ntitle: "A"\nmedium: film\n---\nReview A', name: 'a.md' },
      { content: '---\ntitle: "B"\nmedium: film\n---\nReview B', name: 'b.md' },
      { content: '---\ntitle: "C"\nmedium: film\n---\nReview C', name: 'c.md' },
    ]

    const report = await importMarkdownBatch(files)
    expect(report.imported).toBe(3)
    expect(report.skipped).toBe(0)
    expect(report.errors).toHaveLength(0)

    const works = await getWorks()
    expect(works).toHaveLength(3)
  })

  it('preserves parsedMetadata with keywords and engagement score', async () => {
    const md = '---\ntitle: "Test"\nmedium: film\n---\n\nThe narrative is compelling because the character development is nuanced.'
    await importMarkdownString(md, 'test.md')

    const works = await getWorks()
    const reviews = await getReviewsForWork(works[0].id)
    const metadata = JSON.parse(reviews[0].parsedMetadata!)

    expect(metadata.wordCount).toBeGreaterThan(0)
    expect(metadata.engagementScore).toBeGreaterThanOrEqual(0)
    expect(metadata.keywords).toBeDefined()
  })
})
