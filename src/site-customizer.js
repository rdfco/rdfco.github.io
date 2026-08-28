import { siteData } from './data/siteData.js'
import { validateSiteData } from './data/validateSiteData.js'
import { applySiteData } from './js/apply-site.js'
import { getNavigationItem } from './navbar/navigation.js'
import { setupNavigationEvents } from './navbar/navigation-events.js'
import './styles/route-pages.css'
import './styles/content-pages.css'

validateSiteData(siteData)

if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual'

let requestedPath = null
let appliedPath = null
let refreshFrame = 0
let activeScrollRoute = '/'
let scrollAnimationFrame = 0
let activeNavFrame = 0
let programmaticSectionScroll = false
let pendingSectionRoute = null
let sceneRunning = true
let applyingRoute = false
let homeWebGLWarmed = false
let topHoldGeneration = 0

const sectionRoutes = new Map([
  ['/who-we-are', '.fara-about'],
  ['/how-we-help', '.fara-solutions'],
  ['/who-we-serve', '.fara-industries'],
])

const animatedHomeRoutes = new Set(['/'])

const routeSelector = route => `[data-fara-route="${route}"], [data-fara-section-route="${route}"]`

const getLinkRoute = link => link?.dataset.faraSectionRoute || link?.dataset.faraRoute || ''

const postMenuState = open => {
  window.parent.postMessage({ type: 'fara:menu-state', open }, window.location.origin)
}

const nativeWarn = console.warn.bind(console)
console.warn = (...args) => {
  if (String(args[0] || '').startsWith('GSAP target  not found')) return
  nativeWarn(...args)
}

const silenceLegacyGsapNullTargets = () => {
  window.gsap?.config?.({ nullTargetWarn: false })
}

const prepareLegacyGsap = () => {
  let attempts = 0
  const timer = window.setInterval(() => {
    attempts += 1
    silenceLegacyGsapNullTargets()
    if (window.gsap || attempts >= 20) window.clearInterval(timer)
  }, 100)
}

const getWheelDelta = event => {
  if (event.deltaMode === 1) return event.deltaY * 16
  if (event.deltaMode === 2) return event.deltaY * window.innerHeight
  return event.deltaY
}

// The legacy app already ships Lenis (lerp .055, wheelMultiplier .72) and
// drives it from its own render loop, so the page has a real smooth-scroll
// engine. This module used to install a second wheel driver on top of it:
// both called preventDefault on the same notch and both wrote window.scrollY
// on the same frame, one lerping at .16 off an integer-rounded read of
// scrollY. Two engines easing toward two targets is what made the text step
// up the screen instead of gliding. Lenis owns the wheel now; everything here
// goes through it.
let cachedLenis = null

const findLenis = value => {
  if (!value || typeof value !== 'object') return null
  const lenis = value.scrollManager?.lenis
  if (typeof lenis?.raf === 'function' && typeof lenis?.scrollTo === 'function') return lenis
  return null
}

// The legacy bundle is minified, so the key holding the scroll manager is not
// stable across builds - look the instance up by shape instead of by name.
const getLenis = () => {
  if (cachedLenis) return cachedLenis
  const direct = window.lenis
  if (typeof direct?.raf === 'function' && typeof direct?.scrollTo === 'function') {
    cachedLenis = direct
    return cachedLenis
  }
  const exports = window.__FARA_APP_EXPORTS
  if (!exports) return null
  for (const key of Object.keys(exports)) {
    let candidate
    try {
      candidate = exports[key]
    } catch {
      continue
    }
    const found = findLenis(candidate)
    if (!found) continue
    cachedLenis = found
    // The rest of this module (and anything else on the page) already reaches
    // for window.lenis; give it something to find.
    window.lenis = found
    return cachedLenis
  }
  return null
}

// getLenis only resolves once the legacy app has constructed its scroll
// manager, and everything else here calls it lazily. The shell's scrollbar
// needs window.lenis from outside the frame, though, so it cannot wait for one
// of those calls to happen to come first - publish it as soon as it exists.
const publishLenis = () => {
  let attempts = 0
  const timer = window.setInterval(() => {
    attempts += 1
    if (getLenis() || attempts >= 60) window.clearInterval(timer)
  }, 100)
}

