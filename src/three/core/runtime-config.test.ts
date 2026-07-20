import { describe, expect, it } from 'vitest'
import { defaultPerformanceTier, getQualityTier, qualityTiers } from '../performance'
import { threeRuntimeConfig } from './runtime-config'

describe('Three.js runtime foundation', () => {
  it('preserves the M0 Canvas contract', () => {
    expect(threeRuntimeConfig.camera).toEqual({ fov: 35, near: 0.1, far: 1000 })
    expect(threeRuntimeConfig.dpr).toEqual([1, 1.75])
    expect(threeRuntimeConfig.renderer).toEqual({
      antialias: true,
      powerPreference: 'high-performance',
    })
    expect(threeRuntimeConfig).toMatchObject({
      preloadAll: true,
      adaptiveDpr: true,
      pixelatedDprTransitions: true,
    })
  })

  it('defines every performance tier without changing the active tier', () => {
    expect(Object.keys(qualityTiers)).toEqual(['high', 'medium', 'low', 'fallback'])
    expect(defaultPerformanceTier).toBe('high')
    expect(getQualityTier(defaultPerformanceTier)).toBe(qualityTiers.high)
  })

  it('keeps DPR ranges ordered and bounded', () => {
    Object.values(qualityTiers).forEach(({ dpr }) => {
      expect(dpr[0]).toBeGreaterThan(0)
      expect(dpr[1]).toBeGreaterThanOrEqual(dpr[0])
      expect(dpr[1]).toBeLessThanOrEqual(2)
    })
  })
})
