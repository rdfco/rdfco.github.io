/* global window, CustomEvent */

// Loaded before the mirrored Astro runtime so FARA routes always win over
// the source site's navigation handlers.
// The legacy sound engine remains bundled and can be restored with one flag.
window.__FARA_SOUND_ENABLED__ = false
window.__FARA_NAVIGATION_MANAGED__ = true

const waitForTransition = ({ eventName, fallbackMs, start, navigate }) => {
  let completed = false
  let fallbackTimer = 0

  const complete = () => {
    if (completed) return
    completed = true
    window.clearTimeout(fallbackTimer)
    if (eventName) window.removeEventListener(eventName, complete)
    navigate()
  }

  if (eventName) window.addEventListener(eventName, complete)
  fallbackTimer = window.setTimeout(complete, fallbackMs)
  start(complete)
}

window.addEventListener('click', event => {
  const link = event.target.closest?.('a[data-fara-route]')
  if (!link) return

  event.preventDefault()
  event.stopImmediatePropagation()

  const navigate = () => {
    window.parent.postMessage(
      { type: 'fara:navigate', pathname: link.dataset.faraRoute },
      window.location.origin,
    )
  }

  if (link.closest('.montfort-menu')) {
    waitForTransition({
      eventName: 'fara:menu-closed',
      fallbackMs: 1700,
      navigate,
      start: () => {
        window.dispatchEvent(new CustomEvent('fara:close-menu', { detail: { animate: true } }))
      },
    })
    return
  }

  if (link.closest('#header .menu-links-w')) {
    waitForTransition({
      fallbackMs: 750,
      navigate,
      start: complete => {
        window.dispatchEvent(
          new CustomEvent('fara:animate-navbar-route', { detail: { link, complete } }),
        )
      },
    })
    return
  }

  window.dispatchEvent(new CustomEvent('fara:close-menu'))
  navigate()
}, true)
