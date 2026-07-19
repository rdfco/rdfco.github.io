import { createPageComponent } from '../shared/page-component.js'
import { legalPages } from './data/legal-data.js'
import { articles, getArticle } from './data/news-data.js'
import { renderLegalPage } from './components/legal-page.js'
import { renderNewsPage } from './components/news-page.js'
import { renderArticlePage } from './components/article-page.js'

export const getContentPage = pathname => {
  const [path, query = ''] = pathname.split('?')
  const key = path.slice(1)
  if (legalPages[key]) return { data: legalPages[key], render: document => createPageComponent(document, legalPages[key], renderLegalPage) }
  if (path === '/news') {
    const pageNumber = new URLSearchParams(query).get('page') === '2' ? 2 : 1
    const data = { key: 'news', href: pathname, title: 'News', page: pageNumber, items: pageNumber === 1 ? articles.slice(0, 12) : articles.slice(12) }
    return { data, render: document => createPageComponent(document, data, renderNewsPage) }
  }
  if (path.startsWith('/news/')) {
    const article = getArticle(path.slice('/news/'.length))
    if (!article) return null
    const data = { ...article, key: `article-${article.id}`, href: path }
    return { data, render: document => createPageComponent(document, data, (document, value) => renderArticlePage(document, value)) }
  }
  return null
}
