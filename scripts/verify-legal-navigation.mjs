import puppeteer from 'puppeteer-core'

const baseUrl = process.env.SITE_URL || 'http://127.0.0.1:4173'
const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
  args: ['--no-sandbox', '--disable-gpu-sandbox'],
})

const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900 })
const errors = []
page.on('pageerror', error => errors.push(error.message))
page.on('requestfailed', request => errors.push(`${request.failure()?.errorText}: ${request.url()}`))

try {
  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle0', timeout: 60_000 })
  await page.waitForSelector('iframe.legacy-site[data-status], iframe.legacy-site', { timeout: 10_000 }).catch(() => {})
  await page.waitForFunction(() => document.querySelector('.legacy-shell')?.dataset.status === 'ready', { timeout: 15_000 })

  let frame = page.frames().find(candidate => candidate.url().includes('/legacy/fort-energy/index.html'))
  if (!frame) throw new Error('Legacy site frame was not found')
  await frame.click('#header .menu-cta')
  await frame.waitForSelector('.montfort-menu.active', { timeout: 5_000 })

  const legalLinks = await frame.$$eval('.montfort-menu .terms-link a', links => links.map(link => ({
    label: link.textContent.trim(),
    route: link.dataset.faraRoute,
    href: link.getAttribute('href'),
    color: getComputedStyle(link).color,
  })))
  const privacy = await frame.$('.montfort-menu .terms-link a[data-fara-route="/privacy-policy"]')
  if (!privacy) throw new Error('Privacy Policy menu link is not configured')
  const legalHrefsAreRoutes = legalLinks
    .filter(link => link.route)
    .every(link => link.href === link.route)
  if (!legalHrefsAreRoutes) throw new Error('Legal menu hrefs are not real routes')
  await privacy.hover()
  await privacy.click()
  await page.waitForFunction(() => location.pathname === '/privacy-policy', { timeout: 8_000 })
  await frame.waitForSelector('.fara-legal-page', { timeout: 8_000 })
  const privacyPath = new URL(page.url()).pathname

  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle0', timeout: 60_000 })
  await page.waitForFunction(() => document.querySelector('.legacy-shell')?.dataset.status === 'ready', { timeout: 15_000 })
  frame = page.frames().find(candidate => candidate.url().includes('/legacy/fort-energy/index.html'))
  await frame.click('#header .menu-cta')
  await frame.waitForSelector('.montfort-menu.active', { timeout: 5_000 })
  await frame.click('.montfort-menu .terms-link a[data-fara-route="/terms-of-use"]')
  await page.waitForFunction(() => location.pathname === '/terms-of-use', { timeout: 8_000 })
  await frame.waitForFunction(() => document.querySelector('.fara-content-title')?.textContent.trim() === 'Terms of Use', { timeout: 8_000 })
  const termsPath = new URL(page.url()).pathname

  const favicon = await page.$eval('link[rel~="icon"]', link => link.getAttribute('href'))
  const faviconStatus = await page.evaluate(async href => (await fetch(href)).status, favicon)

  await page.goto(`${baseUrl}/news`, { waitUntil: 'networkidle0', timeout: 60_000 })
  await page.waitForFunction(() => document.querySelector('.legacy-shell')?.dataset.status === 'ready', { timeout: 15_000 })
  const newsFrame = page.frames().find(candidate => candidate.url().includes('/legacy/fort-energy/index.html'))
  await newsFrame.waitForSelector('.fara-news-page', { timeout: 8_000 })
  const firstArticleRoute = await newsFrame.$eval('.fara-news-card', link => link.dataset.faraRoute)
  await newsFrame.click('.fara-news-card')
  await page.waitForFunction(route => location.pathname === route, { timeout: 8_000 }, firstArticleRoute)
  await newsFrame.waitForSelector('.fara-article-page', { timeout: 8_000 })

  console.log(JSON.stringify({ legalLinks, legalHrefsAreRoutes, privacyPath, termsPath, favicon, faviconStatus, newsPath: '/news', articlePath: firstArticleRoute, errors }, null, 2))
  if (faviconStatus !== 200 || errors.length) process.exitCode = 1
} finally {
  await browser.close()
}
