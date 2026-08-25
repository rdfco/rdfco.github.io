export const renderCurrentPage = page => {
  const pageKey = page.data.key
  const isLegalRoute = pageKey === 'privacy-policy' || pageKey === 'terms-of-use'
  const isContentRoute = pageKey !== 'home'
  const renderedPage = document.querySelector('.fara-route-page')
  const legacyMain = document.querySelector('body > main')
  document.body.dataset.faraPage = pageKey
  document.body.classList.toggle('fara-content-route', isContentRoute)
  document.body.classList.toggle('fara-legal-route', isLegalRoute)
  if (pageKey === 'home') {
    renderedPage?.remove()
    legacyMain?.classList.remove('fara-legacy-main-suspended')
    legacyMain?.removeAttribute('aria-hidden')
    document.querySelector('#canvas-wrapper')?.removeAttribute('aria-hidden')
    document.querySelector('.hero-transition')?.removeAttribute('aria-hidden')
    document.querySelector('.buttons-container')?.removeAttribute('aria-hidden')
    return
  }
  legacyMain?.classList.add('fara-legacy-main-suspended')
  legacyMain?.setAttribute('aria-hidden', 'true')
  document.querySelector('#canvas-wrapper')?.setAttribute('aria-hidden', 'true')
  document.querySelector('.hero-transition')?.setAttribute('aria-hidden', 'true')
  document.querySelector('.buttons-container')?.setAttribute('aria-hidden', 'true')
  if (renderedPage?.dataset.faraPage === pageKey) return
  const footer = document.querySelector('#footer')
  const rendered = page.render(document)
  if (!rendered) {
    renderedPage?.remove()
    return
  }
  const transitionFromLegal =
    isLegalRoute && (renderedPage?.dataset.faraPage === 'privacy-policy' || renderedPage?.dataset.faraPage === 'terms-of-use')
  if (transitionFromLegal) {
    renderedPage.classList.add('fara-route-page--leaving')
    rendered.classList.add('fara-route-page--entering')
    renderedPage.setAttribute('aria-hidden', 'true')
  } else {
    renderedPage?.remove()
  }
  footer?.before(rendered)
  if (transitionFromLegal) {
    window.requestAnimationFrame(() => {
      rendered.classList.remove('fara-route-page--entering')
      window.setTimeout(() => renderedPage.remove(), 760)
    })
  }
}
