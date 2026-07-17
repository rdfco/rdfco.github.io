export const setupNavigationEvents = () => {
  if (document.documentElement.dataset.faraNavigationReady === 'true') return
  document.documentElement.dataset.faraNavigationReady = 'true'
  let setMenuOpen = () => {}

  document.addEventListener('click', event => {
    const link = event.target.closest?.('a[data-fara-route]')
    if (!link) return
    event.preventDefault()
    event.stopImmediatePropagation()
    setMenuOpen(false)
    window.parent.postMessage({ type: 'fara:navigate', pathname: link.dataset.faraRoute }, window.location.origin)
  }, true)

  const menu = document.querySelector('.montfort-menu')
  const header = document.querySelector('#header')
  const menuButton = document.querySelector('#header .menu-cta')
  let closeTimer
  setMenuOpen = open => {
    window.clearTimeout(closeTimer)
    if (open) {
      menu?.classList.remove('closing')
      menu?.classList.add('active')
      header?.classList.add('menu-open')
      header?.classList.remove('fara-nav-surface')
    } else if (menu?.classList.contains('active')) {
      menu.classList.add('closing')
      closeTimer = window.setTimeout(() => {
        menu.classList.remove('active', 'closing')
        header?.classList.remove('menu-open')
        header?.classList.toggle('fara-nav-surface', window.scrollY > 80)
        document.documentElement.classList.remove('fara-menu-open')
      }, 1100)
    }
    menuButton?.setAttribute('aria-expanded', String(open))
    if (open) document.documentElement.classList.add('fara-menu-open')
  }
  if (menu && menuButton) {
    menuButton.setAttribute('aria-controls', 'fara-overlay-menu')
    menuButton.setAttribute('aria-expanded', 'false')
    menu.id = 'fara-overlay-menu'
    menuButton.addEventListener('click', event => {
      event.preventDefault()
      setMenuOpen(!menu.classList.contains('active'))
    })
    menu.querySelector('.overlay')?.addEventListener('click', () => setMenuOpen(false))
    menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenuOpen(false)))
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') setMenuOpen(false)
    })
  }

  if (header && !header.dataset.faraScrollReady) {
    header.dataset.faraScrollReady = 'true'
    let previousY = window.scrollY
    let ticking = false
    const updateHeader = () => {
      const currentY = window.scrollY
      const goingDown = currentY > previousY + 3
      const goingUp = currentY < previousY - 3
      if (!header.classList.contains('menu-open')) {
        header.classList.toggle('fara-nav-hidden', goingDown && currentY > 80)
        if (goingUp || currentY <= 80) header.classList.remove('fara-nav-hidden')
        header.classList.toggle('fara-nav-surface', goingUp && currentY > 80)
        if (currentY <= 80) header.classList.remove('fara-nav-surface')
      }
      previousY = currentY
      ticking = false
    }
    window.addEventListener('scroll', () => {
      if (ticking) return
      ticking = true
      window.requestAnimationFrame(updateHeader)
    }, { passive: true })
  }
}
