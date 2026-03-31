// Background starfield with 3 depth layers of particle points

import { useMemo } from 'react'

interface Props {
  count?: number
  radius?: number
}

function generateStarPositions(count: number, radius: number): Float32Array {
  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    // Uniform distribution within a sphere
    const r = radius * Math.cbrt(Math.random())
    const theta = Math.random() * 2 * Math.PI
    const phi = Math.acos(2 * Math.random() - 1)
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
    positions[i * 3 + 2] = r * Math.cos(phi)
  }
  return positions
}

interface StarLayerProps {
  positions: Float32Array
  size: number
  opacity: number
}

function StarLayer({ positions, size, opacity }: StarLayerProps) {
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={size}
        color="#f8fafc"
        transparent
        opacity={opacity}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  )
}

export function Starfield({ count = 50000, radius = 2000 }: Props) {
  const layers = useMemo(() => {
    // 3 depth layers with different counts and sizes
    const layerDistribution = [0.6, 0.3, 0.1]
    const layerSizes = [0.3, 0.6, 1.2]
    const layerOpacities = [0.25, 0.4, 0.6]

    return layerDistribution.map((fraction, i) => {
      const layerCount = Math.floor(count * fraction)
      return {
        positions: generateStarPositions(layerCount, radius * (1 - i * 0.2)),
        size: layerSizes[i],
        opacity: layerOpacities[i],
      }
    })
  }, [count, radius])

  return (
    <group>
      {layers.map((layer, i) => (
        <StarLayer key={i} {...layer} />
      ))}
    </group>
  )
}

// Export for testing
export { generateStarPositions }
