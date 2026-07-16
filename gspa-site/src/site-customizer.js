import { siteData } from './data/siteData.js'
import { validateSiteData } from './data/validateSiteData.js'
import { applySiteData } from './js/apply-site.js'
import { getNavigationItem } from './navbar/navigation.js'
import { getPage } from './navbar/pages/registry.js'
import { setupNavigationEvents } from './navbar/navigation-events.js'

validateSiteData(siteData)

let requestedPath = null

const refreshSite = () => {
  const navigationItem = getNavigationItem(requestedPath || '/')
  const currentPage = getPage(navigationItem.key)
  currentPage.data.href = navigationItem.href
  applySiteData(siteData, currentPage)
  if (requestedPath !== null) document.documentElement.dataset.faraReady = 'true'
  window.setTimeout(() => applySiteData(siteData, currentPage), 150)
  window.setTimeout(() => applySiteData(siteData, currentPage), 800)
}

window.addEventListener('message', event => {
  if (event.origin !== window.location.origin || event.data?.type !== 'fara:set-route') return
  requestedPath = event.data.pathname || '/'
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
