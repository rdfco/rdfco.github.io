/* global window, CustomEvent, Element, Node */

// Loaded before the mirrored Astro runtime so FARA routes always win over
// the source site's navigation handlers.
// The legacy sound engine remains bundled and can be restored with one flag.
window.__FARA_SOUND_ENABLED__ = false
window.__FARA_NAVIGATION_MANAGED__ = true
window.__FARA_BLOCK_ASTRO_PREFETCH__ = true

const blockAstroPrefetch = () => {
  const nativeAppend = Element.prototype.append
  const nativeAppendChild = Node.prototype.appendChild
  const isBlockedPrefetch = node =>
    window.__FARA_BLOCK_ASTRO_PREFETCH__ &&
    node?.tagName === 'LINK' &&
    String(node.rel || node.getAttribute?.('rel') || '').toLowerCase() === 'prefetch'

  Element.prototype.append = function (...nodes) {
    return nativeAppend.apply(this, nodes.filter(node => !isBlockedPrefetch(node)))
  }
  Node.prototype.appendChild = function (node) {
    if (isBlockedPrefetch(node)) return node
    return nativeAppendChild.call(this, node)
  }
}

blockAstroPrefetch()

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
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    window.lenis?.scrollTo?.(0, { immediate: true, force: true })
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

  waitForTransition({
    fallbackMs: 750,
    navigate,
    start: complete => {
      window.dispatchEvent(new CustomEvent('fara:close-menu'))
      window.dispatchEvent(
        new CustomEvent('fara:animate-navbar-route', { detail: { link, complete } }),
      )
    },
  })
}, true)
