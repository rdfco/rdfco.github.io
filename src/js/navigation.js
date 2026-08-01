const ensureItems = (listSelector, count) => {
  const list = document.querySelector(listSelector)
  if (!list) return
  while (list.children.length < count) {
    const template = list.lastElementChild
    if (!template) break
    const item = template.cloneNode(true)
    item.querySelector('.active')?.classList.remove('active')
    item.dataset.configGenerated = 'true'
    list.appendChild(item)
  }
  while (list.children.length > count) list.lastElementChild.remove()
}

const animateNavbarTo = target => {
  const navList = document.querySelector('#header .menu-links-w')
  const navbar = document.querySelector('#header nav .navbar')
  const label = target?.matches?.('span') ? target : target?.querySelector?.('span')
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

const animateNavbarFull = () => {
  const navList = document.querySelector('#header .menu-links-w > ul')
  const wrapper = document.querySelector('#header .menu-links-w')
  const navbar = document.querySelector('#header nav .navbar')
  if (!navList || !wrapper || !navbar) return
  const listRect = navList.getBoundingClientRect()
  const wrapperRect = wrapper.getBoundingClientRect()
  navbar.style.opacity = '1'
  navbar.style.transition = 'transform 600ms cubic-bezier(.2,.8,.2,1)'
  navbar.style.setProperty('--fara-navbar-transform', `translate3d(${listRect.left - wrapperRect.left}px, 0, 0) scaleX(${listRect.width / (navbar.offsetWidth || 1)})`)
}

const restoreNavbar = () => {
  const isHome = document.body.dataset.faraPage === 'home'
  const activeLabel = document.querySelector('#header .nav-link.active span')
  isHome ? animateNavbarTo(activeLabel) : animateNavbarFull()
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

const syncNavbar = currentPath => {
  const activeLink = document.querySelector('#header .menu-links-w .nav-link.active')
  scheduleNavbarUpdate(() => currentPath === '/' ? animateNavbarTo(activeLink) : animateNavbarFull())
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
  link.dataset.faraRoute = route
}

const renderHeaderLinkContent = (link, item) => {
  const label = link.querySelector('span')
  if (!label) return
  link.classList.remove('fara-logo-link')
  label.removeAttribute('aria-hidden')
  label.textContent = item.label
}

const setupStaticHeaderLogo = () => {
  const wrapper = document.querySelector('#header .menu-links-w')
  if (!wrapper || wrapper.querySelector('.fara-static-nav-logo')) return

  const logo = document.createElement('a')
  logo.className = 'fara-static-nav-logo'
  logo.href = '#'
  logo.dataset.faraRoute = '/'
  logo.setAttribute('aria-label', 'FARA home')
  logo.innerHTML = `
    <img class="fara-static-nav-logo__image fara-static-nav-logo__image--white" src="/assets/logos/fara-logo0-white.svg" alt="">
    <img class="fara-static-nav-logo__image fara-static-nav-logo__image--black" src="/assets/logos/fara-logo0-black.svg" alt="">
  `
  logo.addEventListener('click', event => {
    event.preventDefault()
    const routeEvent = new CustomEvent('fara:navigate', {
      bubbles: true,
      detail: { href: '/' },
    })
    logo.dispatchEvent(routeEvent)
  })
  wrapper.prepend(logo)
}

const syncStaticHeaderLogo = currentPath => {
  const logo = document.querySelector('#header .fara-static-nav-logo')
  if (logo) {
    logo.classList.toggle('active', currentPath === '/')
  }
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
  setupStaticHeaderLogo()
  ensureItems('#header .menu-links-w > ul', siteData.navigation.length)
  ensureItems('.montfort-menu nav > ul', siteData.navigation.length)
  document.querySelectorAll('#header .menu-links-w > ul > li').forEach(item => { item.dataset.configGenerated = 'true' })
  document.querySelectorAll('.montfort-menu nav > ul > li').forEach(item => { item.dataset.configGenerated = 'true' })

  document.querySelectorAll('#header .menu-links-w .nav-link').forEach((link, index) => {
    const item = siteData.navigation[index]
    if (!item) return
    renderHeaderLinkContent(link, item)
    link.classList.toggle('active', item.href === currentPath)
    link.classList.toggle('is-disabled', item.enabled === false)
    setupRouteLink(link, item.href)
    item.enabled === false ? disableLink(link) : link.setAttribute('href', '#')
  })

  document.querySelectorAll('.montfort-menu nav .nav-link').forEach((link, index) => {
    const item = siteData.navigation[index]
    if (!item) return
    link.querySelector('.text-content span').textContent = item.label
    link.classList.toggle('active', item.href === currentPath)
    link.classList.toggle('is-disabled', item.enabled === false)
    link.closest('li')?.classList.toggle('fara-menu-hidden', item.showInMenu === false)
    setupRouteLink(link, item.href)
    item.enabled === false ? disableLink(link) : link.setAttribute('href', '#')
  })

  document.querySelectorAll('.montfort-menu .terms-link a').forEach(link => {
    if (!configureLegalLink(link) && siteData.menuSettings.enableLegalLinks === false) disableLink(link)
  })
  document.querySelectorAll('#footer .legals-links a').forEach(link => configureLegalLink(link))
  syncStaticHeaderLogo(currentPath)
  setupHover()
  setupPanelTheme()
  syncNavbar(currentPath)
}
