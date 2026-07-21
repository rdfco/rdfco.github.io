import { getQualityTier, initialPerformanceTier } from '../performance'
import type { PerformanceTier, ThreeRuntimeConfig } from '../types'

export function createThreeRuntimeConfig(performanceTier: PerformanceTier): ThreeRuntimeConfig {
  const quality = getQualityTier(performanceTier)
  return {
    camera: { fov: 35, near: 0.1, far: 1000 },
    dpr: quality.dpr,
    renderer: { antialias: quality.antialias, powerPreference: 'high-performance' },
    preloadAll: true,
    adaptiveDpr: quality.adaptiveDpr,
    pixelatedDprTransitions: true,
  }
}

export const threeRuntimeConfig = createThreeRuntimeConfig(initialPerformanceTier)
