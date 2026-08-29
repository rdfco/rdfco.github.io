import { siteData } from '../../content/site-data.js'
import { validateSiteData } from '../../content/validate-site-content.js'
import { applySiteData } from '../site/apply-site.js'
import { getNavigationItem } from '../navigation/navigation-items.js'
import { setupNavigationEvents } from '../navigation/navigation-events.js'
import { prepareLegacyGsap, silenceLegacyGsapTargetWarnings } from './legacy-gsap.js'
import { publishLenis } from './lenis.js'
import { setupMenuStateSync } from './menu-bridge.js'
import { setActiveNavigationRoute, syncActiveNavigationWithScroll } from './navigation-sync.js'
import { waitForVisualReadiness } from './readiness.js'
import { normalizeRoute } from './routes.js'
import { setSceneRunning } from './scene.js'
import { holdAtTop, jumpToTop, refreshScrollSystems, resetHomeScrollState, setupInputHandoff, stopSectionScroll } from './scroll.js'
import { consumePendingSectionRoute, revealThenScrollToSection, setupSectionRouteLinks } from './section-routes.js'
import { armShellSignal, receiveShellSignal } from './shell-signals.js'
import '../styles/route-pages.css'
import '../styles/content-pages.css'

validateSiteData(siteData)
silenceLegacyGsapTargetWarnings()

if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual'

let requestedPath = null
let appliedPath = null
let applyingRoute = false

const normalizePhoneNumbers = () => {
  document.querySelectorAll('a[href^="tel:"]').forEach(link => {
    link.href = 'tel:02188220629'
    link.textContent = '02188220629'
  })
}

const getCurrentPage = async (path, navigationItem) => {
  const cleanPath = (path || '/').split('?')[0]
  if (cleanPath === '/' && navigationItem.key === 'home') {
    return {
      data: {
        key: 'home',
        href: navigationItem.href,
      },
    }
  }

  const { getPageForPath } = await import('../pages/registry.js')
  const currentPage = getPageForPath(path, navigationItem.key)
  currentPage.data.href ||= navigationItem.href
  return currentPage
}

// Tagged with the route it answers. The shell used to accept any ready at all,
// so a ready left over from the previous route could lift the gate over a page
// that had not been rendered yet.
const postReady = () => {
  window.parent.postMessage({ type: 'fara:ready', pathname: appliedPath }, window.location.origin)
}

const refreshSite = async () => {
  if (requestedPath === appliedPath && document.documentElement.dataset.faraReady === 'true') {
    // The shell keeps polling until it hears back, so an already-applied route
    // still has to answer or its loading gate never lifts - but never while the
    // route is still settling, or the gate would lift over an unfinished page.
    if (!applyingRoute) postReady()
    return
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', refreshSite, { once: true })
    return
  }
  // One application at a time. The shell can post a new route while the last
  // one is still rendering, and two passes writing the same document is what
  // tears the page apart - a footer landing in the middle of another page.
  // Whatever arrived during the run is picked up at the end of it.
  if (applyingRoute) return
  const isFirstApplication = appliedPath === null
  appliedPath = requestedPath
  applyingRoute = true
  window.dispatchEvent(new CustomEvent('fara:close-menu'))
  const navigationItem = getNavigationItem(requestedPath || '/')
  const currentPage = await getCurrentPage(requestedPath || '/', navigationItem)
  setSceneRunning(currentPage.data.key === 'home')
  stopSectionScroll()
  if (currentPage.data.key === 'home') resetHomeScrollState()
  else jumpToTop()
  await applySiteData(siteData, currentPage)
  normalizePhoneNumbers()
  setupSectionRouteLinks()
  await waitForVisualReadiness(currentPage.data.key)
  const header = document.querySelector('#header')
  header?.classList.remove('top', 'fade')
  if (header && requestedPath === '/') header.dataset.theme = 'light'
  window.requestAnimationFrame(() => {
    header?.classList.remove('top', 'fade')
    refreshScrollSystems()
    window.requestAnimationFrame(() => {
      refreshScrollSystems()
    })
  })
  // Route returns still need the full hold: their legacy timelines can restore
  // an old offset while the gate is up. The first Home application has no old
  // route or scroll position to restore, and its WebGL warm-up already ends at
  // the top with settled frames, so adding another 900ms only extends loading.
  if (!isFirstApplication || currentPage.data.key !== 'home') await holdAtTop(900)
  applyingRoute = false
  if (requestedPath !== null) {
    document.documentElement.dataset.faraReady = 'true'
    armShellSignal('fara:revealed')
    postReady()
    const queuedSection = consumePendingSectionRoute()
    if (currentPage.data.key !== 'home') {
      setActiveNavigationRoute(currentPage.data.href)
    } else if (queuedSection && queuedSection !== '/') {
      revealThenScrollToSection(queuedSection)
    } else {
      // The page has already been stabilized for 900ms before readiness. A
      // second post-reveal hold used to fight the visitor's first wheel input
      // for another 600ms, which was the visible top-of-page scroll freeze.
      syncActiveNavigationWithScroll()
    }
  }
  // A route that arrived mid-render was refused above rather than run on top of
  // this one; it gets its turn now.
  if (requestedPath !== appliedPath) refreshSite()
}

window.addEventListener('message', event => {
  if (event.origin !== window.location.origin) return
  if (event.data?.type === 'fara:revealed') {
    receiveShellSignal(event.data.type)
    return
  }
  if (event.data?.type !== 'fara:set-route') return
  requestedPath = normalizeRoute(event.data.pathname || '/')
  refreshSite()
})

setupNavigationEvents()
prepareLegacyGsap()
publishLenis()
setupInputHandoff()
setupMenuStateSync()
setupSectionRouteLinks()
window.addEventListener('scroll', syncActiveNavigationWithScroll, { passive: true })
window.addEventListener('resize', syncActiveNavigationWithScroll, { passive: true })
document.addEventListener('astro:page-load', () => {
  if (requestedPath !== null) refreshSite()
})