// The shell fades its gate out over 420ms and only then is the top of the home
// page actually on screen. Nothing used to connect the two sides, so the
// section scroll started on whichever finished first - which is why the same
// click looked right from one route and wrong from another. These are the
// terms of that handshake.
const REVEAL_PAUSE_MS = 260
const REVEAL_WAIT_TIMEOUT_MS = 1600
const PIN_MAX_MS = 2600

const delay = ms => new Promise(resolve => window.setTimeout(resolve, ms))

const shellSignals = { 'fara:revealed': [] }
const pendingSignal = { 'fara:revealed': false }

const receiveShellSignal = type => {
  const waiting = shellSignals[type]
  if (!waiting) return
  if (!waiting.length) {
    pendingSignal[type] = true
    return
  }
  waiting.splice(0).forEach(resolve => resolve())
}

// Timers rather than frame counting: requestAnimationFrame stops in a
// background tab, and a visitor who switches away mid-transition has to come
// back to a page that moves, not one still pinned to the top.
const waitForShellSignal = (type, timeoutMs) => new Promise(resolve => {
  if (pendingSignal[type]) {
    pendingSignal[type] = false
    resolve()
    return
  }
  let done = false
  const finish = () => {
    if (done) return
    done = true
    window.clearTimeout(timer)
    const waiting = shellSignals[type]
    const index = waiting.indexOf(finish)
    if (index >= 0) waiting.splice(index, 1)
    resolve()
  }
  shellSignals[type].push(finish)
  const timer = window.setTimeout(finish, timeoutMs)
})

const armShellSignal = type => { pendingSignal[type] = false }

// Holds the document at the top for as long as `task` runs. The tweens are
// killed rather than out-written, so there is at most one frame of contention
// each; scrollTo only runs when something actually moved the page, which keeps
// the scroll event and ScrollTrigger out of it on every other frame.
const holdAtTopWhile = async task => {
  let holding = true
  const startedAt = performance.now()
  const hold = () => {
    if (!holding) return
    window.gsap?.killTweensOf?.(window)
    window.gsap?.killTweensOf?.(document.documentElement)
    if (window.scrollY !== 0) jumpToTop()
    pinSceneToTop()
    if (performance.now() - startedAt >= PIN_MAX_MS) return
    window.requestAnimationFrame(hold)
  }
  jumpToTop()
  window.requestAnimationFrame(hold)
  try {
    await task()
  } finally {
    holding = false
  }
}

// A navigation scroll is a long animation, so any real input during it has to
// win outright. Without this the two drivers write to window.scrollY on the
// same frame and the page stutters between them.
const stopSectionScroll = () => {
  if (!programmaticSectionScroll) return
  window.cancelAnimationFrame(scrollAnimationFrame)
  // A Lenis-driven trip has to be cut at its current position, otherwise it
  // keeps easing toward the section under whatever the visitor does next.
  const lenis = getLenis()
  if (lenis) lenis.scrollTo(lenis.animatedScroll ?? window.scrollY, { immediate: true, force: true })
  programmaticSectionScroll = false
  syncActiveNavigationWithScroll()
}

const stopTopHold = () => { topHoldGeneration += 1 }

// Input no longer scrolls the page from here - it only tells the programmatic
// section scroll to get out of the way, so a visitor who reaches for the wheel
// mid-navigation takes over immediately. Wheel and touch are left entirely to
// Lenis (and, on touch, to the browser's own momentum, which Lenis leaves
// alone by design).
const setupInputHandoff = () => {
  window.addEventListener('wheel', event => {
    if (Math.abs(event.deltaY) < Math.abs(event.deltaX)) return
    if (!getWheelDelta(event)) return
    stopTopHold()
    stopSectionScroll()
  }, { passive: true })

  window.addEventListener('touchstart', () => {
    stopTopHold()
    stopSectionScroll()
  }, { passive: true })
  window.addEventListener('keydown', () => {
    stopTopHold()
    stopSectionScroll()
  }, { passive: true })
}

