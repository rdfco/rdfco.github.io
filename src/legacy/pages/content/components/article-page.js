import { create, createFaraMark } from './elements.js'

export const renderArticlePage = (document, article) => {
  const shell = create(document, 'article', 'fara-content-shell fara-article-page')
  shell.append(create(document, 'a', 'fara-article-back', '← Back to News'))
  shell.firstElementChild.href = '/news'; shell.firstElementChild.dataset.faraRoute = '/news'
  shell.append(create(document, 'h1', 'fara-content-title', article.title))
  const hero = create(document, 'div', 'fara-article-hero'); hero.append(createFaraMark(document, article.mark)); shell.append(hero)
  const layout = create(document, 'div', 'fara-article-layout')
  const meta = create(document, 'aside', 'fara-article-meta')
  meta.append(create(document, 'span', '', 'Date'), create(document, 'time', '', article.date), create(document, 'span', '', 'Category'), create(document, 'strong', '', article.category))
  const body = create(document, 'div', 'fara-article-body')
  body.append(create(document, 'p', 'fara-article-lead', article.lead), create(document, 'p', '', article.summary))
  article.sections.forEach(section => {
    body.append(create(document, 'h2', '', section.heading))
    section.paragraphs.forEach(paragraph => body.append(create(document, 'p', '', paragraph)))
  })
  layout.append(meta, body); shell.append(layout)
  return [shell]
}
