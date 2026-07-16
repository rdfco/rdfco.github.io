export const createPageComponent = (document, data) => {
  const page = document.createElement('main')
  page.className = 'fara-route-page'
  page.dataset.faraPage = data.key
  page.setAttribute('aria-label', data.title)
  return page
}
