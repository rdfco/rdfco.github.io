import type { ColorRepresentation, WebGLRendererParameters } from 'three'

export type DprRange = [minimum: number, maximum: number]
export type FogDefinition = [color: ColorRepresentation, near: number, far: number]

export type PerspectiveCameraDefinition = {
  fov: number
  near: number
  far: number
}

export type ThreeRuntimeConfig = {
  camera: PerspectiveCameraDefinition
  dpr: DprRange
  renderer: WebGLRendererParameters
  preloadAll: boolean
  adaptiveDpr: boolean
  pixelatedDprTransitions: boolean
}

export type PerformanceTier = 'high' | 'medium' | 'low' | 'fallback'
