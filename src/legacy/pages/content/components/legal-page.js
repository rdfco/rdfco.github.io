import { create } from './elements.js'

export const renderLegalPage = (document, data) => {
  const shell = create(document, 'section', 'fara-content-shell fara-legal-page')
  shell.append(create(document, 'h1', 'fara-content-title', data.title))
  const content = create(document, 'div', 'fara-legal-content')
  content.append(create(document, 'p', 'fara-legal-intro', data.intro))
  data.sections.forEach(([heading, body]) => {
    content.append(create(document, heading.includes('.') ? 'h2' : 'h2', '', heading), create(document, 'p', '', body))
  })
  shell.append(content)
  return [shell]
}
