export const createPageComponent = (document, data, renderSections) => {
  const page = document.createElement('main')
  page.className = 'fara-route-page'
  page.dataset.faraPage = data.key
  page.setAttribute('aria-label', data.title)
  const sections = renderSections?.(document, data) || []
  page.append(...sections)
  return page
}
