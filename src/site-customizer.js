import { siteData } from './data/siteData.js'
import { validateSiteData } from './data/validateSiteData.js'
import { applySiteData } from './js/apply-site.js'
import { getNavigationItem } from './navbar/navigation.js'
import { getPageForPath } from './navbar/pages/registry.js'
import { setupNavigationEvents } from './navbar/navigation-events.js'

validateSiteData(siteData)

let requestedPath = null
let appliedPath = null

const normalizeRoute = value => {
  const [path, query = ''] = value.split('?')
  const normalizedPath = path === '/' ? '/' : path.replace(/\/+$/, '')
  return query ? `${normalizedPath}?${query}` : normalizedPath
}

const refreshScrollSystems = () => {
  window.dispatchEvent(new Event('resize'))
  window.dispatchEvent(new Event('scroll'))
  window.ScrollTrigger?.refresh?.()
  window.lenis?.resize?.()
  window.lenis?.reset?.()
}

const refreshSite = () => {
  if (requestedPath === appliedPath && document.documentElement.dataset.faraReady === 'true') return
  appliedPath = requestedPath
  window.dispatchEvent(new CustomEvent('fara:close-menu'))
  const navigationItem = getNavigationItem(requestedPath || '/')
  const currentPage = getPageForPath(requestedPath || '/', navigationItem.key)
  currentPage.data.href ||= navigationItem.href
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  applySiteData(siteData, currentPage)
  const header = document.querySelector('#header')
  header?.classList.remove('top', 'fade')
  if (header && requestedPath === '/') header.dataset.theme = 'light'
  window.requestAnimationFrame(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    header?.classList.remove('top', 'fade')
    refreshScrollSystems()
    window.requestAnimationFrame(refreshScrollSystems)
  })
  if (requestedPath !== null) {
    document.documentElement.dataset.faraReady = 'true'
    window.parent.postMessage({ type: 'fara:ready' }, window.location.origin)
  }
}

window.addEventListener('message', event => {
  if (event.origin !== window.location.origin || event.data?.type !== 'fara:set-route') return
  requestedPath = normalizeRoute(event.data.pathname || '/')
  refreshSite()
})

// Do not allow retired source-brand links to navigate, even inside the sandboxed frame.
document.addEventListener('click', event => {
  const link = event.target.closest?.('a[href]')
  if (!link) return
  const href = link.getAttribute('href') || ''
  if (/mont-fort\.com|fortenergy\.com/i.test(href)) event.preventDefault()
}, true)

setupNavigationEvents()
document.addEventListener('astro:page-load', () => {
  if (requestedPath !== null) refreshSite()
})
