import { describe, expect, it } from 'vitest'
import { appConfig } from '.'

describe('application configuration', () => {
  it('keeps routes deterministic and rollback-safe', () => {
    expect(new Set(appConfig.routes.legacy).size).toBe(appConfig.routes.legacy.length)
    expect(appConfig.routes.legacy).toContain('/')
    expect(appConfig.routes.fallback).toBe('/')
  })

  it('keeps the protected Legacy runtime contract explicit', () => {
    expect(appConfig.legacyRuntime.iframeSource).toBe('/legacy/fort-energy/index.html')
    expect(appConfig.legacyRuntime.readyTimeoutMs).toBe(5000)
    expect(appConfig.legacyRuntime.routeMessage).toBe('fara:set-route')
  })
})
