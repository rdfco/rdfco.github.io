import puppeteer from 'puppeteer-core'

const url = process.env.SITE_URL || 'http://127.0.0.1:5173/'
const width = Number(process.env.VIEWPORT_WIDTH || 1920)
const height = Number(process.env.VIEWPORT_HEIGHT || 1080)
const deviceScaleFactor = Number(process.env.DEVICE_SCALE_FACTOR || 1)
const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
  args: ['--no-sandbox', '--disable-gpu-sandbox'],
})

const page = await browser.newPage()
await page.setViewport({ width, height, deviceScaleFactor })
const errors = []
page.on('pageerror', error => errors.push(error.message))
page.on('console', message => {
  if (message.type() === 'error') errors.push(message.text())
})
page.on('requestfailed', request => errors.push(`${request.failure()?.errorText}: ${request.url()}`))

const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

try {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 })
  await page.waitForSelector('iframe.legacy-site', { timeout: 30_000 })
  let frame
  for (let attempt = 0; attempt < 30 && !frame; attempt += 1) {
    frame = page.frames().find(candidate => candidate.url().includes('/legacy/main/index.html'))
    if (!frame) await wait(500)
  }
  if (!frame) throw new Error('Legacy frame did not load')
  await frame.waitForSelector('html[data-fara-ready="true"]', { timeout: 60_000 })

  const waitForShell = async () => {
    await page.waitForFunction(() => document.querySelector('.legacy-shell')?.dataset.status === 'ready', { timeout: 60_000 })
    await wait(600)
  }

  const navigateViaMenu = async (pathname, selector, expectedPage) => {
    await frame.evaluate(() => document.querySelector('#header .menu-cta')?.click())
    await frame.waitForSelector('.fara-menu.active', { visible: true, timeout: 15_000 })
    await frame.click(selector)
    await page.waitForFunction(path => `${location.pathname}${location.search}` === path, { timeout: 60_000 }, pathname)
    await frame.waitForFunction(pageKey => document.body.dataset.faraPage === pageKey, { timeout: 60_000 }, expectedPage)
    await waitForShell()
  }

  const inspectHome = async sourceRoute => {
    await page.mouse.move(width / 2, height / 2)
    for (let index = 0; index < 28; index += 1) {
      await page.mouse.wheel({ deltaY: 110 })
      await wait(18)
    }
    await wait(900)
    return frame.evaluate(route => {
      const canvas = document.querySelector('#canvas-wrapper canvas')
      const main = document.querySelector('body > main')
      const grid = main?.querySelector('#grid')
      const sections = grid?.querySelector('.fara-sections')
      const footer = document.querySelector('#footer')
      const gridRect = grid?.getBoundingClientRect()
      const sectionsRect = sections?.getBoundingClientRect()
      const footerRect = footer?.getBoundingClientRect()
      const documentHeight = document.documentElement.scrollHeight
      const footerBottom = footerRect ? footerRect.bottom + window.scrollY : 0
      const requiredStageHeight = sectionsRect && gridRect
        ? Math.ceil(sectionsRect.bottom - gridRect.top + 80)
        : 0
      const stageMinHeight = Number.parseFloat(grid?.style.minHeight || '0')
      return {
        sourceRoute: route,
        page: document.body.dataset.faraPage,
        routePageCount: document.querySelectorAll('.fara-route-page').length,
        mainSuspended: main?.classList.contains('fara-legacy-main-suspended'),
        stageMinHeight,
        requiredStageHeight,
        footerAfterSections: Boolean(footerRect && sectionsRect && footerRect.top + window.scrollY >= sectionsRect.bottom + window.scrollY + 79),
        trailingBlackSpace: Math.max(0, Math.round(documentHeight - footerBottom)),
        scrollY: Math.round(window.scrollY),
        maxScroll: documentHeight - window.innerHeight,
        canvas: canvas ? {
          backingWidth: canvas.width,
          backingHeight: canvas.height,
          clientWidth: canvas.clientWidth,
          clientHeight: canvas.clientHeight,
          expectedWidth: Math.round(canvas.clientWidth * window.devicePixelRatio),
          expectedHeight: Math.round(canvas.clientHeight * window.devicePixelRatio),
        } : null,
      }
    }, sourceRoute)
  }

  const scenarios = [
    ['/think-together', '.fara-menu [data-fara-route="/think-together"]', 'think-together'],
    ['/terms-of-use', '.fara-menu [data-fara-route="/terms-of-use"]', 'terms-of-use'],
    ['/privacy-policy', '.fara-menu [data-fara-route="/privacy-policy"]', 'privacy-policy'],
  ]
  const results = []
  for (const [pathname, selector, pageKey] of scenarios) {
    await navigateViaMenu(pathname, selector, pageKey)
    await navigateViaMenu('/', '.fara-menu [data-fara-section-route="/"]', 'home')
    results.push(await inspectHome(pathname))
  }

  const failures = results.flatMap(result => {
    const scenarioFailures = []
    if (result.page !== 'home') scenarioFailures.push('body did not settle on home')
    if (result.routePageCount !== 0) scenarioFailures.push(`${result.routePageCount} routed pages remained mounted`)
    if (result.mainSuspended) scenarioFailures.push('legacy main remained suspended')
    if (result.stageMinHeight < result.requiredStageHeight - 1) scenarioFailures.push('home stage is shorter than its sections')
    if (!result.footerAfterSections) scenarioFailures.push('footer appeared before the final home section')
    if (result.trailingBlackSpace > 2) scenarioFailures.push(`${result.trailingBlackSpace}px of document remained after the footer`)
    if (result.scrollY <= 0) scenarioFailures.push('home did not respond to wheel scrolling')
    if (!result.canvas) scenarioFailures.push('WebGL canvas is missing')
    if (result.canvas && (
      result.canvas.backingWidth !== result.canvas.expectedWidth
      || result.canvas.backingHeight !== result.canvas.expectedHeight
    )) scenarioFailures.push('WebGL backing resolution is below native viewport resolution')
    return scenarioFailures.map(message => `${result.sourceRoute}: ${message}`)
  })

  console.log(JSON.stringify({ viewport: { width, height, deviceScaleFactor }, results, errors, failures }, null, 2))
  if (failures.length || errors.length) process.exitCode = 1
} finally {
  await browser.close()
}
