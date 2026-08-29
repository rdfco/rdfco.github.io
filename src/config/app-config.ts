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
    // Older public URLs, and the three section labels that used to be pages of
    // their own. Followed as a chain: /knowing-fara -> /who-we-are -> /. The
    // router redirects these, and `resolveInitialRoute` follows the same chain
    // before the first render so a deep link never hydrates against markup the
    // router is about to replace.
    redirects: {
      '/knowing-fara': '/who-we-are',
      '/consulting': '/how-we-help',
      '/industries': '/who-we-serve',
      '/who-we-are': '/',
      '/how-we-help': '/',
      '/who-we-serve': '/',
    },
    fallback: '/',
  },
  legacyRuntime: {
    iframeSource:
      '/legacy/main/index.html?v=loading-smooth-20260829-1',
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
