import puppeteer from 'puppeteer-core'

const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
  args: ['--no-sandbox', '--disable-gpu-sandbox'],
})
const page = await browser.newPage()
const errors = []
page.on('pageerror', error => errors.push(error.message))
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
page.on('requestfailed', request => errors.push(`${request.failure()?.errorText}: ${request.url()}`))

try {
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })
  await page.goto(process.env.SITE_URL || 'http://127.0.0.1:5174/', { waitUntil: 'networkidle0', timeout: 60_000 })
  const frame = page.frames().find(candidate => candidate.url().includes('/legacy/'))
  if (!frame) throw new Error('Legacy frame did not load')
  await new Promise(resolve => setTimeout(resolve, 4_000))
  const desktop = await frame.evaluate(() => ({
    title: document.querySelector('main h2')?.textContent.trim(),
    navigationCount: document.querySelectorAll('#header .menu-links-w .nav-link').length,
    footer: Boolean(document.querySelector('#footer')),
    horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
  }))
  await frame.click('.menu-cta')
  await new Promise(resolve => setTimeout(resolve, 400))
  const menuOpen = await frame.$eval('.montfort-menu', node => node.classList.contains('active'))
  await frame.click('.menu-cta')
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 })
  await new Promise(resolve => setTimeout(resolve, 300))
  const mobile = await frame.evaluate(() => ({
    horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
    footerWidth: document.querySelector('#footer')?.getBoundingClientRect().width,
    viewportWidth: innerWidth,
  }))
  const pass = Boolean(desktop.title && desktop.navigationCount >= 7 && desktop.footer && menuOpen && !desktop.horizontalOverflow && !mobile.horizontalOverflow && mobile.footerWidth <= mobile.viewportWidth && errors.length === 0)
  console.log(JSON.stringify({ pass, desktop, menuOpen, mobile, errors }, null, 2))
  if (!pass) process.exitCode = 1
} finally {
  await browser.close()
}
