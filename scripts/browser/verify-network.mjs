import puppeteer from 'puppeteer-core'

/*
 * Every request the site makes has to succeed. The generated Astro stylesheet
 * declares hundreds of @font-face rules for files that were never shipped, so
 * reading the bundle makes it look as though the site 404s on fonts. It does
 * not: a face is only fetched when a glyph needs it, and only the shipped ones
 * are ever used. This gate is what makes that a fact rather than an argument -
 * if a style ever starts asking for one of the missing faces, it fails here.
 */

const base = process.env.SITE_URL || 'http://127.0.0.1:5174/'
const routes = ['', 'think-together', 'privacy-policy', 'terms-of-use', 'news']
const homeScrollStops = [800, 1800, 2800, 3800, 4800, 5800, 6400]

const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
  args: ['--no-sandbox', '--disable-gpu-sandbox'],
})
const page = await browser.newPage()

const failures = []
const requested = new Set()
page.on('response', response => {
  const url = response.url()
  requested.add(url)
  if (response.status() >= 400) failures.push(`HTTP ${response.status()} ${url}`)
})
page.on('requestfailed', request => {
  failures.push(`${request.failure()?.errorText} ${request.url()}`)
})
page.on('pageerror', error => failures.push(`pageerror: ${error.message}`))

const pause = ms => new Promise(resolve => setTimeout(resolve, ms))
const waitForReady = () => page.waitForFunction(
  () => document.querySelector('.legacy-shell')?.dataset.status === 'ready',
  { timeout: 120_000 },
)
const legacyFrame = () => page.frames().find(candidate => candidate !== page.mainFrame())

try {
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })

  for (const route of routes) {
    await page.goto(`${base}${route}`, { waitUntil: 'networkidle0', timeout: 120_000 })
    await waitForReady()
    await pause(1_500)
    if (route !== '') continue
    // Walk the whole home document so every chapter and text style is used.
    for (const top of homeScrollStops) {
      await legacyFrame().evaluate(y => window.lenis?.scrollTo(y, { immediate: true, force: true }), top)
      await pause(700)
    }
  }

  const fonts = [...requested].filter(url => /\.(?:woff2?|otf|ttf)(?:\?|$)/.test(url)).sort()
  console.log(JSON.stringify({
    pass: failures.length === 0,
    routes,
    requests: requested.size,
    fontFilesRequested: fonts.map(url => url.replace(base, '/')),
    failures,
  }, null, 2))
  if (failures.length) process.exitCode = 1
} finally {
  await browser.close()
}
