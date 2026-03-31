import { query, exec, insertAndGetId } from '../db/connection'
import type { CanvasElement, CanvasConnection, CanvasElementType } from '../types'

// Canvas element CRUD

export async function addCanvasElement(
  type: CanvasElementType,
  x: number,
  y: number,
  options?: { entityId?: number; content?: string; color?: string; width?: number; height?: number },
): Promise<CanvasElement> {
  const id = await insertAndGetId(
    `INSERT INTO canvasElements (type, entityId, x, y, width, height, content, color)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      type,
      options?.entityId ?? null,
      x,
      y,
      options?.width ?? 200,
      options?.height ?? 120,
      options?.content ?? null,
      options?.color ?? null,
    ],
  )
  return {
    id,
    type,
    entityId: options?.entityId ?? null,
    x,
    y,
    width: options?.width ?? 200,
    height: options?.height ?? 120,
    content: options?.content ?? null,
    color: options?.color ?? null,
  }
}

export async function getCanvasElements(): Promise<CanvasElement[]> {
  return query<CanvasElement>('SELECT * FROM canvasElements ORDER BY id')
}

export async function updateCanvasElementPosition(
  id: number,
  x: number,
  y: number,
): Promise<void> {
  await exec('UPDATE canvasElements SET x = ?, y = ? WHERE id = ?', [x, y, id])
}

export async function updateCanvasElementContent(
  id: number,
  content: string,
): Promise<void> {
  await exec('UPDATE canvasElements SET content = ? WHERE id = ?', [content, id])
}

export async function updateCanvasElementColor(
  id: number,
  color: string,
): Promise<void> {
  await exec('UPDATE canvasElements SET color = ? WHERE id = ?', [color, id])
}

export async function deleteCanvasElement(id: number): Promise<void> {
  // Delete associated connections first
  await exec(
    'DELETE FROM canvasConnections WHERE sourceElementId = ? OR targetElementId = ?',
    [id, id],
  )
  await exec('DELETE FROM canvasElements WHERE id = ?', [id])
}

// Canvas connection CRUD

export async function addCanvasConnection(
  sourceElementId: number,
  targetElementId: number,
  label?: string,
): Promise<CanvasConnection> {
  const id = await insertAndGetId(
    `INSERT INTO canvasConnections (sourceElementId, targetElementId, label)
     VALUES (?, ?, ?)`,
    [sourceElementId, targetElementId, label ?? null],
  )
  return { id, sourceElementId, targetElementId, label: label ?? null }
}

export async function getCanvasConnections(): Promise<CanvasConnection[]> {
  return query<CanvasConnection>('SELECT * FROM canvasConnections ORDER BY id')
}

export async function deleteCanvasConnection(id: number): Promise<void> {
  await exec('DELETE FROM canvasConnections WHERE id = ?', [id])
}

export async function clearCanvas(): Promise<void> {
  await exec('DELETE FROM canvasConnections')
  await exec('DELETE FROM canvasElements')
}
