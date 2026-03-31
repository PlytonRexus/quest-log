// Camera controls wrapper with orbit, autoRotate, and damping

import { OrbitControls } from '@react-three/drei'

interface Props {
  autoRotate?: boolean
  enableDamping?: boolean
}

export function CameraControls({ autoRotate = true, enableDamping = true }: Props) {
  return (
    <OrbitControls
      autoRotate={autoRotate}
      autoRotateSpeed={0.3}
      enableDamping={enableDamping}
      dampingFactor={0.05}
      minDistance={20}
      maxDistance={500}
    />
  )
}
