export const appConfig = {
  routes: {
    legacy: [
      '/',
      '/who-we-are',
      '/solution',
      '/how-we-help',
      '/who-we-serve',
      '/case-studies',
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
      '/legacy/fort-energy/index.html?v=oil-bg-sync-20260801-1',
    iframeTitle: 'FARA',
    sandbox: 'allow-scripts allow-same-origin',
    readyTimeoutMs: 5000,
    readyPollMs: 50,
    delayedFooterSyncMs: 1000,
    routeMessage: 'fara:set-route',
    navigationMessage: 'fara:navigate',
    readyMessage: 'fara:ready',
    criticalSceneAsset: '/assets/models/fort-energy/energy-chapter.glb',
  },
} as const

export type AppConfig = typeof appConfig
