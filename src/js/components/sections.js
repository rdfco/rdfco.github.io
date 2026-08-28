import { createElement } from '../core/dom.js'
import { createCard } from './card.js'

const hideLegacyContent = grid => {
  document.querySelector('.hero .scroll-to-cta')?.classList.add('fara-hidden')
  grid.querySelector(':scope > h2')?.classList.add('fara-hidden')
  grid.querySelector(':scope > .description')?.classList.add('fara-hidden')
  grid.querySelector('.icon-wrapper')?.classList.add('fara-hidden')
  grid.querySelector('.separator')?.classList.add('fara-hidden')
  grid.querySelector('.advantages-informations')?.classList.add('fara-hidden')
  grid.querySelector('.advantages-container')?.classList.add('fara-hidden')
  grid.lastElementChild?.classList.add('fara-hidden')
}

const createSectionHeader = ({ title, subtitle }) => {
  const header = document.createElement('header')
  header.innerHTML = `<h2>${title}</h2><p>${subtitle}</p>`
  return header
}

let stageResizeFrame = 0

// The home sections are absolutely positioned over the WebGL stage, so they
// do not contribute to the legacy grid's natural height. Re-measure whenever
// their responsive layout changes and whenever Home is restored after a routed
// page; otherwise the footer can keep an old, shorter offset and appear in the
// middle of the scene with an empty black document after it.
export const syncHomeStageHeight = () => {
  const grid = document.querySelector('main #grid')
  const sections = grid?.querySelector('.fara-sections')
  if (!grid || !sections) return
  const safeFooterGap = 80
  const contentBottom = sections.getBoundingClientRect().bottom - grid.getBoundingClientRect().top
  grid.style.minHeight = `${Math.ceil(contentBottom + safeFooterGap)}px`
}

const scheduleHomeStageSync = () => {
  window.cancelAnimationFrame(stageResizeFrame)
  stageResizeFrame = window.requestAnimationFrame(syncHomeStageHeight)
}

const observeHomeStage = sections => {
  if (sections.dataset.faraStageObserved === 'true') return
  sections.dataset.faraStageObserved = 'true'
  if ('ResizeObserver' in window) new ResizeObserver(scheduleHomeStageSync).observe(sections)
  window.addEventListener('resize', scheduleHomeStageSync, { passive: true })
  document.fonts?.ready?.then(scheduleHomeStageSync)
}

export const renderSections = siteData => {
  const grid = document.querySelector('main #grid')
  const content = siteData.faraSections
  if (!grid || !content) return
  hideLegacyContent(grid)
  grid.querySelector('.fara-sections')?.remove()

  const sections = createElement('div', { className: 'fara-sections' })

  const about = createElement('section', { className: 'fara-row fara-about' })
  about.append(
    createElement('h2', { text: siteData.introduction.title }),
    createCard({ title: '', text: siteData.introduction.body, media: siteData.introduction.media }, { modifier: 'about-copy', expandable: false }),
  )

  const solutions = createElement('section', { className: 'fara-row fara-solutions' })
  const solutionsGrid = createElement('div', { className: 'fara-card-grid solutions-grid' })
  content.solutions.filter(item => item.enabled !== false).forEach(item => solutionsGrid.appendChild(createCard(item, { modifier: 'fara-solution-card', expandable: false })))
  solutions.append(createSectionHeader({ title: siteData.advantage.title, subtitle: siteData.advantage.lead }), solutionsGrid)

  const ai = createElement('section', { className: 'fara-row fara-ai' })
  ai.append(
    createSectionHeader({ title: content.ai.title, subtitle: content.ai.subtitle }),
    createCard({ title: '', text: content.ai.text, media: content.ai.media }, { modifier: 'ai-copy', expandable: false }),
  )

  const industries = createElement('section', { className: 'fara-row fara-industries' })
  const industriesGrid = createElement('div', { className: 'fara-card-grid industries-grid' })
  content.industries.filter(item => item.enabled !== false).forEach(item => industriesGrid.appendChild(createCard(item)))
  industries.append(
    createSectionHeader(siteData.sectionLabels.industries),
    industriesGrid,
  )

  const sectionMap = { about, solutions, ai, industries }
  siteData.sectionOrder.forEach(sectionName => {
    if (siteData.sectionVisibility[sectionName] !== false && sectionMap[sectionName]) sections.appendChild(sectionMap[sectionName])
  })
  grid.appendChild(sections)
  observeHomeStage(sections)
  syncHomeStageHeight()
}
