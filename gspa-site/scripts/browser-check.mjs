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
})
page.on('pageerror', error => errors.push(error.message))
page.on('requestfailed', request => errors.push(`${request.failure()?.errorText}: ${request.url()}`))
page.on('response', response => {
  if (response.status() >= 400) errors.push(`${response.status()}: ${response.url()}`)
})

await page.goto('http://127.0.0.1:5173/', { waitUntil: 'domcontentloaded', timeout: 60000 })
await new Promise(resolve => setTimeout(resolve, 4000))

const initial = await page.evaluate(() => ({
  path: location.pathname,
  title: document.querySelector('main h2')?.textContent.trim(),
  intro: document.querySelector('main .description p')?.textContent.trim(),
  advantages: [...document.querySelectorAll('.advantages-container .title')].map(node => node.textContent.trim()),
  buttons: document.querySelectorAll('main .read-more-button').length,
  height: document.documentElement.scrollHeight,
  viewport: innerHeight,
  header: {
    className: document.querySelector('#header')?.className,
    theme: document.querySelector('#header')?.dataset.theme,
    color: getComputedStyle(document.querySelector('#header .nav-link')).color,
  },
}))

await page.evaluate(() => scrollTo(0, 1200))
await new Promise(resolve => setTimeout(resolve, 500))
const scrollY = await page.evaluate(() => window.scrollY)
const scrolledHeader = await page.evaluate(() => ({
  className: document.querySelector('#header')?.className,
  theme: document.querySelector('#header')?.dataset.theme,
  color: getComputedStyle(document.querySelector('#header .nav-link')).color,
}))
await page.screenshot({ path: 'browser-check.png', fullPage: false })

console.log(JSON.stringify({ initial, scrollY, scrolledHeader, errors }, null, 2))
await browser.close()
