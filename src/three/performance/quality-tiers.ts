import type { DprRange, PerformanceTier } from '../types'

export type QualityTierDefinition = {
  dpr: DprRange
  antialias: boolean
  adaptiveDpr: boolean
}

export const defaultPerformanceTier: PerformanceTier = 'high'

export type PerformanceCapabilities = {
  deviceMemoryGb?: number
  hardwareConcurrency?: number
  webglSupported?: boolean
}

export const qualityTiers = {
  high: { dpr: [1, 1.75], antialias: true, adaptiveDpr: true },
  medium: { dpr: [1, 1.5], antialias: true, adaptiveDpr: true },
  low: { dpr: [1, 1.25], antialias: false, adaptiveDpr: true },
  fallback: { dpr: [1, 1], antialias: false, adaptiveDpr: false },
} satisfies Record<PerformanceTier, QualityTierDefinition>

export function getQualityTier(tier: PerformanceTier): QualityTierDefinition {
  return qualityTiers[tier]
}

export function selectPerformanceTier({
  deviceMemoryGb,
  hardwareConcurrency,
  webglSupported = true,
}: PerformanceCapabilities): PerformanceTier {
  if (!webglSupported) return 'fallback'
  if (deviceMemoryGb !== undefined && deviceMemoryGb <= 2) return 'low'
  if (hardwareConcurrency !== undefined && hardwareConcurrency <= 2 && deviceMemoryGb !== undefined) return 'low'
  if (deviceMemoryGb !== undefined && deviceMemoryGb <= 4) return 'medium'
  if (hardwareConcurrency !== undefined && hardwareConcurrency <= 4 && deviceMemoryGb !== undefined) return 'medium'
  return defaultPerformanceTier
}

export function detectPerformanceTier(): PerformanceTier {
  if (typeof navigator === 'undefined') return defaultPerformanceTier
  const browserNavigator = navigator as Navigator & { deviceMemory?: number }
  return selectPerformanceTier({
    deviceMemoryGb: browserNavigator.deviceMemory,
    hardwareConcurrency: browserNavigator.hardwareConcurrency,
  })
}

export const initialPerformanceTier = detectPerformanceTier()
