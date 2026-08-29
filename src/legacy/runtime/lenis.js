// Discovery of the Lenis instance the legacy bundle constructs, plus the wheel
// delta normalisation that goes with it.

export const getWheelDelta = event => {
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
export const getLenis = () => {
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
export const publishLenis = () => {
  let attempts = 0
  const timer = window.setInterval(() => {
    attempts += 1
    if (getLenis() || attempts >= 60) window.clearInterval(timer)
  }, 100)
}