// Lenis and WebGL share the legacy core ticker. Pausing that ticker on a routed
// page also pauses Lenis after it has consumed trackpad/wheel input, leaving
// the document and the custom scrollbar unable to move. Routed-page CSS hides
// the canvas; keep the shared clock alive so scrolling remains deterministic.
const setSceneRunning = running => {
  if (sceneRunning === running) return
  const ticker = window.__FARA_APP_EXPORTS?.a?.core?.ticker
  sceneRunning = running
  ticker?.play?.()
}

const normalizeRoute = value => {
  const [path, query = ''] = value.split('?')
  const normalizedPath = path === '/' ? '/' : path.replace(/\/+$/, '')
  return query ? `${normalizedPath}?${query}` : normalizedPath
}

const refreshScrollSystems = () => {
  window.cancelAnimationFrame(refreshFrame)
  refreshFrame = window.requestAnimationFrame(() => {
    silenceLegacyGsapNullTargets()
    window.dispatchEvent(new Event('resize'))
    window.dispatchEvent(new Event('scroll'))
    window.ScrollTrigger?.refresh?.()
    getLenis()?.resize?.()
  })
}

const setupMenuStateSync = () => {
  const root = document.documentElement
  const sync = () => {
    const menuBusy = root.classList.contains('fara-menu-open')
      || root.classList.contains('fara-menu-closing')
    postMenuState(menuBusy)
  }
  sync()
  const observer = new MutationObserver(sync)
  observer.observe(root, { attributes: true, attributeFilter: ['class'] })
}

const easeInOutCubic = progress => (
  progress < .5
    ? 4 * progress * progress * progress
    : 1 - ((-2 * progress + 2) ** 3) / 2
)

