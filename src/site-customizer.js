import { siteData } from './data/siteData.js'
import { validateSiteData } from './data/validateSiteData.js'
import { applySiteData } from './js/apply-site.js'
import { getNavigationItem } from './navbar/navigation.js'
import { setupNavigationEvents } from './navbar/navigation-events.js'
import './styles/route-pages.css'
import './styles/content-pages.css'

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

const resetHomeScrollState = () => {
  document.documentElement.scrollTop = 0
  document.body.scrollTop = 0
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  window.lenis?.scrollTo?.(0, { immediate: true, force: true })
  window.lenis?.stop?.()
  window.lenis?.resize?.()
  window.ScrollTrigger?.getAll?.().forEach(trigger => {
    trigger.scroll?.(0)
    trigger.update?.(true)
  })
  window.ScrollTrigger?.refresh?.(true)
  window.ScrollTrigger?.update?.(true)
  window.lenis?.start?.()
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

  const { getPageForPath } = await import('./navbar/pages/registry.js')
  const currentPage = getPageForPath(path, navigationItem.key)
  currentPage.data.href ||= navigationItem.href
  return currentPage
}

const refreshSite = async () => {
  if (requestedPath === appliedPath && document.documentElement.dataset.faraReady === 'true') {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    window.lenis?.scrollTo?.(0, { immediate: true, force: true })
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
      refreshScrollSystems()
    })
    return
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', refreshSite, { once: true })
    return
  }
  appliedPath = requestedPath
  window.dispatchEvent(new CustomEvent('fara:close-menu'))
  const navigationItem = getNavigationItem(requestedPath || '/')
  const currentPage = await getCurrentPage(requestedPath || '/', navigationItem)
  if (currentPage.data.key === 'home') resetHomeScrollState()
  else window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  await applySiteData(siteData, currentPage)
  const header = document.querySelector('#header')
  header?.classList.remove('top', 'fade')
  if (header && requestedPath === '/') header.dataset.theme = 'light'
  window.requestAnimationFrame(() => {
    if (currentPage.data.key === 'home') resetHomeScrollState()
    else window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    header?.classList.remove('top', 'fade')
    refreshScrollSystems()
    window.requestAnimationFrame(() => {
      if (currentPage.data.key === 'home') resetHomeScrollState()
      refreshScrollSystems()
    })
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
