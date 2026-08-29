export { normalizeRoute } from '../../config/normalize-route.js'

// Route tables shared by the scroll, navigation and section-link modules.

export const sectionRoutes = new Map([
  ['/who-we-are', '.fara-about'],
  ['/how-we-help', '.fara-solutions'],
  ['/who-we-serve', '.fara-industries'],
])

export const animatedHomeRoutes = new Set(['/'])

export const routeSelector = route => `[data-fara-route="${route}"], [data-fara-section-route="${route}"]`

export const getLinkRoute = link => link?.dataset.faraSectionRoute || link?.dataset.faraRoute || ''
