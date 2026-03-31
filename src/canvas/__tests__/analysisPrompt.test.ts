import { describe, it, expect } from 'vitest'
import { buildCanvasAnalysisPrompt, computePlacementPosition } from '../analysisPrompt'
import type { CanvasElement, CanvasConnection } from '../../types'

function makeElement(overrides: Partial<CanvasElement> = {}): CanvasElement {
  return {
    id: 1,
    type: 'sticky',
    entityId: null,
    x: 100,
    y: 200,
    width: 200,
    height: 120,
    content: 'Test note',
    color: '#F59E0B',
    ...overrides,
  }
}

describe('buildCanvasAnalysisPrompt', () => {
  it('returns system and user messages', () => {
    const elements = [makeElement()]
    const messages = buildCanvasAnalysisPrompt(elements, [])
    expect(messages).toHaveLength(2)
    expect(messages[0].role).toBe('system')
    expect(messages[1].role).toBe('user')
  })

  it('includes element type, content, and position', () => {
    const elements = [
      makeElement({ id: 1, type: 'trope', content: 'Redemption Arc', x: 120, y: 340 }),
      makeElement({ id: 2, type: 'work', content: 'Attack on Titan', x: 450, y: 200 }),
    ]
    const messages = buildCanvasAnalysisPrompt(elements, [])
    const user = messages[1].content
    expect(user).toContain('[trope] "Redemption Arc" at (120, 340)')
    expect(user).toContain('[work] "Attack on Titan" at (450, 200)')
    expect(user).toContain('2 element(s)')
  })

  it('includes connections between elements', () => {
    const elements = [
      makeElement({ id: 1, content: 'A' }),
      makeElement({ id: 2, content: 'B' }),
    ]
    const connections: CanvasConnection[] = [
      { id: 1, sourceElementId: 1, targetElementId: 2, label: 'relates to' },
    ]
    const messages = buildCanvasAnalysisPrompt(elements, connections)
    const user = messages[1].content
    expect(user).toContain('"A" -> "B" (relates to)')
  })

  it('handles empty canvas', () => {
    const messages = buildCanvasAnalysisPrompt([], [])
    expect(messages[1].content).toContain('0 element(s)')
  })

  it('handles untitled elements', () => {
    const elements = [makeElement({ content: null })]
    const messages = buildCanvasAnalysisPrompt(elements, [])
    expect(messages[1].content).toContain('"untitled"')
  })
})

describe('computePlacementPosition', () => {
  it('returns default position for empty elements', () => {
    const pos = computePlacementPosition([])
    expect(pos).toEqual({ x: 100, y: 100 })
  })

  it('places to the right of existing elements', () => {
    const elements = [
      makeElement({ x: 100, y: 200, width: 200 }),
      makeElement({ x: 300, y: 400, width: 200 }),
    ]
    const pos = computePlacementPosition(elements)
    expect(pos.x).toBe(540) // 300 + 200 + 40
    expect(pos.y).toBe(300) // avg of 200 and 400
  })
})
