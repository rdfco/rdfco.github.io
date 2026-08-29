import { waitForMenuClose } from './menu-bridge.js'
import { animatedHomeRoutes, getLinkRoute, sectionRoutes } from './routes.js'
import { holdAtTopWhile, scrollToSectionRoute } from './scroll.js'
import { delay, REVEAL_PAUSE_MS, REVEAL_WAIT_TIMEOUT_MS, waitForShellSignal } from './shell-signals.js'

// Links that address a section of the home document rather than a route of
// their own, and the handover when one is clicked from a routed page.

let pendingSectionRoute = null

// A section route clicked from a routed page is parked here while the shell
// takes the URL back to "/", then picked up once home has been applied.
export const consumePendingSectionRoute = () => {
  const route = pendingSectionRoute
  pendingSectionRoute = null
  return route
}

// Every route into a section ends here: pinned at the top until the shell says
// its gate is gone, then held one more beat so the visitor registers the top of
// the page as a still frame, and only then does the travelling start.
export const revealThenScrollToSection = async route => {
  await holdAtTopWhile(async () => {
    await waitForShellSignal('fara:revealed', REVEAL_WAIT_TIMEOUT_MS)
    await delay(REVEAL_PAUSE_MS)
  })
  scrollToSectionRoute(route)
}

// Section routes live on the home page. From a routed page the parent router
// has to move the URL back to "/" first, otherwise the browser address stays on
// the standalone page and the scroll lands inside it.
export const navigateToSectionRoute = async (route, { closeMenu = false } = {}) => {
  await waitForMenuClose(closeMenu)
  if (document.body.dataset.faraPage !== 'home') {
    pendingSectionRoute = route
    window.parent.postMessage({ type: 'fara:navigate', pathname: '/' }, window.location.origin)
    return
  }
  // Still on the home surface, so the destination is a section of the document
  // already on screen: that is a scroll and nothing else. Covering or resetting
  // here would flash the gate and throw away the position the visitor is
  // reading from.
  window.requestAnimationFrame(() => scrollToSectionRoute(route))
}

export const setupSectionRouteLinks = () => {
  const handleSectionRouteClick = event => {
    if (event.__faraSectionRouteHandled) return
    const link = event.target.closest?.('[data-fara-route], [data-fara-section-route]')
    const route = getLinkRoute(link)
    if (!route || (!sectionRoutes.has(route) && !animatedHomeRoutes.has(route))) return

    event.__faraSectionRouteHandled = true
    event.preventDefault()
    event.stopImmediatePropagation()
    navigateToSectionRoute(route, {
      closeMenu: Boolean(link.closest('.fara-menu')),
    })
  }

  if (document.documentElement.dataset.faraSectionRoutesReady !== 'true') {
    document.documentElement.dataset.faraSectionRoutesReady = 'true'
    window.addEventListener('click', handleSectionRouteClick, true)
    document.addEventListener('click', handleSectionRouteClick, true)
  }

  document.querySelectorAll('[data-fara-route], [data-fara-section-route]').forEach(link => {
    if (link.dataset.faraSectionScrollReady === 'true') return
    const route = getLinkRoute(link)
    if (!sectionRoutes.has(route) && !animatedHomeRoutes.has(route)) return
    link.dataset.faraSectionScrollReady = 'true'
    link.addEventListener('click', handleSectionRouteClick, true)
  })
}
