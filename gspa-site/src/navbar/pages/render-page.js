import { getPage } from './registry.js'

export const renderCurrentPage = pageKey => {
  const renderedPage = document.querySelector('.fara-route-page')
  if (renderedPage?.dataset.faraPage === pageKey) return
  renderedPage?.remove()
  const legacyMain = document.querySelector('body > main')
  const page = getPage(pageKey)
  document.body.dataset.faraPage = pageKey
  if (pageKey === 'home') {
    legacyMain?.removeAttribute('hidden')
    return
  }
  legacyMain?.setAttribute('hidden', '')
  const footer = document.querySelector('#footer')
  footer?.before(page.render(document))
}
