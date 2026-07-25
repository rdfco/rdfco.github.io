export const renderCurrentPage = page => {
  const pageKey = page.data.key
  const staticRouteKeys = ['knowing-fara', 'solution', 'consulting', 'industries', 'case-studies', 'think-together']
  const isStaticRoute = staticRouteKeys.includes(pageKey)
  const isContentRoute = pageKey !== 'home' && !isStaticRoute
  const isLegalRoute = pageKey === 'privacy-policy' || pageKey === 'terms-of-use'
  const renderedPage = document.querySelector('.fara-route-page')
  if (renderedPage?.dataset.faraPage === pageKey) return
  const legacyMain = document.querySelector('body > main')
  document.body.dataset.faraPage = pageKey
  document.body.classList.toggle('fara-content-route', isContentRoute)
  document.body.classList.toggle('fara-legal-route', isLegalRoute)
  if (pageKey === 'home') {
    renderedPage?.remove()
    legacyMain?.classList.remove('fara-legacy-main-suspended')
    legacyMain?.removeAttribute('aria-hidden')
    return
  }
  legacyMain?.classList.add('fara-legacy-main-suspended')
  legacyMain?.setAttribute('aria-hidden', 'true')
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
