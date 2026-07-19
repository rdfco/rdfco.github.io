export const createPageComponent = (document, data, renderSections) => {
  const page = document.createElement('main')
  page.className = 'fara-route-page'
  page.dataset.faraPage = data.key
  page.setAttribute('aria-label', data.title)
  const sections = renderSections?.(document, data) || []
  if (sections.length === 0) {
    const intro = document.createElement('header')
    intro.className = 'fara-route-intro'
    const title = document.createElement('h1')
    title.textContent = data.title
    intro.append(title)
    if (data.introduction) {
      const description = document.createElement('p')
      description.textContent = data.introduction
      intro.append(description)
    }
    page.append(intro)
  }
  page.append(...sections)
  return page
}
