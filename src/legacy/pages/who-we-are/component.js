import { data } from './data.js'

const partnerLogos = [
  { name: 'Sharjah Research Technology and Innovation Park', src: '/assets/who-we-are/partners/Sharjah.svg' },
  { name: 'ITONICS', src: '/assets/who-we-are/partners/ITONICS.svg' },
  { name: 'STATISTA', src: '/assets/who-we-are/partners/STATISTA.svg' },
  { name: 'GARTNER', src: '/assets/who-we-are/partners/GARTNER.svg' },
  { name: 'LENS.ORG', src: '/assets/who-we-are/partners/LENS-ORG.svg' },
  { name: 'TREX', src: '/assets/who-we-are/partners/TREX.svg' },
  { name: 'LEAN', src: '/assets/who-we-are/partners/LEAN.svg' },
  { name: 'ALLEANTIA', src: '/assets/who-we-are/partners/ALLEANTIA.svg' },
]

const contentBlocks = [
  {
    kicker: 'BY FARA',
    title: ['From Strategic Insight', 'To Tangible Impact'],
    body: [
      'At FARA, we believe that the future of industrial leadership is not defined by what you know, but by what you build and how quickly you build it. We are not consultants who hand over reports and step away. We are architects of enduring transformation, embedding AI-driven intelligence directly into the operational fabric of your enterprise.',
      'The modern industrial landscape is defined by complexity and rapid technological flux. While many can identify emerging trends, few can translate them into sustainable value. Our approach bridges that divide. We fuse deep strategic consulting with proprietary AI platforms, creating a symbiotic ecosystem where data informs decisions, and decisions evolve with real-time learning.',
    ],
  },
  {
    title: ['FARA AI & Tech Solution', 'For Shaping the Future'],
    body: [
      'At the heart of FARA\'s delivery model lies a suite of advanced, purpose-built AI solutions designed specifically for process-based industrial. These are not generic tools; they are adaptive, learning systems that evolve alongside your business. FARA AI platforms ingest and synthesize vast streams of operational, financial, and market data, delivering predictive insights that empower leaders to make faster, more accurate decisions under uncertainty. Beyond analysis, FARA AI actively identifies inefficiencies, recommends corrective actions, and even automates routine decisions, freeing your talent to focus on high-value, strategic work.',
      'By integrating AI into your innovation management system, we help you detect emerging technologies, assess their relevance, and model their potential impact, turning uncertainty into a structured, repeatable advantage.',
    ],
  },
  {
    title: ['More Than Advisors', 'Co-Creators in Your Journey'],
    body: [
      'True transformation does not happen in isolation. It requires proximity, collaboration, and shared accountability. That is why FARA does not simply prescribe solutions; we build them with you. From the boardroom to the plant floor, we work side-by-side with your teams, embedding our technology directly into your workflows to ensure that change is not just planned; it is executed.',
      'Our dual-engine model combines high-level strategic vision with hands-on implementation. We design systems that enhance human ingenuity, empowering your managers and specialists to navigate uncertainty with confidence. Our objective is not to deliver a static deliverable, but to co-create a dynamic, sustainable capability that outlasts market shifts and management changes. We ensure that your organization does not just keep pace with the future; it defines it.',
    ],
  },
  {
    title: ['16 Years', 'Of Pioneering Partnership'],
    body: [
      'With over fifteen years of deep experience in technology and innovation management, FARA brings proven frameworks, global standards, and a relentless focus on results. We partner with large-scale industrial enterprises to build coherent, data-driven innovation programs that drive continuous improvement, operational excellence, and long-term value creation. We invite you to move beyond traditional consulting.',
      'At FARA, we do not just guide you through change. We stand beside you, ensuring that every insight is activated and every strategy is realized. Together, we shape what comes next.',
    ],
  },
]

const appendTextBlock = (document, parent, block, className = '') => {
  const section = document.createElement('section')
  section.className = `fara-who-section ${className}`.trim()
  if (block.kicker) {
    const kicker = document.createElement('p')
    kicker.className = 'fara-who-kicker'
    kicker.textContent = block.kicker
    section.append(kicker)
  }
  const heading = document.createElement('h2')
  block.title.forEach(line => {
    const span = document.createElement('span')
    span.textContent = line
    heading.append(span)
  })
  const body = document.createElement('div')
  body.className = 'fara-who-copy'
  block.body.forEach(text => {
    const paragraph = document.createElement('p')
    paragraph.textContent = text
    body.append(paragraph)
  })
  section.append(heading, body)
  parent.append(section)
}

