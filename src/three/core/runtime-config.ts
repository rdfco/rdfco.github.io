import { defaultPerformanceTier, getQualityTier } from '../performance'
import type { ThreeRuntimeConfig } from '../types'

const activeQuality = getQualityTier(defaultPerformanceTier)

export const threeRuntimeConfig = {
  camera: {
    fov: 35,
    near: 0.1,
    far: 1000,
  },
  dpr: activeQuality.dpr,
  renderer: {
    antialias: activeQuality.antialias,
    powerPreference: 'high-performance',
  },
  preloadAll: true,
  adaptiveDpr: activeQuality.adaptiveDpr,
  pixelatedDprTransitions: true,
} satisfies ThreeRuntimeConfig
