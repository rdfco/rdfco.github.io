import { setText } from './core/dom.js'
import { renderFooter } from './components/footer.js'
import { renderHero } from './components/hero.js'
import { renderSections } from './components/sections.js'
import { renderNavigation } from './navigation.js'

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

export const applySiteData = siteData => {
  document.title = siteData.seo.title
  document.querySelector('meta[name="description"]')?.setAttribute('content', siteData.seo.description)
  renderNavigation(siteData)
  updateLegacyContent(siteData)
  renderHero(siteData)
  renderSections(siteData)
  renderFooter(siteData.footer)
}
