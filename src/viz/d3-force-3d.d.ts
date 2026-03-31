declare module 'd3-force-3d' {
  export interface SimulationNode {
    x?: number
    y?: number
    z?: number
    fx?: number | null
    fy?: number | null
    fz?: number | null
    index?: number
  }

  export interface SimulationLink<N extends SimulationNode = SimulationNode> {
    source: N | string | number
    target: N | string | number
    index?: number
  }

  export interface Force<N extends SimulationNode = SimulationNode> {
    (alpha: number): void
  }

  export interface Simulation<N extends SimulationNode = SimulationNode> {
    nodes(): N[]
    nodes(nodes: N[]): this
    force(name: string): Force<N> | undefined
    force(name: string, force: Force<N> | null): this
    tick(iterations?: number): this
    alpha(): number
    alpha(alpha: number): this
    alphaMin(): number
    alphaMin(min: number): this
    alphaDecay(): number
    alphaDecay(decay: number): this
    alphaTarget(): number
    alphaTarget(target: number): this
    stop(): this
    restart(): this
    on(typenames: string, listener: (() => void) | null): this
  }

  export function forceSimulation<N extends SimulationNode>(nodes?: N[]): Simulation<N>

  export function forceLink<N extends SimulationNode, L extends SimulationLink<N>>(
    links?: L[],
  ): ForceLink<N, L>

  export function forceManyBody<N extends SimulationNode>(): ForceManyBody<N>

  export function forceCenter<N extends SimulationNode>(
    x?: number,
    y?: number,
    z?: number,
  ): ForceCenter<N>

  export function forceCollide<N extends SimulationNode>(
    radius?: number | ((node: N) => number),
  ): ForceCollide<N>

  interface ForceLink<N extends SimulationNode, L extends SimulationLink<N>> extends Force<N> {
    links(): L[]
    links(links: L[]): this
    id(id: (node: N) => string | number): this
    distance(distance: number | ((link: L) => number)): this
    strength(strength: number | ((link: L) => number)): this
  }

  interface ForceManyBody<N extends SimulationNode> extends Force<N> {
    strength(): number
    strength(strength: number | ((node: N) => number)): this
    distanceMin(): number
    distanceMin(min: number): this
    distanceMax(): number
    distanceMax(max: number): this
  }

  interface ForceCenter<N extends SimulationNode> extends Force<N> {
    x(): number
    x(x: number): this
    y(): number
    y(y: number): this
    z(): number
    z(z: number): this
    strength(): number
    strength(strength: number): this
  }

  interface ForceCollide<N extends SimulationNode> extends Force<N> {
    radius(): number | ((node: N) => number)
    radius(radius: number | ((node: N) => number)): this
    strength(): number
    strength(strength: number): this
    iterations(): number
    iterations(iterations: number): this
  }
}
