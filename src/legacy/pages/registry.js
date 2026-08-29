import { page as home } from './home/component.js'
import { page as whoWeAre } from './who-we-are/component.js'
import { page as howWeHelp } from './how-we-help/component.js'
import { page as whoWeServe } from './who-we-serve/component.js'
import { page as thinkTogether } from './think-together/component.js'
import { legalPages } from './legal/data.js'
import { renderLegalPage } from './legal/page.js'
import { articles, getArticle } from './news/data.js'
import { renderArticlePage } from './news/article-page.js'
import { renderNewsPage } from './news/index-page.js'
import { createPageComponent } from './shared/page-component.js'

const routeAliases = {
  '/knowing-fara': 'who-we-are',
  '/consulting': 'how-we-help',
  '/industries': 'who-we-serve',
}

export const pages = { home, 'who-we-are': whoWeAre, 'how-we-help': howWeHelp, 'who-we-serve': whoWeServe, 'think-together': thinkTogether }
export const getPage = key => pages[key] || pages.home

// Routes whose page is built from stored documents rather than from a
// component of its own: the two legal pages, the news index and its articles.
const getDocumentPage = pathname => {
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

export const getPageForPath = (pathname, fallbackKey) => getDocumentPage(pathname) || getPage(routeAliases[pathname] || fallbackKey)
