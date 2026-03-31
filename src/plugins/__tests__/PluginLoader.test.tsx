import { describe, it, expect, vi } from 'vitest'
import { validatePlugin } from '../validatePlugin'

describe('PluginLoader', () => {
  describe('validatePlugin', () => {
    it('validates a valid plugin module', () => {
      const module = {
        default: {
          id: 'test',
          name: 'Test Plugin',
          version: '1.0.0',
          description: 'A test plugin',
          permissions: ['db:read'],
          activate: vi.fn(),
          deactivate: vi.fn(),
        },
      }
      const plugin = validatePlugin(module)
      expect(plugin.id).toBe('test')
      expect(plugin.name).toBe('Test Plugin')
      expect(plugin.permissions).toEqual(['db:read'])
    })

    it('throws if required field is missing', () => {
      const module = {
        default: {
          id: 'test',
          name: 'Test',
          // missing version, permissions, activate, deactivate
        },
      }
      expect(() => validatePlugin(module)).toThrow('missing required field')
    })

    it('throws if activate is not a function', () => {
      const module = {
        default: {
          id: 'test',
          name: 'Test',
          version: '1.0.0',
          permissions: [],
          activate: 'not a function',
          deactivate: vi.fn(),
        },
      }
      expect(() => validatePlugin(module)).toThrow('activate must be a function')
    })

    it('filters out unknown permissions', () => {
      const module = {
        default: {
          id: 'test',
          name: 'Test',
          version: '1.0.0',
          permissions: ['db:read', 'unknown:perm', 'graph:inject'],
          activate: vi.fn(),
          deactivate: vi.fn(),
        },
      }
      const plugin = validatePlugin(module)
      expect(plugin.permissions).toEqual(['db:read', 'graph:inject'])
    })

    it('accepts module with plugin export instead of default', () => {
      const module = {
        plugin: {
          id: 'alt',
          name: 'Alt Plugin',
          version: '1.0.0',
          permissions: [],
          activate: vi.fn(),
          deactivate: vi.fn(),
        },
      }
      const plugin = validatePlugin(module)
      expect(plugin.id).toBe('alt')
    })
  })
})
