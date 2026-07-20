import type { DprRange, PerformanceTier } from '../types'

export type QualityTierDefinition = {
  dpr: DprRange
  antialias: boolean
  adaptiveDpr: boolean
}

export const defaultPerformanceTier: PerformanceTier = 'high'

export const qualityTiers = {
  high: { dpr: [1, 1.75], antialias: true, adaptiveDpr: true },
  medium: { dpr: [1, 1.5], antialias: true, adaptiveDpr: true },
  low: { dpr: [1, 1.25], antialias: false, adaptiveDpr: true },
  fallback: { dpr: [1, 1], antialias: false, adaptiveDpr: false },
} satisfies Record<PerformanceTier, QualityTierDefinition>

export function getQualityTier(tier: PerformanceTier): QualityTierDefinition {
  return qualityTiers[tier]
}
