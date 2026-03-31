import type { PortalPlugin, PluginPermission } from './types'

const VALID_PERMISSIONS: Set<string> = new Set<PluginPermission>([
  'db:read',
  'db:write',
  'graph:inject',
  'ui:panel',
  'events:subscribe',
])

export function validatePlugin(module: Record<string, unknown>): PortalPlugin {
  const plugin = (module.default ?? module.plugin ?? module) as Record<string, unknown>

  const required = ['id', 'name', 'version', 'permissions', 'activate', 'deactivate'] as const
  for (const field of required) {
    if (!(field in plugin)) {
      throw new Error(`Plugin missing required field: ${field}`)
    }
  }

  if (typeof plugin.activate !== 'function') {
    throw new Error('Plugin activate must be a function')
  }
  if (typeof plugin.deactivate !== 'function') {
    throw new Error('Plugin deactivate must be a function')
  }

  const permissions = plugin.permissions as string[]
  if (!Array.isArray(permissions)) {
    throw new Error('Plugin permissions must be an array')
  }

  // Filter to known permissions only
  const sanitized = permissions.filter((p) => VALID_PERMISSIONS.has(p))

  return {
    ...plugin,
    permissions: sanitized as PluginPermission[],
  } as PortalPlugin
}
