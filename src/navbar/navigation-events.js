export const setupNavigationEvents = () => {
  if (document.documentElement.dataset.faraNavigationReady === 'true') return
  document.documentElement.dataset.faraNavigationReady = 'true'

  const menu = document.querySelector('.fara-menu')
  const header = document.querySelector('#header')
  const menuButton = document.querySelector('#header .menu-cta')
  const overlayCloseButton = menuButton?.cloneNode(true)
  if (overlayCloseButton) {
    overlayCloseButton.classList.add('fara-overlay-close')
    overlayCloseButton.querySelectorAll('p span').forEach(label => { label.textContent = 'Close' })
    overlayCloseButton.hidden = true
    document.body.append(overlayCloseButton)
  }
  let overlayHideTimer = 0
  let headerRevealTimer = 0
  let closeSafetyTimer = 0
  const closeItemStaggerMs = 50
  const closeItemDurationMs = 320
  const closePanelDurationMs = 400
  let menuTickerPaused = false
  const setMenuTickerPaused = paused => {
    if (menuTickerPaused === paused) return
    const ticker = window.__FARA_APP_EXPORTS?.a?.core?.ticker
    if (!ticker?.play || !ticker?.pause) return
    menuTickerPaused = paused
    paused ? ticker.pause() : ticker.play()
  }
  const positionOverlayClose = () => {
    if (!menuButton || !overlayCloseButton) return
    const rect = menuButton.getBoundingClientRect()
    Object.assign(overlayCloseButton.style, {
      top: `${rect.top}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
    })
  }
  const setMenuOpen = open => {
    if (open) {
      header?.classList.add('menu-cycle-started')
      window.clearTimeout(headerRevealTimer)
      window.clearTimeout(closeSafetyTimer)
      document.documentElement.classList.remove('fara-menu-closing')
      menu?.classList.remove('is-closing')
      // The close path parks an inline display:none on the menu. Only the
      // !important rules on .active and .is-closing were overriding it, so the
      // menu vanished the instant it held neither class - which is what made a
      // close look like a cut rather than an animation. Clear it on the way in.
      menu?.style.removeProperty('display')
      menu?.style.removeProperty('--fara-close-overlay-delay')
      header?.classList.remove('menu-closing', 'menu-revealing')
      setMenuTickerPaused(true)
    }
    menu?.classList.toggle('active', open)
    header?.classList.toggle('menu-open', open)
    menuButton?.classList.toggle('close', open)
    menuButton?.querySelectorAll('p span').forEach(label => { label.textContent = open ? 'Close' : 'Menu' })
    if (overlayCloseButton) {
      window.clearTimeout(overlayHideTimer)
      if (open) {
        positionOverlayClose()
        overlayCloseButton.hidden = false
        overlayCloseButton.classList.remove('close')
        void overlayCloseButton.offsetWidth
        window.requestAnimationFrame(() => overlayCloseButton.classList.add('close'))
        overlayCloseButton.style.pointerEvents = 'auto'
      } else {
        overlayCloseButton.classList.remove('close')
        overlayCloseButton.style.pointerEvents = 'none'
        overlayHideTimer = window.setTimeout(() => { overlayCloseButton.hidden = true }, 650)
      }
    }
    if (open) header?.classList.remove('top', 'fade')
    else if (window.scrollY > 20) header?.classList.add('top')
    menuButton?.setAttribute('aria-expanded', String(open))
    document.documentElement.classList.toggle('fara-menu-open', open)
  }
  const finishMenuClose = () => {
    window.clearTimeout(closeSafetyTimer)
    if (!menu?.classList.contains('is-closing')) return
    menu.classList.remove('is-closing')
    menu.style.display = 'none'
    header?.classList.remove('menu-closing')
    header?.classList.add('menu-revealing')
    document.documentElement.classList.remove('fara-menu-closing')
    setMenuTickerPaused(false)
    window.dispatchEvent(new CustomEvent('fara:menu-closed'))
    window.clearTimeout(headerRevealTimer)
    headerRevealTimer = window.setTimeout(() => header?.classList.remove('menu-revealing'), 1700)
  }
  // A close is decided by what is actually on screen, not by what the caller
  // asked for. Every caller used to pass its own animate flag, and the ones
  // that passed false - a menu link, a route apply - cut the menu out mid-frame
  // instead of playing the close. Whenever the menu is visible it now plays;
  // the instant path is only for a menu that is already gone.
  const closeMenu = () => {
    const menuIsOpen = menu?.classList.contains('active') || menuButton?.classList.contains('close')
    if (!menuIsOpen && !menu?.classList.contains('is-closing')) {
      setMenuOpen(false)
      if (menu) menu.style.display = 'none'
      setMenuTickerPaused(false)
      return
    }
    // A close already in flight keeps its own animation and its own settle
    // timer; restarting it here would replay the stagger from the top.
    if (menu?.classList.contains('is-closing')) {
      setMenuOpen(false)
      return
    }
    // 75ms a step over seven items pushed the last two entries out to 450ms
    // before they even started fading, and the overlay waited for all of it
    // before beginning - so the menu sat half empty for about a second with
    // nothing moving. The stagger is tighter now and the overlay starts under
    // the tail of it rather than after it.
    const closingItems = [...(menu?.querySelectorAll('ul li') || [])]
    closingItems.forEach((item, index) => {
      item.style.setProperty('--fara-close-delay', `${(closingItems.length - index - 1) * closeItemStaggerMs}ms`)
    })
    // The panel must not begin fading until the final (top-most) item has
    // reached opacity:0. The old overlap started the panel at 320ms while the
    // item sequence was still running until ~540ms, which visibly cut the last
    // entries off on the live WebGL home page.
    const overlayDelay = Math.max(
      closeItemDurationMs,
      (closingItems.length - 1) * closeItemStaggerMs + closeItemDurationMs,
    )
    menu?.style.setProperty('--fara-close-overlay-delay', `${overlayDelay}ms`)
    document.documentElement.classList.add('fara-menu-closing')
    menu?.classList.add('is-closing')
    header?.classList.add('menu-closing')
    header?.classList.remove('menu-revealing')
    setMenuOpen(false)
    // The legacy overlay also emits animation events. Treating one of those as
    // the lifecycle boundary cut this close off before our delayed fade had
    // reached its final frame. A single timer now owns the boundary and is
    // derived from the exact CSS delay and duration.
    window.clearTimeout(closeSafetyTimer)
    closeSafetyTimer = window.setTimeout(
      finishMenuClose,
      overlayDelay + closePanelDurationMs + 160,
    )
  }
  menu?.addEventListener('animationend', event => {
    if (event.target !== menu || event.animationName !== 'fara-menu-close-panel') return
    finishMenuClose()
  })
  window.addEventListener('fara:close-menu', () => closeMenu())
  overlayCloseButton?.addEventListener('click', event => {
    event.preventDefault()
    event.stopPropagation()
    closeMenu()
  })
  window.addEventListener('resize', positionOverlayClose, { passive: true })
  if (menu && menuButton) {
    menuButton.setAttribute('aria-controls', 'fara-overlay-menu')
    menuButton.setAttribute('aria-expanded', 'false')
    menu.id = 'fara-overlay-menu'
    // This control arrives with a legacy GSAP click handler already attached.
    // Own the click in capture phase so only one state machine writes the menu
    // classes and item transforms during a cycle.
    menuButton.addEventListener('click', event => {
      event.preventDefault()
      event.stopImmediatePropagation()
      if (menu.classList.contains('is-closing')) return
      if (menu.classList.contains('active')) {
        closeMenu()
        return
      }
      setMenuOpen(!menu.classList.contains('active'))
    }, true)
    menu.querySelector('.overlay')?.addEventListener('click', closeMenu)
    // Bound once on the menu itself rather than on each link. renderNavigation
    // clones and drops the menu's <li>s on every route, so per-link listeners
    // only ever covered the links that happened to exist at boot - regenerated
    // entries came back with nothing attached, which is why a menu item would
    // stop responding after moving between pages.
    menu.addEventListener('click', event => {
      if (!event.target.closest?.('a')) return
      closeMenu()
    })
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeMenu()
    })
  }

  if (header && !header.dataset.faraScrollReady) {
    header.dataset.faraScrollReady = 'true'
    let previousY = window.scrollY
    window.addEventListener('scroll', () => {
      const currentY = window.scrollY
      const delta = currentY - previousY
      previousY = currentY
      if (header.classList.contains('menu-open')) return
      if (currentY < 20) {
        header.classList.remove('top', 'fade')
      } else if (delta > 4) {
        header.classList.add('fade')
      } else if (delta < -4) {
        header.classList.add('top')
        header.classList.remove('fade')
      }
    }, { passive: true })
  }
}
