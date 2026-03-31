// Small emissive particles that travel along graph edges

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Points } from 'three'
import type { GraphLink, GraphNode } from './types'

interface Props {
  links: GraphLink[]
  nodeMap: Map<string, GraphNode>
  particleCount?: number
}

interface Particle {
  edgeIndex: number
  t: number
  speed: number
}

export function EdgeParticles({ links, nodeMap, particleCount = 200 }: Props) {
  const pointsRef = useRef<Points>(null)

  // Initialize particles assigned to random edges
  const particles = useMemo(() => {
    if (links.length === 0) return []
    return Array.from({ length: Math.min(particleCount, links.length * 3) }, () => ({
      edgeIndex: Math.floor(Math.random() * links.length),
      t: Math.random(),
      speed: 0.002 + Math.random() * 0.003,
    })) as Particle[]
  }, [links.length, particleCount])

  const positions = useMemo(
    () => new Float32Array(particles.length * 3),
    [particles.length],
  )

  useFrame(() => {
    if (!pointsRef.current || particles.length === 0) return

    for (let i = 0; i < particles.length; i++) {
      const particle = particles[i]
      const link = links[particle.edgeIndex]
      if (!link) continue

      const source = nodeMap.get(link.source)
      const target = nodeMap.get(link.target)
      if (!source || !target) continue

      // Advance along the edge
      particle.t += particle.speed * link.weight
      if (particle.t > 1) {
        particle.t = 0
        particle.edgeIndex = Math.floor(Math.random() * links.length)
      }

      // Lerp position
      const t = particle.t
      positions[i * 3] = (source.x ?? 0) + ((target.x ?? 0) - (source.x ?? 0)) * t
      positions[i * 3 + 1] = (source.y ?? 0) + ((target.y ?? 0) - (source.y ?? 0)) * t
      positions[i * 3 + 2] = (source.z ?? 0) + ((target.z ?? 0) - (source.z ?? 0)) * t
    }

    const posAttr = pointsRef.current.geometry.getAttribute('position')
    if (posAttr) {
      posAttr.needsUpdate = true
    }
  })

  if (particles.length === 0) return null

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.5}
        color="#06b6d4"
        transparent
        opacity={0.7}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  )
}
