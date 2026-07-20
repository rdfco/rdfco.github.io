import { AdaptiveDpr, Preload } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Suspense, type PropsWithChildren } from 'react'
import type { ColorRepresentation } from 'three'
import type { FogDefinition } from '../types'
import { threeRuntimeConfig } from './runtime-config'

type ThreeCanvasProps = PropsWithChildren<{
  background: ColorRepresentation
  fog: FogDefinition
}>

export function ThreeCanvas({ background, children, fog }: ThreeCanvasProps) {
  return <Canvas
    camera={threeRuntimeConfig.camera}
    dpr={threeRuntimeConfig.dpr}
    gl={threeRuntimeConfig.renderer}
  >
    <color attach="background" args={[background]} />
    <fog attach="fog" args={fog} />
    <Suspense fallback={null}>
      {children}
      {threeRuntimeConfig.preloadAll && <Preload all />}
    </Suspense>
    {threeRuntimeConfig.adaptiveDpr && (
      <AdaptiveDpr pixelated={threeRuntimeConfig.pixelatedDprTransitions} />
    )}
  </Canvas>
}
