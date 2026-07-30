import { page as home } from './home/component.js'
import { page as whoWeAre } from './who-we-are/component.js'
import { page as solution } from './solution/component.js'
import { page as howWeHelp } from './how-we-help/component.js'
import { page as whoWeServe } from './who-we-serve/component.js'
import { page as caseStudies } from './case-studies/component.js'
import { page as thinkTogether } from './think-together/component.js'
import { getContentPage } from './content/component.js'

const routeAliases = {
  '/knowing-fara': 'who-we-are',
  '/consulting': 'how-we-help',
  '/industries': 'who-we-serve',
}

export const pages = { home, 'who-we-are': whoWeAre, solution, 'how-we-help': howWeHelp, 'who-we-serve': whoWeServe, 'case-studies': caseStudies, 'think-together': thinkTogether }
export const getPage = key => pages[key] || pages.home
export const getPageForPath = (pathname, fallbackKey) => getContentPage(pathname) || getPage(routeAliases[pathname] || fallbackKey)
