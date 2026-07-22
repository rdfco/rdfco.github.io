export const appConfig = {
  routes: {
    legacy: [
      '/',
      '/knowing-fara',
      '/solution',
      '/consulting',
      '/industries',
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
    iframeSource: '/legacy/fort-energy/index.html',
    iframeTitle: 'FARA',
    sandbox: 'allow-scripts allow-same-origin',
    readyTimeoutMs: 5000,
    readyPollMs: 50,
    delayedFooterSyncMs: 1000,
    routeMessage: 'fara:set-route',
    navigationMessage: 'fara:navigate',
    readyMessage: 'fara:ready',
  },
} as const

export type AppConfig = typeof appConfig
