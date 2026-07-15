import { siteData } from './data/siteData.js'
import { validateSiteData } from './data/validateSiteData.js'
import { applySiteData } from './js/apply-site.js'

validateSiteData(siteData)

const refreshSite = () => {
  applySiteData(siteData)
  document.documentElement.dataset.faraReady = 'true'
  window.setTimeout(() => applySiteData(siteData), 150)
  window.setTimeout(() => applySiteData(siteData), 800)
}

// Do not allow retired source-brand links to navigate, even inside the sandboxed frame.
document.addEventListener('click', event => {
  const link = event.target.closest?.('a[href]')
  if (!link) return
  const href = link.getAttribute('href') || ''
  if (/mont-fort\.com|fortenergy\.com/i.test(href)) event.preventDefault()
}, true)

refreshSite()
document.addEventListener('astro:page-load', refreshSite)
