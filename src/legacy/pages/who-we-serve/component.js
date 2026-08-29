import { whoWeServeImages } from '../../../assets'

const approach = [
  'FARA has a collaborative approach to Technology Development. What truly distinguishes FARA is our philosophy of partnership in execution. We do not deliver strategies from a distance and leave implementation to others.',
  'From the very first diagnostic to the final deployment, we work alongside your teams, co-creating, co-developing, and co-owning the journey.',
  'FARA AI solutions, innovation platforms, and strategic frameworks are not imposed upon your organization; they are built with your people, for your context, and embedded into your daily operations.',
  'This is not theoretical consulting. This is transformation delivered, sustained, and continuously refined with you, every step of the way.',
]

const industries = [
  {
    title: 'Oil & Gas',
    text: 'In oil and gas, innovation is not a luxury; it is survival. FARA combines deep tech expertise with a pragmatic ear for real-world challenges, helping leaders turn global best practices into strategies that pay off across upstream, midstream, and downstream operations.',
  },
  {
    title: 'Metal',
    text: 'In metals, the margin between leading and lagging is razor thin. FARA helps teams spot innovation opportunities, modernize legacy processes, and adopt smart technologies that work on the shop floor, not only in theory.',
  },
  {
    title: 'Manufacture',
    text: 'In manufacturing, every second counts and every defect costs. FARA helps uncover opportunities hidden in operations, modernize outdated processes, and adopt practical smart technologies that boost throughput, reduce downtime, and improve quality.',
  },
  {
    title: 'Automotive',
    text: 'In automotive, the race is about staying relevant. FARA helps navigate electrification, software-defined vehicles, autonomous driving, AI-driven quality systems, R&D acceleration, and supply chain complexity with practical roadmaps that create value.',
  },
  {
    title: 'Health',
    text: 'In healthcare, innovation is about being right. FARA helps organizations use AI, data analytics, and digital health technologies to improve patient outcomes, streamline clinical workflows, and reduce operational burdens without compromising safety or trust.',
  },
]

const businessTypes = [
  {
    title: 'Innovation-base business',
    text: 'For organizations whose competitive advantage is rooted in continuous creation of new products, services, or business models, innovation is the core operating system. FARA helps transform inventive capacity into sustainable, scalable advantage across the entire innovation lifecycle.',
  },
  {
    title: 'Process-based Business',
    text: 'For process-based businesses, operational excellence, supply chain integrity, and production efficiency define competitive advantage. FARA reimagines core operations through systemic, AI-enabled transformation where even marginal efficiency gains can create significant impact.',
  },
  {
    title: 'Manufactural-based Business',
    text: 'For manufacturing-based businesses, success means producing more, faster, better, and at lower cost while navigating volatile supply chains, rising material costs, regulation, and decarbonization. FARA helps production ecosystems become intelligent, adaptive, and resilient.',
  },
]

const appendTitle = (document, parent, lines) => {
  const title = document.createElement('h2')
  lines.forEach(line => {
    const span = document.createElement('span')
    span.textContent = line
    title.append(span)
  })
  parent.append(title)
}

const appendCopy = (document, parent, items) => {
  const copy = document.createElement('div')
  copy.className = 'fara-route-copy'
  items.forEach(item => {
    const paragraph = document.createElement('p')
    paragraph.textContent = item
    copy.append(paragraph)
  })
  parent.append(copy)
}

const createHero = document => {
  const section = document.createElement('section')
  section.className = 'fara-page-section fara-page-section--hero'
  appendTitle(document, section, ['FARA Collaborative Approach', 'To Technology Development'])
  appendCopy(document, section, approach)
  return section
}

const createCards = (document, className, items) => {
  const grid = document.createElement('div')
  grid.className = className
  items.forEach(item => {
    const card = document.createElement('article')
    card.className = 'fara-serve-card'
    const title = document.createElement('h3')
    title.textContent = item.title
    const text = document.createElement('p')
    text.textContent = item.text
    card.append(title, text)
    grid.append(card)
  })
  return grid
}

const createIndustries = document => {
  const section = document.createElement('section')
  section.className = 'fara-page-section fara-serve-industries'
  appendTitle(document, section, ['FARA segmentation', 'BY Industries'])
  section.append(createCards(document, 'fara-serve-grid fara-serve-grid--industries', industries))
  return section
}

const createImage = (document, src, alt) => {
  const figure = document.createElement('figure')
  figure.className = 'fara-serve-figure'
  const image = document.createElement('img')
  image.src = src
  image.alt = alt
  image.loading = 'lazy'
  figure.append(image)
  return figure
}

const createBusiness = document => {
  const section = document.createElement('section')
  section.className = 'fara-page-section fara-serve-business'
  appendTitle(document, section, ['FARA segmentation', 'By Nature of business'])
  section.append(createCards(document, 'fara-serve-grid fara-serve-grid--business', businessTypes))
  return section
}

const render = document => {
  const page = document.createElement('main')
  page.className = 'fara-route-page fara-serve-page'
  page.dataset.faraPage = 'who-we-serve'
  page.setAttribute('aria-label', 'Who we serve')
  const shell = document.createElement('div')
  shell.className = 'fara-page-shell'
  shell.append(
    createHero(document),
    createIndustries(document),
    createImage(document, whoWeServeImages.provenImpact, 'FARA proven impact'),
    createBusiness(document),
    createImage(document, whoWeServeImages.businessSegmentation, 'FARA business segmentation'),
  )
  page.append(shell)
  return page
}

export const page = {
  data: { key: 'who-we-serve', title: 'Who we serve', href: '/who-we-serve' },
  render,
}
