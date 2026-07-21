export const renderCurrentPage = page => {
  const pageKey = page.data.key
  const renderedPage = document.querySelector('.fara-route-page')
  if (renderedPage?.dataset.faraPage === pageKey) return
  renderedPage?.remove()
  const legacyMain = document.querySelector('body > main')
  document.body.dataset.faraPage = pageKey
  document.body.classList.toggle('fara-content-route', pageKey !== 'home' && !['knowing-fara', 'solution', 'consulting', 'industries', 'case-studies', 'think-together'].includes(pageKey))
  if (pageKey === 'home') {
    legacyMain?.classList.remove('fara-legacy-main-suspended')
    legacyMain?.removeAttribute('aria-hidden')
    return
  }
  legacyMain?.classList.add('fara-legacy-main-suspended')
  legacyMain?.setAttribute('aria-hidden', 'true')
  const footer = document.querySelector('#footer')
  const rendered = page.render(document)
  if (rendered) footer?.before(rendered)
}
