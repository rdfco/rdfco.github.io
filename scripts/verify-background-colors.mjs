import puppeteer from 'puppeteer-core'

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
  args: ['--no-sandbox', '--disable-gpu-sandbox'],
})
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })
const errors = []
page.on('console', message => {
  if (message.type() === 'error') errors.push(message.text())
  if (message.text().includes('Custom WebGL colors failed')) errors.push(message.text())
})
page.on('pageerror', error => errors.push(error.message))

await page.goto(process.env.SITE_URL || 'http://localhost:4174/', { waitUntil: 'networkidle2', timeout: 60000 })
await new Promise(resolve => setTimeout(resolve, 4000))
const frame = page.frames().find(item => item.url().includes('/legacy/fort-energy/index.html'))
if (!frame) throw new Error('Legacy WebGL frame was not loaded')
if (!await frame.$('#canvas-wrapper canvas')) throw new Error('WebGL canvas was not created')

const result = await frame.evaluate(() => ({
  exportsReady: Boolean(window.__FARA_APP_EXPORTS),
  replacementHits: window.__FARA_COLOR_DEBUG?.applied,
  configuredKeys: Object.keys(window.parent.FARA_BACKGROUND_COLORS || {}).filter(key => key !== 'brightness'),
}))
if (!result.exportsReady) errors.push('Custom WebGL exports were not initialized')
if (result.replacementHits?.some(hit => hit !== 1)) errors.push(`Bundle replacements missed: ${result.replacementHits}`)

await (await frame.$('.menu-cta')).click()
await new Promise(resolve => setTimeout(resolve, 500))
const menu = await frame.evaluate(() => {
  const panel = document.querySelector('.montfort-menu')
  const link = panel?.querySelector('[data-fara-route="/solution"]')
  const rect = link?.getBoundingClientRect()
  return {
    active: panel?.classList.contains('active'),
    expanded: document.querySelector('.menu-cta')?.getAttribute('aria-expanded'),
    clickable: Boolean(rect?.width && rect?.height && getComputedStyle(link).pointerEvents !== 'none'),
  }
})
if (!menu.active || menu.expanded !== 'true' || !menu.clickable) errors.push(`Overlay menu failed: ${JSON.stringify(menu)}`)

await browser.close()
if (errors.length) throw new Error(errors.join('\n'))
console.log(JSON.stringify({ colors: result.configuredKeys, menu, errors }, null, 2))
