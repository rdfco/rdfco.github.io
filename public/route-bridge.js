/* global window, document, CustomEvent */

// Loaded before the mirrored Astro runtime so FARA routes always win over
// the source site's navigation handlers.
// The legacy sound engine remains bundled and can be restored with one flag.
window.__FARA_SOUND_ENABLED__ = false
window.__FARA_NAVIGATION_MANAGED__ = true

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
    let navigated = false
    const navigateOnce = () => {
      if (navigated) return
      navigated = true
      const menu = document.querySelector('.montfort-menu')
      const header = document.querySelector('#header')
      const menuButton = document.querySelector('#header .menu-cta')
      menu?.classList.remove('active', 'is-closing')
      if (menu) menu.style.display = 'none'
      header?.classList.remove('menu-open', 'menu-closing')
      menuButton?.classList.remove('close')
      menuButton?.setAttribute('aria-expanded', 'false')
      document.documentElement.classList.remove('fara-menu-open')
      navigate()
    }
    window.addEventListener('fara:menu-closed', navigateOnce, { once: true })
    window.setTimeout(navigateOnce, 700)
    window.dispatchEvent(new CustomEvent('fara:close-menu', { detail: { animate: true } }))
    return
  }

  window.dispatchEvent(new CustomEvent('fara:close-menu'))
  navigate()
}, true)
