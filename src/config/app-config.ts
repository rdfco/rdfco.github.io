export const appConfig = {
  routes: {
    legacy: [
      '/',
      // '/who-we-are',
      // '/how-we-help',
      // '/who-we-serve',
      '/think-together',
      '/privacy-policy',
      '/terms-of-use',
      '/news',
      '/news/:slug',
    ],
    fallback: '/',
  },
  legacyRuntime: {
    iframeSource:
      '/legacy/main/index.html?v=responsive-scroll-20260828-1',
    iframeTitle: 'FARA',
    sandbox: undefined,
    readyTimeoutMs: 5000,
    readyPollMs: 250,
    delayedFooterSyncMs: 1000,
    routeMessage: 'fara:set-route',
    navigationMessage: 'fara:navigate',
    readyMessage: 'fara:ready',
    criticalSceneAsset: '/assets/models/energy/energy-chapter.glb',
  },
} as const

export type AppConfig = typeof appConfig