const createPartners = document => {
  const section = document.createElement('section')
  section.className = 'fara-who-partners'
  const title = document.createElement('h2')
  title.textContent = 'FARA Empowered by Top Partners'
  const grid = document.createElement('div')
  grid.className = 'fara-who-partner-grid'
  partnerLogos.forEach(partner => {
    const card = document.createElement('button')
    card.type = 'button'
    card.className = 'fara-who-partner-card'
    card.setAttribute('aria-label', partner.name)
    const img = document.createElement('img')
    img.src = partner.src
    img.alt = partner.name
    img.loading = 'lazy'
    card.append(img)
    grid.append(card)
  })
  section.append(title, grid)
  return section
}

const createImageSection = document => {
  const section = document.createElement('section')
  section.className = 'fara-who-image-section'
  const img = document.createElement('img')
  img.src = '/assets/who-we-are/INSIDER-INTELLIGENCE.webp'
  img.alt = 'Insider Intelligence'
  img.loading = 'lazy'
  section.append(img)
  return section
}

const createHistory = document => {
  const section = document.createElement('section')
  section.className = 'fara-who-history'
  const header = document.createElement('header')
  const dot = document.createElement('span')
  dot.setAttribute('aria-hidden', 'true')
  const heading = document.createElement('h2')
  heading.textContent = 'History'
  header.append(dot, heading)

  const scrollArea = document.createElement('div')
  scrollArea.className = 'fara-who-history-scroll'
  const image = document.createElement('img')
  image.src = '/assets/who-we-are/history/History-Light.webp'
  image.alt = 'FARA history timeline'
  image.draggable = false
  image.loading = 'lazy'
  scrollArea.append(image)

  const rangeWrap = document.createElement('div')
  rangeWrap.className = 'fara-who-history-range-wrap'
  const range = document.createElement('input')
  range.className = 'fara-who-history-range'
  range.type = 'range'
  range.min = '0'
  range.max = '100'
  range.value = '0'
  range.setAttribute('aria-label', 'Scroll history timeline')
  rangeWrap.append(range)

  const drag = { active: false, startX: 0, scrollLeft: 0 }
  const updateProgress = () => {
    const scrollableWidth = scrollArea.scrollWidth - scrollArea.clientWidth
    range.value = scrollableWidth ? String((scrollArea.scrollLeft / scrollableWidth) * 100) : '0'
  }
  range.addEventListener('input', () => {
    const scrollableWidth = scrollArea.scrollWidth - scrollArea.clientWidth
    scrollArea.scrollLeft = (scrollableWidth * Number(range.value)) / 100
  })
  scrollArea.addEventListener('scroll', updateProgress, { passive: true })
  scrollArea.addEventListener('pointerdown', event => {
    drag.active = true
    drag.startX = event.clientX
    drag.scrollLeft = scrollArea.scrollLeft
    scrollArea.classList.add('is-dragging')
    scrollArea.setPointerCapture?.(event.pointerId)
  })
  scrollArea.addEventListener('pointermove', event => {
    if (!drag.active) return
    scrollArea.scrollLeft = drag.scrollLeft - (event.clientX - drag.startX)
    updateProgress()
  })
  const stopDrag = event => {
    drag.active = false
    scrollArea.classList.remove('is-dragging')
    if (scrollArea.hasPointerCapture?.(event.pointerId)) scrollArea.releasePointerCapture(event.pointerId)
  }
  scrollArea.addEventListener('pointerup', stopDrag)
  scrollArea.addEventListener('pointercancel', stopDrag)
  scrollArea.addEventListener('pointerleave', stopDrag)

  section.append(header, scrollArea, rangeWrap)
  return section
}

const render = document => {
  const page = document.createElement('main')
  page.className = 'fara-route-page fara-who-page'
  page.dataset.faraPage = data.key
  page.setAttribute('aria-label', data.title)
  const shell = document.createElement('div')
  shell.className = 'fara-who-shell'
  appendTextBlock(document, shell, contentBlocks[0], 'fara-who-section--hero')
  shell.append(createPartners(document))
  appendTextBlock(document, shell, contentBlocks[1])
  shell.append(createImageSection(document))
  appendTextBlock(document, shell, contentBlocks[2])
  shell.append(createHistory(document))
  appendTextBlock(document, shell, contentBlocks[3])
  page.append(shell)
  return page
}

export const page = { data, render }
