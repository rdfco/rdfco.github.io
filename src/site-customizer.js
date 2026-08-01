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

const visualAssetTracker = (() => {
  const pending = new Set()
  const completed = new Set()
  let requestId = 0

  const isVisualAsset = value => {
    try {
      const url = new URL(String(value), window.location.href)
      return /\.(?:glb|gltf|bin|ktx2|basis|webp|png|jpe?g|exr)(?:$|\?)/i.test(url.pathname + url.search)
    } catch {
      return false
    }
  }

  const begin = value => {
    if (!isVisualAsset(value)) return null
    const id = requestId++
    pending.add(id)
    return id
  }

  const end = (id, value) => {
    if (id === null) return
    pending.delete(id)
    completed.add(new URL(String(value), window.location.href).pathname)
    window.dispatchEvent(new CustomEvent('fara:visual-asset-complete'))
  }

  const originalFetch = window.fetch?.bind(window)
  if (originalFetch) {
    window.fetch = async (...args) => {
      const value = args[0]?.url || args[0]
      const id = begin(value)
      try {
        return await originalFetch(...args)
      } finally {
        end(id, value)
      }
    }
  }

  const originalOpen = window.XMLHttpRequest?.prototype?.open
  const originalSend = window.XMLHttpRequest?.prototype?.send
  if (originalOpen && originalSend) {
    window.XMLHttpRequest.prototype.open = function open(method, url, ...args) {
      this.__faraVisualAssetUrl = url
      return originalOpen.call(this, method, url, ...args)
    }
    window.XMLHttpRequest.prototype.send = function send(...args) {
      const url = this.__faraVisualAssetUrl
      const id = begin(url)
      if (id !== null) {
        this.addEventListener('loadend', () => end(id, url), { once: true })
      }
      return originalSend.apply(this, args)
    }
  }

  return {
    completed,
    get pendingCount() {
      return pending.size
    },
  }
})()

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

const normalizePhoneNumbers = () => {
  document.querySelectorAll('a[href^="tel:"]').forEach(link => {
    link.href = 'tel:02188220629'
    link.textContent = '02188220629'
  })
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

const waitForBodyLoaded = () => new Promise(resolve => {
  if (document.body.classList.contains('loaded')) {
    resolve()
    return
  }

  const observer = new MutationObserver(() => {
    if (!document.body.classList.contains('loaded')) return
    observer.disconnect()
    resolve()
  })
  observer.observe(document.body, { attributes: true, attributeFilter: ['class'] })
})

const waitForFonts = async () => {
  if (!document.fonts?.ready) return
  await document.fonts.ready
}

const waitForRenderedCanvasFrame = () => new Promise(resolve => {
  const check = () => {
    const canvas = document.querySelector('#canvas-wrapper canvas')
    if (!canvas || canvas.width === 0 || canvas.height === 0) {
      window.requestAnimationFrame(check)
      return
    }

    window.requestAnimationFrame(() => window.requestAnimationFrame(resolve))
  }
  check()
})

const waitForSceneAssets = () => new Promise(resolve => {
  const requiredAssets = [
    '/assets/models/fort-energy/fort-energy.glb',
    '/assets/models/fort-energy/energy-chapter.glb',
  ]
  const idleDelayMs = 300
  let idleTimer = null

  const isReady = () =>
    visualAssetTracker.pendingCount === 0 &&
    requiredAssets.every(asset => visualAssetTracker.completed.has(asset))

  const cleanup = () => {
    window.clearTimeout(idleTimer)
    window.removeEventListener('fara:visual-asset-complete', schedule)
  }

  const schedule = () => {
    window.clearTimeout(idleTimer)
    if (!isReady()) return
    idleTimer = window.setTimeout(() => {
      if (!isReady()) return
      cleanup()
      resolve()
    }, idleDelayMs)
  }

  window.addEventListener('fara:visual-asset-complete', schedule)
  schedule()
})

const waitForVisualReadiness = async pageKey => {
  await Promise.all([waitForBodyLoaded(), waitForFonts()])
  if (pageKey === 'home') {
    await waitForSceneAssets()
    await waitForRenderedCanvasFrame()
  }
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
  normalizePhoneNumbers()
  await waitForVisualReadiness(currentPage.data.key)
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
