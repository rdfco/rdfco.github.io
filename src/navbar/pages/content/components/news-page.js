import { create, createFaraMark } from './elements.js'

const arrow = direction => direction === 'next' ? '→' : '←'

export const renderNewsPage = (document, data) => {
  const shell = create(document, 'section', 'fara-content-shell fara-news-page')
  shell.append(create(document, 'h1', 'fara-content-title', 'News'))
  const grid = create(document, 'div', 'fara-news-grid')
  data.items.forEach(article => {
    const link = create(document, 'a', 'fara-news-card')
    link.href = `/news/${article.slug}`
    link.dataset.faraRoute = link.getAttribute('href')
    const media = create(document, 'div', 'fara-news-media')
    media.append(createFaraMark(document, article.mark))
    link.append(media, create(document, 'time', '', article.date), create(document, 'h2', '', article.title))
    grid.append(link)
  })
  const pagination = create(document, 'nav', 'fara-pagination')
  pagination.setAttribute('aria-label', 'News pagination')
  const first = create(document, 'a', 'fara-page-word', 'First'); first.href = '/news'; first.dataset.faraRoute = '/news'
  const previous = create(document, 'a', 'fara-page-arrow', arrow('previous')); previous.href = '/news'; previous.dataset.faraRoute = '/news'; previous.setAttribute('aria-label', 'Previous page')
  const current = create(document, 'span', 'fara-page-current', String(data.page))
  const next = create(document, 'a', 'fara-page-arrow', arrow('next')); next.href = '/news?page=2'; next.dataset.faraRoute = '/news?page=2'; next.setAttribute('aria-label', 'Next page')
  const last = create(document, 'a', 'fara-page-word', 'Last'); last.href = '/news?page=2'; last.dataset.faraRoute = '/news?page=2'
  if (data.page === 1) { previous.classList.add('is-disabled'); previous.removeAttribute('data-fara-route') }
  if (data.page === 2) { next.classList.add('is-disabled'); next.removeAttribute('data-fara-route') }
  pagination.append(first, previous, current, next, last)
  shell.append(grid, pagination)
  return [shell]
}
