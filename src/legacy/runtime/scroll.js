import { silenceLegacyGsapNullTargets } from './legacy-gsap.js'
import { getLenis, getWheelDelta } from './lenis.js'
import { setActiveNavigationRoute, syncActiveNavigationWithScroll } from './navigation-sync.js'
import { animatedHomeRoutes, sectionRoutes } from './routes.js'
import { pinSceneToTop } from './scene.js'
import { scrollState } from './scroll-state.js'

// Everything that writes the document's scroll position: pinning it at the top
// across a route change, travelling to a section, and getting out of the way
// the moment the visitor takes over.

let refreshFrame = 0

let scrollAnimationFrame = 0

let topHoldGeneration = 0

// The longest a top pin may run before it releases on its own.
const PIN_MAX_MS = 2600

// Holds the document at the top for as long as `task` runs. The tweens are
// killed rather than out-written, so there is at most one frame of contention
// each; scrollTo only runs when something actually moved the page, which keeps
// the scroll event and ScrollTrigger out of it on every other frame.
export const holdAtTopWhile = async task => {
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
export const stopSectionScroll = () => {
  if (!scrollState.programmaticSectionScroll) return
  window.cancelAnimationFrame(scrollAnimationFrame)
  // A Lenis-driven trip has to be cut at its current position, otherwise it
  // keeps easing toward the section under whatever the visitor does next.
  const lenis = getLenis()
  if (lenis) lenis.scrollTo(lenis.animatedScroll ?? window.scrollY, { immediate: true, force: true })
  scrollState.programmaticSectionScroll = false
  syncActiveNavigationWithScroll()
}

export const stopTopHold = () => { topHoldGeneration += 1 }

// Input no longer scrolls the page from here - it only tells the programmatic
// section scroll to get out of the way, so a visitor who reaches for the wheel
// mid-navigation takes over immediately. Wheel and touch are left entirely to
// Lenis (and, on touch, to the browser's own momentum, which Lenis leaves
// alone by design).
export const setupInputHandoff = () => {
  window.addEventListener('fara:scrollbar-drag-start', () => {
    stopTopHold()
    stopSectionScroll()
  })

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

export const refreshScrollSystems = () => {
  window.cancelAnimationFrame(refreshFrame)
  refreshFrame = window.requestAnimationFrame(() => {
    silenceLegacyGsapNullTargets()
    window.dispatchEvent(new Event('resize'))
    window.dispatchEvent(new Event('scroll'))
    window.ScrollTrigger?.refresh?.()
    getLenis()?.resize?.()
  })
}

const easeInOutCubic = progress => (
  progress < .5
    ? 4 * progress * progress * progress
    : 1 - ((-2 * progress + 2) ** 3) / 2
)

const getSectionTargetTop = selector => {
  const target = document.querySelector(selector)
  if (!target) return 0
  const offset = Math.min(180, Math.max(90, window.innerHeight * .16))
  return Math.max(0, target.getBoundingClientRect().top + window.scrollY - offset)
}

export const scrollToSectionRoute = route => {
  const selector = sectionRoutes.get(route)
  if (!selector && !animatedHomeRoutes.has(route)) return
  const start = window.scrollY
  const end = animatedHomeRoutes.has(route) ? 0 : getSectionTargetTop(selector)
  const distance = end - start
  const duration = Math.min(4600, Math.max(3000, Math.abs(distance) * .9))
  const startedAt = performance.now()

  window.cancelAnimationFrame(scrollAnimationFrame)
  scrollState.programmaticSectionScroll = true
  setActiveNavigationRoute(route)

  const settle = () => {
    scrollState.programmaticSectionScroll = false
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

export const jumpToTop = () => {
  // Lenis carries its own target; moving the document without telling it just
  // gives it something to ease back down to on the next frame.
  getLenis()?.scrollTo?.(0, { immediate: true, force: true })
  document.documentElement.scrollTop = 0
  document.body.scrollTop = 0
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
}

// Refreshing the legacy scroll systems restores the offset they recorded before
// the route changed, and the legacy timelines tween the window back up, which
// reads as a fast auto-scroll. Holding the document at zero for the rest of the
// transition - while the shell's gate still covers the frame - means the home
// page is simply already at the top when it appears.
export const holdAtTop = durationMs => new Promise(resolve => {
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

export const resetHomeScrollState = () => {
  jumpToTop()
  const lenis = getLenis()
  lenis?.stop?.()
  lenis?.resize?.()
  window.ScrollTrigger?.refresh?.(true)
  window.ScrollTrigger?.update?.(true)
  lenis?.start?.()
}
