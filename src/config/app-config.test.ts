import { describe, expect, it } from 'vitest'
import { appConfig, resolveInitialRoute } from '.'

describe('application configuration', () => {
  it('keeps routes deterministic and rollback-safe', () => {
    expect(new Set(appConfig.routes.legacy).size).toBe(appConfig.routes.legacy.length)
    expect(appConfig.routes.legacy).toContain('/')
    expect(appConfig.routes.fallback).toBe('/')
  })

  it('keeps the protected Legacy runtime contract explicit', () => {
    expect(appConfig.legacyRuntime.iframeSource).toBe(
      '/legacy/main/index.html?v=loading-smooth-20260829-1',
    )
    expect(appConfig.legacyRuntime.readyTimeoutMs).toBe(5000)
    expect(appConfig.legacyRuntime.routeMessage).toBe('fara:set-route')
  })
})

describe('initial route resolution', () => {
  it('follows the redirect chain to a route the shell markup can hydrate', () => {
    expect(resolveInitialRoute('/knowing-fara')).toBe('/')
    expect(resolveInitialRoute('/consulting')).toBe('/')
    expect(resolveInitialRoute('/industries')).toBe('/')
    expect(resolveInitialRoute('/who-we-are')).toBe('/')
  })

  it('leaves a route that renders the shell alone', () => {
    expect(resolveInitialRoute('/')).toBe('/')
    expect(resolveInitialRoute('/think-together')).toBe('/think-together')
    expect(resolveInitialRoute('/news')).toBe('/news')
    expect(resolveInitialRoute('/news/fara-insight-01')).toBe('/news/fara-insight-01')
  })

  it('sends anything unknown to the fallback', () => {
    expect(resolveInitialRoute('/does-not-exist')).toBe('/')
    expect(resolveInitialRoute('')).toBe('/')
  })
})
