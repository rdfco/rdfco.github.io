import puppeteer from 'puppeteer-core'
const base = 'http://localhost:5173'
const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--no-sandbox', '--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader'],
})
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900 })
const wait = ms => new Promise(r => setTimeout(r, ms))
const frame = () => page.frames().find(f => f !== page.mainFrame())
const y = () => frame().evaluate(() => Math.round(window.scrollY))

const run = async (route, label) => {
  await page.goto(`${base}${route}`, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await wait(6000)
  await page.mouse.move(700, 500)
  const start = await y()
  // touchpad-style: many small deltas
  for (let i = 0; i < 25; i += 1) { await page.mouse.wheel({ deltaY: 12 }); await wait(16) }
  await wait(500)
  const small = await y()
  for (let i = 0; i < 3; i += 1) { await page.mouse.wheel({ deltaY: 120 }); await wait(60) }
  await wait(800)
  const big = await y()
  const meta = await frame().evaluate(() => ({ docH: document.documentElement.scrollHeight, vh: window.innerHeight, page: document.body.dataset.faraPage }))
  const thumb = await page.$eval('.fara-scrollbar__thumb', el => ({ h: el.style.height, t: el.style.transform }))
  console.log(label, JSON.stringify({ start, afterSmallDeltas: small, afterBigDeltas: big, ...meta, thumb }))
}
await run('/think-together', 'THINK')
await run('/', 'HOME')
await browser.close()
