import { siteData } from './data/siteData.js'

const setText = (selector, value, index = 0) => {
  const element = document.querySelectorAll(selector)[index]
  if (element && value) element.textContent = value
}

const ensureNavigationItems = (listSelector) => {
  const list = document.querySelector(listSelector)
  if (!list) return

  while (list.children.length < siteData.navigation.length) {
    const template = list.lastElementChild
    if (!template) break
    const item = template.cloneNode(true)
    item.querySelector('.active')?.classList.remove('active')
    item.dataset.configGenerated = 'true'
    list.appendChild(item)
  }
}

const animateNavbarTo = (target) => {
  const navList = document.querySelector('#header .container-menu ul')
  const navbar = document.querySelector('#header nav .navbar')
  const label = target?.matches?.('span') ? target : target?.querySelector?.('span')
  if (!navList || !navbar || !label) return

  const labelRect = label.getBoundingClientRect()
  const listRect = navList.getBoundingClientRect()
  const scale = labelRect.width / (navbar.offsetWidth || 1)
  navbar.style.transition = 'transform 600ms cubic-bezier(.2,.8,.2,1)'
  navbar.style.transform = `translate3d(${labelRect.left - listRect.left}px, 0, 0) scaleX(${scale})`
}

const setupGeneratedNavigationHover = () => {
  const activeLabel = () => document.querySelector('#header .nav-link.active span')
  document.querySelectorAll('#header li[data-config-generated="true"] .nav-link').forEach((link) => {
    if (link.dataset.hoverReady) return
    link.dataset.hoverReady = 'true'
    link.addEventListener('mouseenter', () => animateNavbarTo(link))
    link.addEventListener('mouseleave', () => animateNavbarTo(activeLabel()))
    link.addEventListener('focus', () => animateNavbarTo(link))
    link.addEventListener('blur', () => animateNavbarTo(activeLabel()))
  })
}

const replaceLogo = (selector, source, className) => {
  if (!source) return
  const current = document.querySelector(selector)
  if (!current) return
  const image = document.createElement('img')
  image.src = source
  image.alt = siteData.brand.logoText
  image.className = `logo configurable-logo ${className}`
  current.replaceWith(image)
}

const applySiteData = () => {
  document.title = siteData.seo.title
  document.querySelector('meta[name="description"]')?.setAttribute('content', siteData.seo.description)

  ensureNavigationItems('#header .menu-links-w > ul')
  ensureNavigationItems('.montfort-menu nav > ul')

  document.querySelectorAll('#header .menu-links-w .nav-link').forEach((link, index) => {
    const item = siteData.navigation[index]
    if (!item) return
    link.querySelector('span').textContent = item.label
    if (item.href) link.href = item.href
    link.classList.toggle('active', Boolean(item.active))
  })

  document.querySelectorAll('.montfort-menu nav .nav-link').forEach((link, index) => {
    const item = siteData.navigation[index]
    if (!item) return
    link.querySelector('.text-content span').textContent = item.label
    if (item.href) link.href = item.href
    link.classList.toggle('active', Boolean(item.active))
  })
  setupGeneratedNavigationHover()

  setText('main h2', siteData.introduction.title)
  const introParagraphs = document.querySelectorAll('main .description .inner p')
  if (introParagraphs.length) {
    introParagraphs[0].textContent = siteData.introduction.body
    for (let index = 1; index < introParagraphs.length; index += 1) introParagraphs[index].remove()
  }
  setText('main h3', siteData.advantage.title)
  setText('main .fs-h5', siteData.advantage.lead)
  setText('.scroll-to-cta-content-dk span', siteData.hero.scrollLabel)

  document.querySelectorAll('.advantages-container .text-block').forEach((block, index) => {
    const item = siteData.advantage.items[index]
    if (!item) return
    const title = block.querySelector('.title')
    const text = block.querySelector('.read-more .inner p')
    if (title) title.textContent = item.title
    if (text) text.textContent = item.text
  })

  const cta = document.querySelector('main .link-block.energy')
  if (cta) {
    cta.href = siteData.cta.href
    cta.querySelector('.link-block-label').textContent = siteData.cta.label
  }
  setText('#footer .copyright-info p', siteData.footer.copyright)

  replaceLogo('.hero .logo-dk', siteData.brand.desktopLogo, 'logo-dk')
  replaceLogo('.hero .logo-mb', siteData.brand.mobileLogo, 'logo-mb')
}

applySiteData()
document.addEventListener('astro:page-load', applySiteData)
