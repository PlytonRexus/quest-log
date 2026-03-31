// In-memory store for plugin-injected graph nodes and links.
// Keyed by pluginId to allow clean removal when a plugin is deactivated.

import type { GraphNode, GraphLink } from '../viz/types'

type ChangeListener = () => void

const overlayNodes = new Map<string, GraphNode>()
const overlayLinks: GraphLink[] = []
const listeners = new Set<ChangeListener>()

function notify() {
  for (const listener of listeners) {
    listener()
  }
}

function makeKey(pluginId: string, nodeId: string): string {
  return `${pluginId}:${nodeId}`
}

export function addOverlayNodes(pluginId: string, nodes: GraphNode[]) {
  for (const node of nodes) {
    overlayNodes.set(makeKey(pluginId, node.id), {
      ...node,
      id: makeKey(pluginId, node.id),
    })
  }
  notify()
}

export function addOverlayLinks(pluginId: string, links: GraphLink[]) {
  for (const link of links) {
    overlayLinks.push({
      ...link,
      source: makeKey(pluginId, link.source),
      target: makeKey(pluginId, link.target),
    })
  }
  notify()
}

export function removeOverlayNodes(pluginId: string, nodeIds: string[]) {
  for (const nodeId of nodeIds) {
    overlayNodes.delete(makeKey(pluginId, nodeId))
  }
  notify()
}

export function removeOverlayLinks(pluginId: string, nodeIds: string[]) {
  const keysToRemove = new Set(nodeIds.map((id) => makeKey(pluginId, id)))
  for (let i = overlayLinks.length - 1; i >= 0; i--) {
    const link = overlayLinks[i]
    if (keysToRemove.has(link.source) || keysToRemove.has(link.target)) {
      overlayLinks.splice(i, 1)
    }
  }
  notify()
}

export function getOverlay(): { nodes: GraphNode[]; links: GraphLink[] } {
  return {
    nodes: Array.from(overlayNodes.values()),
    links: [...overlayLinks],
  }
}

export function onOverlayChange(listener: ChangeListener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

// Reset for testing
export function resetOverlay() {
  overlayNodes.clear()
  overlayLinks.length = 0
}
