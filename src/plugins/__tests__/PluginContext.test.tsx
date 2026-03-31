import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PluginProvider, usePlugins } from '../PluginContext'
import type { PortalPlugin } from '../types'

// Mock DAL
vi.mock('../../db/dal', () => ({
  getWorks: vi.fn().mockResolvedValue([]),
  getTropes: vi.fn().mockResolvedValue([]),
  getDimensionScoresForWork: vi.fn().mockResolvedValue([]),
  insertWork: vi.fn().mockResolvedValue({ id: 1 }),
}))

function makePlugin(overrides?: Partial<PortalPlugin>): PortalPlugin {
  return {
    id: 'test-plugin',
    name: 'Test Plugin',
    version: '1.0.0',
    description: 'A test plugin',
    permissions: ['db:read'],
    activate: vi.fn(),
    deactivate: vi.fn(),
    ...overrides,
  }
}

function TestConsumer() {
  const { state, register, unregister, listPlugins, getPlugin } = usePlugins()
  return (
    <div>
      <span data-testid="count">{state.plugins.length}</span>
      <span data-testid="list">{listPlugins().map((p) => p.id).join(',')}</span>
      <span data-testid="get">{getPlugin('test-plugin')?.name ?? 'none'}</span>
      <button data-testid="register" onClick={() => register(makePlugin())} />
      <button data-testid="unregister" onClick={() => unregister('test-plugin')} />
    </div>
  )
}

describe('PluginContext', () => {
  it('register() adds plugin to list', () => {
    render(
      <PluginProvider>
        <TestConsumer />
      </PluginProvider>,
    )
    expect(screen.getByTestId('count').textContent).toBe('0')
    fireEvent.click(screen.getByTestId('register'))
    expect(screen.getByTestId('count').textContent).toBe('1')
  })

  it('unregister() removes plugin from list', () => {
    render(
      <PluginProvider>
        <TestConsumer />
      </PluginProvider>,
    )
    fireEvent.click(screen.getByTestId('register'))
    expect(screen.getByTestId('count').textContent).toBe('1')
    fireEvent.click(screen.getByTestId('unregister'))
    expect(screen.getByTestId('count').textContent).toBe('0')
  })

  it('listPlugins() returns all registered plugins', () => {
    render(
      <PluginProvider>
        <TestConsumer />
      </PluginProvider>,
    )
    fireEvent.click(screen.getByTestId('register'))
    expect(screen.getByTestId('list').textContent).toBe('test-plugin')
  })

  it('getPlugin(id) returns correct plugin', () => {
    render(
      <PluginProvider>
        <TestConsumer />
      </PluginProvider>,
    )
    expect(screen.getByTestId('get').textContent).toBe('none')
    fireEvent.click(screen.getByTestId('register'))
    expect(screen.getByTestId('get').textContent).toBe('Test Plugin')
  })
})
