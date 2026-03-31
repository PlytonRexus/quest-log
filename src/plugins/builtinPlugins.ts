import { letterboxdPlugin } from './letterboxd'
import { radarChartPlugin } from './radarChart'
import { tasteTimelinePlugin } from './tasteTimeline'
import type { PortalPlugin } from './types'

export const BUILTIN_PLUGINS: PortalPlugin[] = [
  letterboxdPlugin,
  radarChartPlugin,
  tasteTimelinePlugin,
]
