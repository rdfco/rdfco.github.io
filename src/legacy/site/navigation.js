// Cloned list items inherit the "listener already attached" markers of their
// template. Clearing them keeps hover, route, and disabled wiring working on
// every regenerated entry.
const clearListenerMarkers = item => {
  item.querySelectorAll('[data-hover-ready], [data-fara-section-scroll-ready], [data-disabled-ready]').forEach(node => {
    delete node.dataset.hoverReady
    delete node.dataset.faraSectionScrollReady
    delete node.dataset.disabledReady
    node.removeAttribute('aria-disabled')
    node.removeAttribute('tabindex')
  })
}

const ensureItems = (listSelector, count) => {
  const list = document.querySelector(listSelector)
  if (!list) return
  while (list.children.length < count) {
    const template = list.lastElementChild
    if (!template) break
    const item = template.cloneNode(true)
    item.querySelector('.active')?.classList.remove('active')
    clearListenerMarkers(item)
    item.dataset.configGenerated = 'true'
    list.appendChild(item)
  }
  while (list.children.length > count) list.lastElementChild.remove()
}

const homeSectionRoutes = new Set(['/', '/who-we-are', '/how-we-help', '/who-we-serve'])

// The navbar carries the same entries on every route. A section route stays
// reachable from a standalone page because the customizer routes back to the
// home surface first and then scrolls to the section, so there is nothing left
// for a collapsed navbar to protect against.
const getHeaderItems = siteData => siteData.navigation

const animateNavbarTo = target => {
  const navList = document.querySelector('#header .menu-links-w')
  const navbar = document.querySelector('#header nav .navbar')
  const requestedLabel = target?.matches?.('span') ? target : target?.querySelector?.('span')
  // The compact header intentionally shows only Home. Keep its green rule on
  // that visible label even while the full desktop navigation continues to
  // track the current home section above the tablet breakpoint.
  const label = window.matchMedia('(max-width: 1023px)').matches
    ? document.querySelector('#header .menu-links-w > ul > li:first-child .nav-link span')
    : requestedLabel
  if (!navList || !navbar || !label) return
  const labelRect = label.getBoundingClientRect()
  const listRect = navList.getBoundingClientRect()
  navbar.style.opacity = '1'
  navbar.style.transition = 'transform 600ms cubic-bezier(.2,.8,.2,1)'
  navbar.style.setProperty('--fara-navbar-transform', `translate3d(${labelRect.left - listRect.left}px, 0, 0) scaleX(${labelRect.width / (navbar.offsetWidth || 1)})`)
}

const setupNavbarRouteTransition = () => {
  if (document.documentElement.dataset.faraNavbarRouteReady === 'true') return
  document.documentElement.dataset.faraNavbarRouteReady = 'true'

  window.addEventListener('fara:animate-navbar-route', event => {
    const navbar = document.querySelector('#header nav .navbar')
    const complete = event.detail?.complete
    if (!navbar || typeof complete !== 'function') {
      complete?.()
      return
    }

    let completed = false
    let fallbackTimer = 0
    const finish = transitionEvent => {
      if (transitionEvent?.propertyName && transitionEvent.propertyName !== 'transform') return
      if (completed) return
      completed = true
      window.clearTimeout(fallbackTimer)
      navbar.removeEventListener('transitionend', finish)
      complete()
    }

    navbar.addEventListener('transitionend', finish)
    animateNavbarTo(event.detail?.link)
    fallbackTimer = window.setTimeout(finish, 650)
  })
}

let navbarFrame = 0
let navbarRestoreTimer = 0
let panelThemeReady = false
const scheduleNavbarUpdate = update => {
  window.cancelAnimationFrame(navbarFrame)
  navbarFrame = window.requestAnimationFrame(update)
}

// The navbar rule is the "you are here" marker, so it collapses instead of
// spanning the whole list when no navigation entry matches the current route.
const collapseNavbar = () => {
  const navbar = document.querySelector('#header nav .navbar')
  if (!navbar) return
  navbar.style.transition = 'transform 600ms cubic-bezier(.2,.8,.2,1)'
  navbar.style.setProperty('--fara-navbar-transform', 'translate3d(0, 0, 0) scaleX(0)')
}

const restoreNavbar = () => {
  const activeLabel = document.querySelector('#header .menu-links-w .nav-link.active span')
  activeLabel ? animateNavbarTo(activeLabel) : collapseNavbar()
}

