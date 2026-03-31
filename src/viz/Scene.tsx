// Root R3F Canvas wrapper for the galaxy visualization

import { Canvas } from '@react-three/fiber'
import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

export function Scene({ children }: Props) {
  return (
    <div className="w-full h-[calc(100vh-64px)]" data-testid="galaxy-scene">
      <Canvas
        camera={{ position: [0, 0, 150], fov: 60, near: 0.1, far: 5000 }}
        gl={{ antialias: true, alpha: false }}
        style={{ background: '#0a0e27' }}
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[100, 100, 100]} intensity={0.5} />
        {children}
      </Canvas>
    </div>
  )
}
