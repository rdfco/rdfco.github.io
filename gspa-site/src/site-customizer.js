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

const createExpandableCard = ({ title, text }, modifier = '') => {
  const card = document.createElement('article')
  card.className = `fara-card ${modifier}`.trim()

  const heading = document.createElement('h3')
  heading.textContent = title
  const copy = document.createElement('p')
  copy.textContent = text
  const button = document.createElement('button')
  button.type = 'button'
  button.className = 'fara-expand'
  button.setAttribute('aria-label', `Read more about ${title}`)
  button.setAttribute('aria-expanded', 'false')
  button.innerHTML = '<span></span>'

  button.addEventListener('click', () => {
    const expanded = card.classList.toggle('expanded')
    const lineHeight = Number.parseFloat(getComputedStyle(copy).lineHeight) || 27
    const collapsedHeight = lineHeight * 4
    copy.style.maxHeight = `${expanded ? copy.scrollHeight : collapsedHeight}px`
    button.setAttribute('aria-expanded', String(expanded))
  })

  card.append(heading, copy, button)
  return card
}

const renderFaraSections = () => {
  const grid = document.querySelector('main #grid')
  const content = siteData.faraSections
  if (!grid || !content) return

  document.querySelector('.hero .scroll-to-cta')?.classList.add('fara-hidden')
  grid.querySelector(':scope > h2')?.classList.add('fara-hidden')
  grid.querySelector(':scope > .description')?.classList.add('fara-hidden')
  grid.querySelector('.icon-wrapper')?.classList.add('fara-hidden')
  grid.querySelector('.separator')?.classList.add('fara-hidden')
  grid.querySelector('.advantages-informations')?.classList.add('fara-hidden')
  grid.querySelector('.advantages-container')?.classList.add('fara-hidden')
  grid.lastElementChild?.classList.add('fara-hidden')

  let sections = grid.querySelector('.fara-sections')
  if (sections) sections.remove()
  sections = document.createElement('div')
  sections.className = 'fara-sections'

  const about = document.createElement('section')
  about.className = 'fara-row fara-about'
  const aboutTitle = document.createElement('h2')
  aboutTitle.textContent = siteData.introduction.title
  const aboutCopy = createExpandableCard({ title: '', text: siteData.introduction.body }, 'about-copy')
  about.append(aboutTitle, aboutCopy)

  const solutions = document.createElement('section')
  solutions.className = 'fara-row fara-solutions'
  const solutionsHeader = document.createElement('header')
  solutionsHeader.innerHTML = `<h2>${siteData.advantage.title}</h2><p>${siteData.advantage.lead}</p>`
  const solutionsGrid = document.createElement('div')
  solutionsGrid.className = 'fara-card-grid solutions-grid'
  content.solutions.forEach(item => solutionsGrid.appendChild(createExpandableCard(item)))
  solutions.append(solutionsHeader, solutionsGrid)

  const ai = document.createElement('section')
  ai.className = 'fara-row fara-ai'
  const aiHeader = document.createElement('header')
  aiHeader.innerHTML = `<h2>${content.ai.title}</h2><p>${content.ai.subtitle}</p>`
  ai.append(aiHeader, createExpandableCard({ title: '', text: content.ai.text }, 'ai-copy'))

  const industries = document.createElement('section')
  industries.className = 'fara-row fara-industries'
  const industriesHeader = document.createElement('header')
  industriesHeader.innerHTML = '<h2>Industries FARA Serves:</h2><p>FARA Industries</p>'
  const industriesGrid = document.createElement('div')
  industriesGrid.className = 'fara-card-grid industries-grid'
  content.industries.forEach(item => industriesGrid.appendChild(createExpandableCard(item)))
  industries.append(industriesHeader, industriesGrid)

  sections.append(about, solutions, ai, industries)
  grid.appendChild(sections)
}

const renderHeroCopy = () => {
  document.querySelectorAll('.hero .logo').forEach((logo) => {
    if (logo.classList.contains('fara-hero-copy')) return
    const copy = document.createElement('div')
    copy.className = `${logo.className.baseVal || logo.className} fara-hero-copy`
    const title = document.createElement('h1')
    title.textContent = siteData.hero.title
    const subtitle = document.createElement('p')
    subtitle.textContent = siteData.hero.subtitle
    copy.append(title, subtitle)
    logo.replaceWith(copy)
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

  renderHeroCopy()
  renderFaraSections()
}

applySiteData()
document.addEventListener('astro:page-load', applySiteData)
