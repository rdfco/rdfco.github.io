import { setText } from './core/dom.js'
import { renderHero } from './components/hero.js'
import { renderSections } from './components/sections.js'
import { renderNavigation } from './navigation.js'
import { renderFooter } from './components/footer.js'

const updateLegacyContent = siteData => {
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
}

const renderHomePage = page => {
  const pageKey = page.data.key
  const renderedPage = document.querySelector('.fara-route-page')
  const legacyMain = document.querySelector('body > main')
  document.body.dataset.faraPage = pageKey
  document.body.classList.remove('fara-content-route', 'fara-legal-route')
  renderedPage?.remove()
  legacyMain?.classList.remove('fara-legacy-main-suspended')
  legacyMain?.removeAttribute('aria-hidden')
  document.querySelector('#canvas-wrapper')?.removeAttribute('aria-hidden')
  document.querySelector('.hero-transition')?.removeAttribute('aria-hidden')
  document.querySelector('.buttons-container')?.removeAttribute('aria-hidden')
}

export const applySiteData = async (siteData, currentPage) => {
  document.title = siteData.seo.title
  document.querySelector('meta[name="description"]')?.setAttribute('content', siteData.seo.description)
  document.documentElement.classList.toggle('fara-sound-disabled', siteData.features?.sound === false)
  if (siteData.features?.sound === false) {
    document.querySelectorAll('audio').forEach(audio => audio.pause())
  }
  renderNavigation(siteData, currentPage.data.href)
  renderFooter(siteData)
  if (document.documentElement.dataset.faraStaticContentReady !== 'true') {
    updateLegacyContent(siteData)
    renderHero(siteData)
    renderSections(siteData)
    document.documentElement.dataset.faraStaticContentReady = 'true'
  }
  if (currentPage.data.key === 'home') {
    renderHomePage(currentPage)
  } else {
    const { renderCurrentPage } = await import('../navbar/pages/render-page.js')
    renderCurrentPage(currentPage)
  }
  // Keep the legacy footer layout intact; it is customized separately.
}
