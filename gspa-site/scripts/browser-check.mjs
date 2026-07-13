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

await page.goto('http://127.0.0.1:4174/', { waitUntil: 'domcontentloaded', timeout: 60000 })
await new Promise(resolve => setTimeout(resolve, 4000))

const initial = await page.evaluate(() => ({
  path: location.pathname,
  title: document.querySelector('main h2')?.textContent.trim(),
  intro: document.querySelector('main .description p')?.textContent.trim(),
  advantages: [...document.querySelectorAll('.advantages-container .title')].map(node => node.textContent.trim()),
  buttons: document.querySelectorAll('main .read-more-button').length,
  height: document.documentElement.scrollHeight,
  viewport: innerHeight,
  navigation: [...document.querySelectorAll('#header .menu-links-w .nav-link span')].map(node => node.textContent.trim()),
  newsVisible: document.querySelector('#header .news-w') ? getComputedStyle(document.querySelector('#header .news-w')).display !== 'none' : false,
  disabledNavigation: [...document.querySelectorAll('#header .menu-links-w .nav-link')].slice(1).every(node => node.getAttribute('aria-disabled') === 'true' && !node.hasAttribute('href')),
  staticButtons: document.querySelectorAll('.fara-about .fara-expand, .fara-solutions .fara-expand, .fara-ai .fara-expand').length,
  industryButtons: document.querySelectorAll('.fara-industries .fara-expand').length,
  industryBorders: [...document.querySelectorAll('.industries-grid .fara-card')].map(node => getComputedStyle(node).borderBottomWidth),
  footer: {
    heading: document.querySelector('.fara-footer header')?.innerText,
    cases: document.querySelectorAll('.fara-case-item').length,
    oldLogo: Boolean(document.querySelector('#footer .logo')),
    columns: document.querySelector('.fara-footer-shell') ? getComputedStyle(document.querySelector('.fara-footer-shell')).gridTemplateColumns : null,
    background: getComputedStyle(document.querySelector('.fara-footer')).backgroundColor,
    headingColor: getComputedStyle(document.querySelector('.fara-footer header p')).color,
    caseBackground: getComputedStyle(document.querySelector('.fara-case-item')).backgroundImage,
    caseColor: getComputedStyle(document.querySelector('.fara-case-item strong')).color,
  },
  menu: {
    hiddenItems: [...document.querySelectorAll('.montfort-menu nav li')].filter(node => getComputedStyle(node).display === 'none').map(node => node.textContent.trim()),
    termsDisabled: [...document.querySelectorAll('.montfort-menu .terms-link a')].every(node => node.getAttribute('aria-disabled') === 'true' && !node.hasAttribute('href')),
  },
  header: {
    className: document.querySelector('#header')?.className,
    theme: document.querySelector('#header')?.dataset.theme,
    color: document.querySelector('#header .nav-link') ? getComputedStyle(document.querySelector('#header .nav-link')).color : null,
  },
}))

const navbarBefore = await page.$eval('#header .navbar', node => getComputedStyle(node).transform)
await page.hover('#header .menu-links-w li:last-child .nav-link')
await new Promise(resolve => setTimeout(resolve, 700))
const navbarAfter = await page.$eval('#header .navbar', node => getComputedStyle(node).transform)

await page.evaluate(() => scrollTo(0, 1200))
await new Promise(resolve => setTimeout(resolve, 500))
const scrollY = await page.evaluate(() => window.scrollY)
const scrolledHeader = await page.evaluate(() => ({
  className: document.querySelector('#header')?.className,
  theme: document.querySelector('#header')?.dataset.theme,
  color: document.querySelector('#header .nav-link') ? getComputedStyle(document.querySelector('#header .nav-link')).color : null,
}))
await page.screenshot({ path: 'browser-check.png', fullPage: false })
await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight))
await new Promise(resolve => setTimeout(resolve, 500))
await page.screenshot({ path: 'footer-desktop.png', fullPage: false })

await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 })
await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight))
await new Promise(resolve => setTimeout(resolve, 500))
const mobile = await page.evaluate(() => ({
  footerColumns: document.querySelector('.fara-footer-shell') ? getComputedStyle(document.querySelector('.fara-footer-shell')).gridTemplateColumns : null,
  caseColumns: document.querySelector('.fara-case-grid') ? getComputedStyle(document.querySelector('.fara-case-grid')).gridTemplateColumns : null,
  footerWidth: document.querySelector('.fara-footer')?.getBoundingClientRect().width,
  viewportWidth: innerWidth,
  horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
}))
await page.screenshot({ path: 'footer-mobile.png', fullPage: false })

console.log(JSON.stringify({ initial, navbarHoverMoved: navbarBefore !== navbarAfter, scrollY, scrolledHeader, mobile, errors }, null, 2))
await browser.close()