const setupHover = () => {
  const navList = document.querySelector('#header .menu-links-w > ul')
  if (navList && !navList.dataset.activeReturnReady) {
    navList.dataset.activeReturnReady = 'true'
    navList.addEventListener('mouseleave', () => {
      window.clearTimeout(navbarRestoreTimer)
      navbarRestoreTimer = window.setTimeout(() => scheduleNavbarUpdate(restoreNavbar), 120)
    })
    navList.addEventListener('focusout', event => {
      if (!navList.contains(event.relatedTarget)) {
        window.clearTimeout(navbarRestoreTimer)
        navbarRestoreTimer = window.setTimeout(() => scheduleNavbarUpdate(restoreNavbar), 120)
      }
    })
    window.addEventListener('resize', () => {
      scheduleNavbarUpdate(restoreNavbar)
    }, { passive: true })
  }
  document.querySelectorAll('#header .menu-links-w .nav-link').forEach(link => {
    if (link.dataset.hoverReady) return
    link.dataset.hoverReady = 'true'
    const showItem = () => {
      window.clearTimeout(navbarRestoreTimer)
      scheduleNavbarUpdate(() => animateNavbarTo(link))
    }
    link.addEventListener('mouseenter', showItem)
    link.addEventListener('focus', showItem)
  })
}

const syncNavbar = () => {
  scheduleNavbarUpdate(restoreNavbar)
}

const setupPanelTheme = () => {
  if (panelThemeReady) return
  panelThemeReady = true
  const updatePanelTheme = () => {
    document.querySelector('#header')?.classList.toggle('fara-nav-on-panel', window.scrollY > 160)
  }
  updatePanelTheme()
  window.addEventListener('scroll', updatePanelTheme, { passive: true })
  window.addEventListener('resize', updatePanelTheme, { passive: true })
}

const disableLink = link => {
  link.removeAttribute('href')
  link.setAttribute('aria-disabled', 'true')
  link.setAttribute('tabindex', '-1')
  if (link.dataset.disabledReady) return
  link.dataset.disabledReady = 'true'
  link.addEventListener('click', event => event.preventDefault())
}

const setupRouteLink = (link, route) => {
  if (homeSectionRoutes.has(route)) {
    delete link.dataset.faraRoute
    link.dataset.faraSectionRoute = route
    return
  }
  delete link.dataset.faraSectionRoute
  link.dataset.faraRoute = route
}

const renderHeaderLinkContent = (link, item) => {
  const label = link.querySelector('span')
  if (!label) return
  link.classList.remove('fara-logo-link')
  label.removeAttribute('aria-hidden')
  label.textContent = item.label
}

const legalRoutes = new Map([
  ['privacy policy', '/privacy-policy'],
  ['terms of use', '/terms-of-use'],
])

const configureLegalLink = link => {
  const label = link.textContent.trim().replace(/\s+/g, ' ').toLowerCase()
  const route = [...legalRoutes].find(([name]) => label.includes(name))?.[1]
  if (!route) return false
  link.href = route
  setupRouteLink(link, route)
  link.removeAttribute('aria-disabled')
  link.removeAttribute('tabindex')
  return true
}

export const renderNavigation = (siteData, currentPath = '/') => {
  setupNavbarRouteTransition()
  const headerItems = getHeaderItems(siteData)
  ensureItems('#header .menu-links-w > ul', headerItems.length)
  ensureItems('.fara-menu nav > ul', siteData.navigation.length)
  document.querySelectorAll('#header .menu-links-w > ul > li').forEach(item => { item.dataset.configGenerated = 'true' })
  document.querySelectorAll('.fara-menu nav > ul > li').forEach(item => { item.dataset.configGenerated = 'true' })

  document.querySelectorAll('#header .menu-links-w .nav-link').forEach((link, index) => {
    const item = headerItems[index]
    if (!item) return
    renderHeaderLinkContent(link, item)
    link.classList.toggle('active', item.href === currentPath)
    link.classList.toggle('is-disabled', item.enabled === false)
    setupRouteLink(link, item.href)
    item.enabled === false ? disableLink(link) : link.setAttribute('href', '#')
  })

  document.querySelectorAll('.fara-menu nav .nav-link').forEach((link, index) => {
    const item = siteData.navigation[index]
    if (!item) return
    link.querySelector('.text-content span').textContent = item.label
    link.classList.toggle('active', item.href === currentPath)
    link.classList.toggle('is-disabled', item.enabled === false)
    link.closest('li')?.classList.toggle('fara-menu-hidden', item.showInMenu === false)
    setupRouteLink(link, item.href)
    item.enabled === false ? disableLink(link) : link.setAttribute('href', '#')
  })

  document.querySelectorAll('.fara-menu .terms-link a').forEach(link => {
    if (!configureLegalLink(link) && siteData.menuSettings.enableLegalLinks === false) disableLink(link)
  })
  document.querySelectorAll('#footer .legals-links a').forEach(link => configureLegalLink(link))
  setupHover()
  setupPanelTheme()
  syncNavbar()
}
