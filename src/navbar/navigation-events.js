export const setupNavigationEvents = () => {
  if (document.documentElement.dataset.faraNavigationReady === 'true') return
  document.documentElement.dataset.faraNavigationReady = 'true'

  const menu = document.querySelector('.montfort-menu')
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
  let menuCloseTimer = 0
  let headerRevealTimer = 0
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
  let closingViaRoute = false
  const setMenuOpen = open => {
    if (open) {
      header?.classList.add('menu-cycle-started')
      window.clearTimeout(menuCloseTimer)
      window.clearTimeout(headerRevealTimer)
      menu?.classList.remove('is-closing')
      menu?.style.removeProperty('--fara-close-overlay-delay')
      header?.classList.remove('menu-closing', 'menu-revealing')
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
      } else {
        overlayCloseButton.classList.remove('close')
        overlayHideTimer = window.setTimeout(() => { overlayCloseButton.hidden = true }, 650)
      }
    }
    if (open) header?.classList.remove('top', 'fade')
    else if (window.scrollY > 20) header?.classList.add('top')
    menuButton?.setAttribute('aria-expanded', String(open))
    document.documentElement.classList.toggle('fara-menu-open', open)
  }
  const closeMenu = (animate = true) => {
    const menuIsOpen = menu?.classList.contains('active') || menuButton?.classList.contains('close')
    if (!menuIsOpen && !menu?.classList.contains('is-closing')) {
      setMenuOpen(false)
      if (menu) menu.style.display = 'none'
      return
    }
    if (menu?.classList.contains('is-closing')) {
      setMenuOpen(false)
      return
    }
    const legacyMenuIsOpen = menuButton?.classList.contains('close')
    if (legacyMenuIsOpen && !closingViaRoute) {
      closingViaRoute = true
      menuButton.click()
      closingViaRoute = false
    }
    if (!animate) {
      window.clearTimeout(menuCloseTimer)
      menu?.classList.remove('is-closing')
      setMenuOpen(false)
      if (menu) menu.style.display = 'none'
      return
    }
    const closingItems = [...(menu?.querySelectorAll('ul li') || [])]
    closingItems.forEach((item, index) => {
      item.style.setProperty('--fara-close-delay', `${(closingItems.length - index - 1) * 75}ms`)
    })
    const overlayDelay = closingItems.length * 75 + 200
    menu?.style.setProperty('--fara-close-overlay-delay', `${overlayDelay}ms`)
    menu?.classList.add('is-closing')
    header?.classList.add('menu-closing')
    header?.classList.remove('menu-revealing')
    setMenuOpen(false)
    window.clearTimeout(menuCloseTimer)
    menuCloseTimer = window.setTimeout(() => {
      menu?.classList.remove('is-closing')
      if (menu) menu.style.display = 'none'
      header?.classList.remove('menu-closing')
      header?.classList.add('menu-revealing')
      window.clearTimeout(headerRevealTimer)
      headerRevealTimer = window.setTimeout(() => header?.classList.remove('menu-revealing'), 1700)
    }, overlayDelay + 450)
  }
  window.addEventListener('fara:close-menu', () => closeMenu(false))
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
    menuButton.addEventListener('click', event => {
      event.preventDefault()
      if (closingViaRoute) {
        setMenuOpen(false)
        return
      }
      if (menu.classList.contains('active')) {
        closeMenu(true)
        return
      }
      setMenuOpen(!menu.classList.contains('active'))
    })
    menu.querySelector('.overlay')?.addEventListener('click', closeMenu)
    menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeMenu(false)))
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
