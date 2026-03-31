// Bloom post-processing for the galactic glow effect

import { EffectComposer, Bloom } from '@react-three/postprocessing'

interface Props {
  intensity?: number
  luminanceThreshold?: number
}

export function PostProcessing({
  intensity = 0.5,
  luminanceThreshold = 0.6,
}: Props) {
  return (
    <EffectComposer>
      <Bloom
        intensity={intensity}
        luminanceThreshold={luminanceThreshold}
        luminanceSmoothing={0.9}
        mipmapBlur
      />
    </EffectComposer>
  )
}
