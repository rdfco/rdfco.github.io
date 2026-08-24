import puppeteer from 'puppeteer-core'
const base = 'http://localhost:5173'
const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--no-sandbox', '--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader'],
})
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900 })
const errors = []
page.on('pageerror', e => errors.push(String(e.message).slice(0, 160)))
page.on('console', m => { if (m.type() === 'error') errors.push(m.text().slice(0, 160)) })
const wait = ms => new Promise(r => setTimeout(r, ms))
const frame = () => page.frames().find(f => f !== page.mainFrame())
const y = () => frame().evaluate(() => Math.round(window.scrollY))
const gate = () => page.$eval('.legacy-shell', el => el.dataset.status)
const click = t => frame().evaluate(t => [...document.querySelectorAll('#header .menu-links-w .nav-link')].find(a => a.textContent.trim() === t).click(), t)

await page.goto(`${base}/`, { waitUntil: 'domcontentloaded', timeout: 60000 })
await wait(7000)
await page.mouse.move(700, 500)
for (let i = 0; i < 30; i += 1) { await page.mouse.wheel({ deltaY: 90 }); await wait(20) }
await wait(1200)
console.log('home scrolled y=', await y())
await click('Think together'); await wait(4000)
console.log('think y=', await y(), 'gate=', await gate())
await click('Home')
// sample scroll position continuously through the transition
const samples = []
for (let i = 0; i < 40; i += 1) { samples.push(`${await gate()}:${await y()}`); await wait(250) }
console.log('samples', samples.join(' '))
console.log('final y=', await y())
console.log('errors', JSON.stringify(errors))
await browser.close()
