import { mkdir } from 'node:fs/promises'
import puppeteer from 'puppeteer-core'

const out = process.env.OUTPUT_DIR || 'work/check'
const base = process.env.SITE_URL || 'http://localhost:5173'
await mkdir(out, { recursive: true })

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--no-sandbox', '--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader'],
})
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })
const errors = []
page.on('pageerror', e => errors.push(String(e.message).slice(0, 200)))
page.on('console', m => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)) })

const wait = ms => new Promise(r => setTimeout(r, ms))
const gate = () => page.$eval('.legacy-shell', el => el.dataset.status)
const frame = () => page.frames().find(f => f !== page.mainFrame())
const state = async () => frame().evaluate(() => ({
  page: document.body.dataset.faraPage,
  nav: [...document.querySelectorAll('#header .menu-links-w .nav-link')]
    .map(a => a.textContent.trim() + (a.classList.contains('active') ? '*' : '')),
  docH: document.documentElement.scrollHeight,
}))
const shot = async name => { await page.screenshot({ path: `${out}/${name}.png` }); return name }

await page.goto(`${base}/`, { waitUntil: 'networkidle2', timeout: 60000 })
await wait(6000)
console.log('home', await gate(), JSON.stringify(await state()), 'url', page.url())
await shot('01-home')

await frame().evaluate(() => [...document.querySelectorAll('#header .menu-links-w .nav-link')].find(a => a.textContent.trim() === 'Think together').click())
await wait(3500)
console.log('think', await gate(), JSON.stringify(await state()), 'url', page.url())
await shot('02-think')

await frame().evaluate(() => document.querySelector('#header .menu-cta').click())
await wait(1600)
await shot('03-think-menu')
await frame().evaluate(() => window.dispatchEvent(new CustomEvent('fara:close-menu', { detail: { animate: true } })))
await wait(2200)

await frame().evaluate(() => [...document.querySelectorAll('#header .menu-links-w .nav-link')].find(a => a.textContent.trim() === 'Home').click())
await wait(5000)
console.log('back', await gate(), JSON.stringify(await state()), 'url', page.url())
await shot('04-home-again')

console.log('iframe loads', await page.evaluate(() => performance.getEntriesByType('resource').filter(e => e.name.includes('legacy/fort-energy')).length))
console.log('errors', JSON.stringify(errors))
await browser.close()
