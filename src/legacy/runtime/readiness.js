import { getLenis } from './lenis.js'
import { pinSceneToTop } from './scene.js'
import { jumpToTop } from './scroll.js'

// What "ready to be uncovered" means for each surface, including the WebGL
// warm-up that keeps the visitor's first wheel event off a cold shader.

let homeWebGLWarmed = false

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
export const warmHomeWebGL = async () => {
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
    // and chapter timelines. Exercise each real chapter start, midpoint and
    // end in both directions while the loader still covers the frame. The old
    // global fractional sweep added 23 stops regardless of chapter ownership;
    // chapter-owned samples warm the same states without holding the first
    // reveal for hundreds of redundant frames.
    const maxScroll = Math.max(
      0,
      Math.min(
        document.documentElement.scrollHeight - window.innerHeight,
        ...chapters.map(chapter => chapter.scrollRange?.end || 0),
      ),
    )
    const warmPoints = new Set([0, maxScroll])
    chapters.forEach(chapter => {
      const start = chapter.scrollRange?.start || 0
      const end = chapter.scrollRange?.end || 0
      warmPoints.add(start)
      warmPoints.add(start + (end - start) / 2)
      warmPoints.add(end)
    })

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

export const waitForVisualReadiness = async pageKey => {
  if (pageKey === 'home') {
    await waitForHomeAboveFoldReady()
    await warmHomeWebGL()
    return
  }

  await Promise.all([waitForBodyLoaded(), waitForFonts()])
}
