import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { runMigrations } from '../../db/migrate'
import { resetDb } from '../../db/connection'
import {
  addCanvasElement,
  getCanvasElements,
  updateCanvasElementPosition,
  updateCanvasElementContent,
  deleteCanvasElement,
  addCanvasConnection,
  getCanvasConnections,
  clearCanvas,
} from '../canvasStore'

beforeEach(async () => {
  await runMigrations()
})

afterEach(async () => {
  await resetDb()
})

describe('canvasStore', () => {
  it('adds an element and retrieves it', async () => {
    const el = await addCanvasElement('sticky', 100, 200, { content: 'Hello' })
    expect(el.id).toBeGreaterThan(0)
    expect(el.type).toBe('sticky')
    expect(el.x).toBe(100)
    expect(el.y).toBe(200)
    expect(el.content).toBe('Hello')

    const elements = await getCanvasElements()
    expect(elements).toHaveLength(1)
    expect(elements[0].content).toBe('Hello')
  })

  it('updates element position', async () => {
    const el = await addCanvasElement('sticky', 0, 0)
    await updateCanvasElementPosition(el.id, 50, 75)
    const elements = await getCanvasElements()
    expect(elements[0].x).toBe(50)
    expect(elements[0].y).toBe(75)
  })

  it('updates element content', async () => {
    const el = await addCanvasElement('sticky', 0, 0, { content: 'old' })
    await updateCanvasElementContent(el.id, 'new content')
    const elements = await getCanvasElements()
    expect(elements[0].content).toBe('new content')
  })

  it('deletes an element', async () => {
    const el = await addCanvasElement('sticky', 0, 0)
    await deleteCanvasElement(el.id)
    const elements = await getCanvasElements()
    expect(elements).toHaveLength(0)
  })

  it('adds a connection between elements', async () => {
    const a = await addCanvasElement('trope', 0, 0, { entityId: 1 })
    const b = await addCanvasElement('work', 200, 0, { entityId: 2 })
    const conn = await addCanvasConnection(a.id, b.id, 'related')

    expect(conn.sourceElementId).toBe(a.id)
    expect(conn.targetElementId).toBe(b.id)
    expect(conn.label).toBe('related')

    const conns = await getCanvasConnections()
    expect(conns).toHaveLength(1)
  })

  it('deletes connections when element is deleted', async () => {
    const a = await addCanvasElement('trope', 0, 0)
    const b = await addCanvasElement('work', 200, 0)
    await addCanvasConnection(a.id, b.id)

    await deleteCanvasElement(a.id)
    const conns = await getCanvasConnections()
    expect(conns).toHaveLength(0)
  })

  it('clears all elements and connections', async () => {
    const a = await addCanvasElement('sticky', 0, 0)
    const b = await addCanvasElement('sticky', 100, 100)
    await addCanvasConnection(a.id, b.id)

    await clearCanvas()
    expect(await getCanvasElements()).toHaveLength(0)
    expect(await getCanvasConnections()).toHaveLength(0)
  })
})
