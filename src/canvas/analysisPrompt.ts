import type { CanvasElement, CanvasConnection } from '../types'

export function buildCanvasAnalysisPrompt(
  elements: CanvasElement[],
  connections: CanvasConnection[],
): { role: string; content: string }[] {
  const elementLines = elements.map((el) => {
    const label = el.content || 'untitled'
    return `- [${el.type}] "${label}" at (${Math.round(el.x)}, ${Math.round(el.y)})`
  })

  const connectionLines = connections
    .map((conn) => {
      const src = elements.find((el) => el.id === conn.sourceElementId)
      const tgt = elements.find((el) => el.id === conn.targetElementId)
      if (!src || !tgt) return null
      const srcLabel = src.content || 'untitled'
      const tgtLabel = tgt.content || 'untitled'
      const label = conn.label ? ` (${conn.label})` : ''
      return `- "${srcLabel}" -> "${tgtLabel}"${label}`
    })
    .filter(Boolean)

  let userContent = `Canvas contains ${elements.length} element(s):\n${elementLines.join('\n')}`

  if (connectionLines.length > 0) {
    userContent += `\n\nConnections:\n${connectionLines.join('\n')}`
  }

  userContent += '\n\nAnalyze the patterns, themes, and relationships visible in this arrangement. Suggest connections or insights the user may not have noticed.'

  return [
    {
      role: 'system',
      content: 'You are a narrative analysis assistant. The user has arranged narrative elements on a canvas. Analyze the relationships and patterns between works, tropes, and notes. Be concise.',
    },
    {
      role: 'user',
      content: userContent,
    },
  ]
}

export function computePlacementPosition(
  elements: CanvasElement[],
): { x: number; y: number } {
  if (elements.length === 0) return { x: 100, y: 100 }

  let maxRight = -Infinity
  let avgY = 0

  for (const el of elements) {
    const right = el.x + el.width
    if (right > maxRight) maxRight = right
    avgY += el.y
  }
  avgY /= elements.length

  return { x: maxRight + 40, y: Math.round(avgY) }
}
