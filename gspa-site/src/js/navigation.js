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
  const navList = document.querySelector('#header .container-menu ul')
  const navbar = document.querySelector('#header nav .navbar')
  const label = target?.matches?.('span') ? target : target?.querySelector?.('span')
  if (!navList || !navbar || !label) return
  const labelRect = label.getBoundingClientRect()
  const listRect = navList.getBoundingClientRect()
  navbar.style.transition = 'transform 600ms cubic-bezier(.2,.8,.2,1)'
  navbar.style.setProperty('--fara-navbar-transform', `translate3d(${labelRect.left - listRect.left}px, 0, 0) scaleX(${labelRect.width / (navbar.offsetWidth || 1)})`)
}

const setupHover = () => {
  const activeLabel = () => document.querySelector('#header .nav-link.active span')
  const navList = document.querySelector('#header .menu-links-w > ul')
  if (navList && !navList.dataset.activeReturnReady) {
    navList.dataset.activeReturnReady = 'true'
    navList.addEventListener('mouseleave', () => window.setTimeout(() => animateNavbarTo(activeLabel()), 120))
    navList.addEventListener('focusout', event => {
      if (!navList.contains(event.relatedTarget)) window.setTimeout(() => animateNavbarTo(activeLabel()), 120)
    })
  }
  document.querySelectorAll('#header .menu-links-w .nav-link').forEach(link => {
    if (link.dataset.hoverReady) return
    link.dataset.hoverReady = 'true'
    link.addEventListener('mouseenter', () => animateNavbarTo(link))
    link.addEventListener('focus', () => animateNavbarTo(link))
  })
}

const syncNavbarToActiveItem = () => {
  const activeLink = document.querySelector('#header .menu-links-w .nav-link.active')
  if (!activeLink) return
  window.requestAnimationFrame(() => animateNavbarTo(activeLink))
}

const disableLink = link => {
  link.removeAttribute('href')
  link.setAttribute('aria-disabled', 'true')
  link.setAttribute('tabindex', '-1')
  if (link.dataset.disabledReady) return
  link.dataset.disabledReady = 'true'
  link.addEventListener('click', event => event.preventDefault())
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
  link.dataset.faraRoute = route
  link.removeAttribute('aria-disabled')
  link.removeAttribute('tabindex')
  return true
}

export const renderNavigation = (siteData, currentPath = '/') => {
  ensureItems('#header .menu-links-w > ul', siteData.navigation.length)
  ensureItems('.montfort-menu nav > ul', siteData.navigation.length)

  document.querySelectorAll('#header .menu-links-w .nav-link').forEach((link, index) => {
    const item = siteData.navigation[index]
    if (!item) return
    link.querySelector('span').textContent = item.label
    link.classList.toggle('active', item.href === currentPath)
    link.classList.toggle('is-disabled', item.enabled === false)
    link.dataset.faraRoute = item.href
    item.enabled === false ? disableLink(link) : link.setAttribute('href', item.href || '/')
  })

  document.querySelectorAll('.montfort-menu nav .nav-link').forEach((link, index) => {
    const item = siteData.navigation[index]
    if (!item) return
    link.querySelector('.text-content span').textContent = item.label
    link.classList.toggle('active', item.href === currentPath)
    link.classList.toggle('is-disabled', item.enabled === false)
    link.closest('li')?.classList.toggle('fara-menu-hidden', item.showInMenu === false)
    link.dataset.faraRoute = item.href
    item.enabled === false ? disableLink(link) : link.setAttribute('href', item.href || '/')
  })

  document.querySelectorAll('.montfort-menu .terms-link a').forEach(link => {
    if (!configureLegalLink(link) && siteData.menuSettings.enableLegalLinks === false) disableLink(link)
  })
  document.querySelectorAll('#footer .legals-links a').forEach(link => configureLegalLink(link))
  setupHover()
  syncNavbarToActiveItem()
}
