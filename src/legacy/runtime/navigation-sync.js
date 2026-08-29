import { getLinkRoute, routeSelector, sectionRoutes } from './routes.js'
import { scrollState } from './scroll-state.js'

// Which navigation entry reads as active: both while a route is applied and
// while the visitor scrolls the home page past each section.

let activeScrollRoute = '/'

let activeNavFrame = 0

export const setActiveNavigationRoute = route => {
  if (activeScrollRoute === route) return
  activeScrollRoute = route
  document.querySelectorAll('[data-fara-route], [data-fara-section-route]').forEach(link => {
    link.classList.toggle('active', getLinkRoute(link) === route)
  })
  const headerLink = document.querySelector(`#header .menu-links-w .nav-link:is(${routeSelector(route)})`)
  if (headerLink) {
    window.dispatchEvent(new CustomEvent('fara:animate-navbar-route', {
      detail: { link: headerLink, complete: () => {} },
    }))
  }
}

export const syncActiveNavigationWithScroll = () => {
  if (scrollState.programmaticSectionScroll) return
  if (document.body.dataset.faraPage !== 'home') return
  window.cancelAnimationFrame(activeNavFrame)
  activeNavFrame = window.requestAnimationFrame(() => {
    const marker = window.scrollY + window.innerHeight * .42
    let route = '/'
    sectionRoutes.forEach((selector, candidateRoute) => {
      const section = document.querySelector(selector)
      if (!section) return
      const top = section.getBoundingClientRect().top + window.scrollY
      if (marker >= top) route = candidateRoute
    })
    setActiveNavigationRoute(route)
  })
}
