export const renderSections = (document, data) => data.sections.map(section => {
  const element = document.createElement('section')
  element.className = 'fara-route-section'
  const title = document.createElement('h2')
  title.textContent = section.title
  const body = document.createElement('p')
  body.textContent = section.body
  element.append(title, body)
  return element
})
