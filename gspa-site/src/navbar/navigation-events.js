export const setupNavigationEvents = () => {
  if (document.documentElement.dataset.faraNavigationReady === 'true') return
  document.documentElement.dataset.faraNavigationReady = 'true'

  document.addEventListener('click', event => {
    const link = event.target.closest?.('a[data-fara-route]')
    if (!link) return
    event.preventDefault()
    event.stopImmediatePropagation()
    window.parent.postMessage({ type: 'fara:navigate', pathname: link.dataset.faraRoute }, window.location.origin)
  }, true)

  const menu = document.querySelector('.montfort-menu')
  const header = document.querySelector('#header')
  const menuButton = document.querySelector('#header .menu-cta')
  const setMenuOpen = open => {
    menu?.classList.toggle('active', open)
    header?.classList.toggle('menu-open', open)
    if (open) header?.classList.remove('top', 'fade')
    else if (window.scrollY > 20) header?.classList.add('top')
    menuButton?.setAttribute('aria-expanded', String(open))
    document.documentElement.classList.toggle('fara-menu-open', open)
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
