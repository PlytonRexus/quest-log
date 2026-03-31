import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPluginAPI, PermissionError } from '../PluginAPI'
import { getOverlay, resetOverlay } from '../graphOverlay'
import type { PluginEventType } from '../types'

// Mock DAL
vi.mock('../../db/dal', () => ({
  getWorks: vi.fn().mockResolvedValue([{ id: 1, title: 'Test' }]),
  getTropes: vi.fn().mockResolvedValue([]),
  getDimensionScoresForWork: vi.fn().mockResolvedValue([]),
  insertWork: vi.fn().mockResolvedValue({ id: 2 }),
}))

function makeRegistry() {
  return {
    panels: [],
    toolbarButtons: [],
    viewTabs: [],
  }
}

function makeListeners(): Map<PluginEventType, Set<(...args: unknown[]) => void>> {
  return new Map()
}

describe('PluginAPI', () => {
  it('db.read permission allows getWorks()', async () => {
    const api = createPluginAPI('test-plugin', ['db:read'], makeRegistry(), makeListeners())
    const works = await api.db.getWorks()
    expect(works).toHaveLength(1)
  })

  it('plugin without db:read permission throws on getWorks', async () => {
    const api = createPluginAPI('test-plugin', [], makeRegistry(), makeListeners())
    await expect(api.db.getWorks()).rejects.toThrow(PermissionError)
  })

  it('db:write permission enables insertWork', () => {
    const api = createPluginAPI('test-plugin', ['db:write'], makeRegistry(), makeListeners())
    expect(api.db.insertWork).toBeDefined()
  })

  it('without db:write, insertWork is undefined', () => {
    const api = createPluginAPI('test-plugin', ['db:read'], makeRegistry(), makeListeners())
    expect(api.db.insertWork).toBeUndefined()
  })

  it('ui:panel permission allows registerPanel', () => {
    const registry = makeRegistry()
    const api = createPluginAPI('test-plugin', ['ui:panel'], registry, makeListeners())
    api.ui.registerPanel({
      id: 'test-panel',
      title: 'Test',
      component: () => null,
    })
    expect(registry.panels).toHaveLength(1)
  })

  it('without ui:panel permission, registerPanel throws', () => {
    const api = createPluginAPI('test-plugin', ['db:read'], makeRegistry(), makeListeners())
    expect(() =>
      api.ui.registerPanel({ id: 'p', title: 'T', component: () => null }),
    ).toThrow(PermissionError)
  })

  it('events:subscribe permission allows on() listener', () => {
    const listeners = makeListeners()
    const api = createPluginAPI('test-plugin', ['events:subscribe'], makeRegistry(), listeners)
    const handler = vi.fn()
    const unsub = api.events.on('workLogged', handler)
    expect(listeners.get('workLogged')?.size).toBe(1)
    unsub()
    expect(listeners.get('workLogged')?.size).toBe(0)
  })

  it('without events:subscribe, on() throws', () => {
    const api = createPluginAPI('test-plugin', [], makeRegistry(), makeListeners())
    expect(() => api.events.on('workLogged', vi.fn())).toThrow(PermissionError)
  })

  describe('graph:inject', () => {
    beforeEach(() => {
      resetOverlay()
    })

    it('graph:inject permission provides graph API', () => {
      const api = createPluginAPI('gp', ['graph:inject'], makeRegistry(), makeListeners())
      expect(api.graph).toBeDefined()
      expect(api.graph!.injectNodes).toBeInstanceOf(Function)
      expect(api.graph!.injectLinks).toBeInstanceOf(Function)
      expect(api.graph!.removeNodes).toBeInstanceOf(Function)
      expect(api.graph!.removeLinks).toBeInstanceOf(Function)
    })

    it('without graph:inject, graph is undefined', () => {
      const api = createPluginAPI('nogp', ['db:read'], makeRegistry(), makeListeners())
      expect(api.graph).toBeUndefined()
    })

    it('injectNodes adds nodes to the overlay store', () => {
      const api = createPluginAPI('gp', ['graph:inject'], makeRegistry(), makeListeners())
      api.graph!.injectNodes([
        { id: 'n1', kind: 'work', label: 'Test', color: '#fff', size: 1, entityId: 0 },
      ])
      const overlay = getOverlay()
      expect(overlay.nodes).toHaveLength(1)
      expect(overlay.nodes[0].id).toBe('gp:n1')
    })

    it('removeNodes removes from overlay store', () => {
      const api = createPluginAPI('gp', ['graph:inject'], makeRegistry(), makeListeners())
      api.graph!.injectNodes([
        { id: 'n1', kind: 'work', label: 'Test', color: '#fff', size: 1, entityId: 0 },
      ])
      api.graph!.removeNodes(['n1'])
      const overlay = getOverlay()
      expect(overlay.nodes).toHaveLength(0)
    })
  })
})
