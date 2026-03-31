// Decorative nebula clouds using transparent planes with animated opacity

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Mesh } from 'three'

interface NebulaCloudProps {
  position: [number, number, number]
  rotation: [number, number, number]
  color: string
  scale: number
}

function NebulaCloud({ position, rotation, color, scale }: NebulaCloudProps) {
  const meshRef = useRef<Mesh>(null)

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    // Slow pulsing opacity
    const t = clock.getElapsedTime()
    const mat = meshRef.current.material
    if (mat && 'opacity' in mat) {
      (mat as { opacity: number }).opacity = 0.03 + Math.sin(t * 0.2) * 0.01
    }
    // Slow rotation
    meshRef.current.rotation.z += 0.0001
  })

  return (
    <mesh ref={meshRef} position={position} rotation={rotation} scale={scale}>
      <planeGeometry args={[100, 100]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.04}
        depthWrite={false}
        side={2}
      />
    </mesh>
  )
}

export function Nebula() {
  const clouds = useMemo(() => [
    { position: [-200, 50, -300] as [number, number, number], rotation: [0.2, 0.5, 0] as [number, number, number], color: '#6b21a8', scale: 3.5 },
    { position: [250, -80, -250] as [number, number, number], rotation: [-0.3, 0.8, 0.1] as [number, number, number], color: '#1e3a5f', scale: 4.0 },
    { position: [0, 120, -400] as [number, number, number], rotation: [0.1, -0.4, 0.3] as [number, number, number], color: '#0e4d6e', scale: 3.0 },
    { position: [-150, -100, -350] as [number, number, number], rotation: [-0.2, 0.3, -0.1] as [number, number, number], color: '#4a1a6b', scale: 2.5 },
  ], [])

  return (
    <group>
      {clouds.map((cloud, i) => (
        <NebulaCloud key={i} {...cloud} />
      ))}
    </group>
  )
}
