const paragraphs = [
  'FARA is not a single-dimensional consultancy. We are an interconnected ecosystem shaped by rigorous advanced research and deepened through cross-sector collaboration across industries, geographies, and disciplines.',
  'Over the years, we have evolved into a trusted global partner for innovation, working alongside organizations that refuse to settle for incremental progress. Our standing as a certified partner of ITONICS and Brightidea is not a badge of prestige; it is a testament to our commitment to operational excellence in innovation management.',
  'FARA value extends far beyond tools. At FARA, we do not simply consult; we architect. We design and build innovation systems that transform raw ideas into engines of sustainable growth.',
  'We make the future happen; not in abstract theory, but in tangible outcomes. One breakthrough at a time, we partner with our clients to turn possibility into performance, and vision into value.',
]

const capabilities = [
  'AI agent',
  'Digital and AI transformation',
  'Innovation management system',
  'Technology Road Map',
  'Digital transformation',
  'Smart Factory',
]

const solutions = [
  {
    title: 'INCEPTION BY FARA',
    text: 'A strategic solution for assessing, designing, and implementing innovation management systems aligned with ISO 56000. Inception helps organizations build scalable innovation infrastructures, boost internal engagement, and unlock long-term value, starting with a low-cost entry point.',
  },
  {
    title: 'INFINITY BY FARA',
    text: 'A strategic solution for assessing, designing, and implementing innovation management systems aligned with ISO 56000. Infinity helps organizations build scalable innovation infrastructures, boost internal engagement, and unlock long-term value, starting with a low-cost entry point.',
  },
  {
    title: 'INSIGHT BY FARA',
    text: 'A strategic solution for assessing, designing, and implementing innovation management systems aligned with ISO 56000. Insight helps organizations build scalable innovation infrastructures, boost internal engagement, and unlock long-term value, starting with a low-cost entry point.',
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
  const kicker = document.createElement('p')
  kicker.className = 'fara-page-kicker'
  kicker.textContent = 'BY FARA'
  section.append(kicker)
  appendTitle(document, section, ['BY AI & Technology', 'Reinvent your business'])
  appendCopy(document, section, paragraphs)
  return section
}

const createCapabilities = document => {
  const section = document.createElement('section')
  section.className = 'fara-page-section fara-capabilities'
  appendTitle(document, section, ['FARA capabilities', 'For reinvention'])
  const grid = document.createElement('div')
  grid.className = 'fara-capability-grid'
  capabilities.forEach(item => {
    const card = document.createElement('article')
    card.className = 'fara-capability-card'
    card.textContent = item
    grid.append(card)
  })
  section.append(grid)
  return section
}

const createSolutions = document => {
  const section = document.createElement('section')
  section.className = 'fara-page-section fara-solutions'
  appendTitle(document, section, ['FARA Solution', 'And Ecosystem'])
  const grid = document.createElement('div')
  grid.className = 'fara-solution-grid'
  solutions.forEach(solution => {
    const card = document.createElement('article')
    card.className = 'fara-solution-card'
    const title = document.createElement('h3')
    title.textContent = solution.title
    const text = document.createElement('p')
    text.textContent = solution.text
    card.append(title, text)
    grid.append(card)
  })
  section.append(grid)
  return section
}

const render = document => {
  const page = document.createElement('main')
  page.className = 'fara-route-page fara-how-page'
  page.dataset.faraPage = 'how-we-help'
  page.setAttribute('aria-label', 'How we help')
  const shell = document.createElement('div')
  shell.className = 'fara-page-shell'
  shell.append(createHero(document), createCapabilities(document), createSolutions(document))
  page.append(shell)
  return page
}

export const page = {
  data: { key: 'how-we-help', title: 'How we help', href: '/how-we-help' },
  render,
}