const setActiveNavigationRoute = route => {
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

const getSectionTargetTop = selector => {
  const target = document.querySelector(selector)
  if (!target) return 0
  const offset = Math.min(180, Math.max(90, window.innerHeight * .16))
  return Math.max(0, target.getBoundingClientRect().top + window.scrollY - offset)
}

const scrollToSectionRoute = route => {
  const selector = sectionRoutes.get(route)
  if (!selector && !animatedHomeRoutes.has(route)) return
  const start = window.scrollY
  const end = animatedHomeRoutes.has(route) ? 0 : getSectionTargetTop(selector)
  const distance = end - start
  const duration = Math.min(4600, Math.max(3000, Math.abs(distance) * .9))
  const startedAt = performance.now()

  window.cancelAnimationFrame(scrollAnimationFrame)
  programmaticSectionScroll = true
  setActiveNavigationRoute(route)

  const settle = () => {
    programmaticSectionScroll = false
    setActiveNavigationRoute(route)
    refreshScrollSystems()
  }

  // Handing the travel to Lenis rather than writing window.scrollY ourselves
  // keeps a single engine on the scroll position for the whole trip, so the
  // arrival eases in instead of being handed off between two of them.
  const lenis = getLenis()
  if (lenis) {
    lenis.scrollTo(end, {
      duration: duration / 1000,
      easing: easeInOutCubic,
      force: true,
      onComplete: settle,
    })
    return
  }

  const step = now => {
    const progress = Math.min(1, (now - startedAt) / duration)
    // Legacy timelines keep tweening the window for a while after a route
    // settles; left alone they drag the page back while this animation runs.
    window.gsap?.killTweensOf?.(window)
    window.gsap?.killTweensOf?.(document.documentElement)
    window.scrollTo(0, start + distance * easeInOutCubic(progress))
    if (progress < 1) {
      scrollAnimationFrame = window.requestAnimationFrame(step)
      return
    }
    settle()
  }
  scrollAnimationFrame = window.requestAnimationFrame(step)
}

// Every route into a section ends here: pinned at the top until the shell says
// its gate is gone, then held one more beat so the visitor registers the top of
// the page as a still frame, and only then does the travelling start.
const revealThenScrollToSection = async route => {
  await holdAtTopWhile(async () => {
    await waitForShellSignal('fara:revealed', REVEAL_WAIT_TIMEOUT_MS)
    await delay(REVEAL_PAUSE_MS)
  })
  scrollToSectionRoute(route)
}

const waitForMenuClose = shouldClose => new Promise(resolve => {
  const menu = document.querySelector('.fara-menu')
  const isOpen = menu?.classList.contains('active') || menu?.classList.contains('is-closing')
  if (!shouldClose || !isOpen) {
    resolve()
    return
  }
  let done = false
  const finish = () => {
    if (done) return
    done = true
    window.clearTimeout(timer)
    window.removeEventListener('fara:menu-closed', finish)
    resolve()
  }
  const timer = window.setTimeout(finish, 1800)
  window.addEventListener('fara:menu-closed', finish, { once: true })
  window.dispatchEvent(new CustomEvent('fara:close-menu', { detail: { animate: true } }))
})

// Section routes live on the home page. From a routed page the parent router
// has to move the URL back to "/" first, otherwise the browser address stays on
// the standalone page and the scroll lands inside it.
const navigateToSectionRoute = async (route, { closeMenu = false } = {}) => {
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

const setupSectionRouteLinks = () => {
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

const syncActiveNavigationWithScroll = () => {
  if (programmaticSectionScroll) return
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

const normalizePhoneNumbers = () => {
  document.querySelectorAll('a[href^="tel:"]').forEach(link => {
    link.href = 'tel:02188220629'
    link.textContent = '02188220629'
  })
}

const jumpToTop = () => {
  // Lenis carries its own target; moving the document without telling it just
  // gives it something to ease back down to on the next frame.
  getLenis()?.scrollTo?.(0, { immediate: true, force: true })
  document.documentElement.scrollTop = 0
  document.body.scrollTop = 0
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
}

// The scene follows the document through a damped value of its own, and the
// engine resyncs that follower itself every time it swaps pages. Our route
// swap comes from the shell and never goes through that path, so the follower
// is left easing toward the offset the previous page had - which is the motion
// still visible behind the navbar after the gate has gone. Reset alongside the
// document, and only ever while the document is deliberately pinned at the top.
const pinSceneToTop = () => {
  const webgl = window.__FARA_APP_EXPORTS?.a?.webgl
  if (!webgl) return
  webgl.lerpedScrollProgress = 0
  webgl.previousScrollProgress = 0
}

// Refreshing the legacy scroll systems restores the offset they recorded before
// the route changed, and the legacy timelines tween the window back up, which
// reads as a fast auto-scroll. Holding the document at zero for the rest of the
// transition - while the shell's gate still covers the frame - means the home
// page is simply already at the top when it appears.
const holdAtTop = durationMs => new Promise(resolve => {
  const generation = ++topHoldGeneration
  const startedAt = performance.now()
  const hold = now => {
    if (generation !== topHoldGeneration) {
      resolve()
      return
    }
    window.gsap?.killTweensOf?.(window)
    window.gsap?.killTweensOf?.(document.documentElement)
    jumpToTop()
    pinSceneToTop()
    if (now - startedAt >= durationMs) {
      resolve()
      return
    }
    window.requestAnimationFrame(hold)
  }
  window.requestAnimationFrame(hold)
})

const resetHomeScrollState = () => {
  jumpToTop()
  const lenis = getLenis()
  lenis?.stop?.()
  lenis?.resize?.()
  window.ScrollTrigger?.refresh?.(true)
  window.ScrollTrigger?.update?.(true)
  lenis?.start?.()
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

const waitForHomeAboveFoldReady = () => new Promise(resolve => {
  const isReady = () => {
    const heroText = document.querySelector('.hero .fara-hero-brand-lockup')
    const heroPhrase = document.querySelector('.hero .fara-hero-phrase')
    const canvas = document.querySelector('#canvas-wrapper canvas')
    return (
      heroText?.textContent?.trim() &&
      heroPhrase?.textContent?.trim() &&
      canvas &&
      window.__FARA_WEBGL_READY === true &&
      (canvas.width > 0 || canvas.clientWidth > 0) &&
      (canvas.height > 0 || canvas.clientHeight > 0)
    )
  }

  const check = () => {
    if (isReady()) {
      resolve()
      return
    }
    window.requestAnimationFrame(check)
  }
  window.addEventListener('fara:webgl-ready', check, { once: true })
  check()
})

// The legacy ready flag is raised after the first visible canvas frame, but
// the energy chapter below the fold still has uncompiled shader programs at
// that point. If compilation is left until the first wheel event, the browser
// stalls inside that interaction for hundreds of milliseconds. Compile every
// loaded chapter while the parent loading gate still covers the iframe, then
// restore the exact visibility state before the page is revealed.
const warmHomeWebGL = async () => {
  if (homeWebGLWarmed) return
  const webgl = window.__FARA_APP_EXPORTS?.a?.webgl
  const renderer = webgl?.renderer
  const scene = webgl?.mainScene
  const camera = webgl?.camera
  const chapters = webgl?.currentPage?.chaptersArr || []
  if (!renderer || !scene || !camera || !chapters.length) return

  const visibility = chapters.map(chapter => chapter.visible)
  try {
    chapters.forEach(chapter => { chapter.visible = true })
    scene.updateMatrixWorld?.(true)
    if (typeof renderer.compileAsync === 'function') {
      await renderer.compileAsync(scene, camera)
    } else {
      renderer.compile?.(scene, camera)
    }

    // Compilation alone does not initialize scroll-activated render targets
    // and chapter timelines. Exercise the full current WebGL page in a small
    // number of deterministic jumps while it is still covered by the loader.
    const maxScroll = Math.max(
      0,
      Math.min(
        document.documentElement.scrollHeight - window.innerHeight,
        ...chapters.map(chapter => chapter.scrollRange?.end || 0),
      ),
    )
    const warmPoints = new Set([0, maxScroll])
    chapters.forEach(chapter => {
      warmPoints.add(chapter.scrollRange?.start || 0)
      warmPoints.add(chapter.scrollRange?.end || 0)
    })
    for (let index = 1; index < 24; index += 1) warmPoints.add(maxScroll * (index / 24))

    const nextFrame = () => new Promise(resolve => window.requestAnimationFrame(resolve))
    const sortedWarmPoints = [...warmPoints].sort((a, b) => a - b)
    // Run both directions. The first real interaction starts at the top and
    // advances through these timelines, so the final descending pass also
    // leaves their reverse/update paths initialized instead of ending on a
    // cold jump from the last chapter back to zero.
    for (const top of [...sortedWarmPoints, ...sortedWarmPoints.toReversed()]) {
      getLenis()?.scrollTo?.(top, { immediate: true, force: true })
      window.ScrollTrigger?.update?.(true)
      await nextFrame()
      await nextFrame()
      await nextFrame()
    }

    // Immediate jumps prepare the WebGL states, but the user's first wheel
    // still takes a different path: Lenis begins an interpolated scroll at a
    // tiny offset and ScrollTrigger enters its active update loop. Exercise
    // that exact path once under the loader so scrollY 0 -> first chapter does
    // not pay an initialization frame when the visitor starts scrolling.
    const lenis = getLenis()
    lenis?.scrollTo?.(Math.min(240, maxScroll), { duration: 0.45, force: true })
    for (let frame = 0; frame < 55; frame += 1) await nextFrame()
    homeWebGLWarmed = true
  } finally {
    chapters.forEach((chapter, index) => { chapter.visible = visibility[index] })
    jumpToTop()
    pinSceneToTop()
    window.ScrollTrigger?.update?.(true)
    // Let the restored top-of-page state fully render before the parent gate
    // is allowed to uncover the iframe. Otherwise its deferred cleanup lands
    // in the first user-driven scroll frame even though the shaders are warm.
    for (let frame = 0; frame < 6; frame += 1) {
      await new Promise(resolve => window.requestAnimationFrame(resolve))
    }
  }
}

const waitForVisualReadiness = async pageKey => {
  if (pageKey === 'home') {
    await waitForHomeAboveFoldReady()
    await warmHomeWebGL()
    return
  }

  await Promise.all([waitForBodyLoaded(), waitForFonts()])
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
  // Held for every arrival, section routes included. A queued section used to
  // skip the hold, which let the legacy timelines restore the offset the home
  // surface had before the visitor left it - so the section scroll started
  // halfway down the page and the trip up to the top was visible.
  await holdAtTop(900)
  applyingRoute = false
  if (requestedPath !== null) {
    document.documentElement.dataset.faraReady = 'true'
    armShellSignal('fara:revealed')
    postReady()
    const queuedSection = pendingSectionRoute
    pendingSectionRoute = null
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
