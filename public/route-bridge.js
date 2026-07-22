/* global window, document, CustomEvent */

// Loaded before the mirrored Astro runtime so FARA routes always win over
// the source site's navigation handlers.
// The legacy sound engine remains bundled and can be restored with one flag.
window.__FARA_SOUND_ENABLED__ = false
window.__FARA_NAVIGATION_MANAGED__ = true

window.setTimeout(() => {
  const preload = document.createElement('link')
  preload.rel = 'preload'
  preload.as = 'fetch'
  preload.href = '/assets/models/fort-energy/energy-chapter.glb'
  preload.type = 'model/gltf-binary'
  preload.crossOrigin = 'anonymous'
  preload.fetchPriority = 'high'
  document.head.prepend(preload)
}, 0)

window.addEventListener('click', event => {
  const link = event.target.closest?.('a[data-fara-route]')
  if (!link) return

  event.preventDefault()
  event.stopImmediatePropagation()

  window.dispatchEvent(new CustomEvent('fara:close-menu'))

  window.parent.postMessage(
    { type: 'fara:navigate', pathname: link.dataset.faraRoute },
    window.location.origin,
  )
}, true)
