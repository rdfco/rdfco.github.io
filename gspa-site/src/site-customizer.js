import { siteData } from './data/siteData.js'
import { validateSiteData } from './data/validateSiteData.js'
import { applySiteData } from './js/apply-site.js'

validateSiteData(siteData)

const refreshSite = () => {
  applySiteData(siteData)
  window.setTimeout(() => applySiteData(siteData), 150)
  window.setTimeout(() => applySiteData(siteData), 800)
}

refreshSite()
document.addEventListener('astro:page-load', refreshSite)
