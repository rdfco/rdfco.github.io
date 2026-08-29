import puppeteer from 'puppeteer-core'

const headed = process.argv.includes('--headed')
const base = 'http://localhost:5173'
const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: headed ? false : 'new',
  args: ['--no-sandbox', '--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader', '--window-size=1440,960'],
})
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900 })
const errors = []
page.on('pageerror', e => errors.push(String(e.message).slice(0, 160)))

const wait = ms => new Promise(r => setTimeout(r, ms))
const frame = () => page.frames().find(f => f !== page.mainFrame())
const state = async () => {
  const inner = await frame().evaluate(() => ({
    y: Math.round(window.scrollY),
    page: document.body.dataset.faraPage || '',
    max: Math.round(document.documentElement.scrollHeight - window.innerHeight),
  }))
  const gate = await page.$eval('.legacy-shell', el => el.dataset.status)
  return { ...inner, gate, url: new URL(page.url()).pathname }
}
const clickNav = async label => {
  const ok = await frame().evaluate(text => {
    const link = [...document.querySelectorAll('#header .menu-links-w .nav-link')]
      .find(a => a.textContent.trim().toLowerCase() === text.toLowerCase())
    if (!link) return false
    link.click()
    return true
  }, label)
  if (!ok) throw new Error(`nav link not found: ${label}`)
}
// The iframe document survives route changes, so a rAF recorder installed once
// keeps sampling straight through the transition.
const startRecorder = () => frame().evaluate(() => {
  window.__faraProbe = []
  const t0 = performance.now()
  const tick = () => {
    window.__faraProbe.push([Math.round(performance.now() - t0), Math.round(window.scrollY)])
    window.__faraProbeFrame = requestAnimationFrame(tick)
  }
  tick()
})
const stopRecorder = async () => {
  const samples = await frame().evaluate(() => {
    cancelAnimationFrame(window.__faraProbeFrame)
    return window.__faraProbe
  })
  // Collapse runs of the same y so the trace is readable.
  const out = []
  samples.forEach(([t, y]) => {
    const last = out[out.length - 1]
    if (last && last[1] === y) { last[2] = t; return }
    out.push([t, y, t])
  })
  return out.map(([t, y, end]) => `${t}-${end}ms:${y}`).join('  ')
}

await page.goto(`${base}/`, { waitUntil: 'domcontentloaded', timeout: 60000 })
await wait(9000)
await page.mouse.move(700, 500)
for (let i = 0; i < 30; i += 1) { await page.mouse.wheel({ deltaY: 90 }); await wait(20) }
await wait(1500)
console.log('1. mid home:', JSON.stringify(await state()))

await clickNav('Think together')
await wait(6000)
console.log('2. on think-together:', JSON.stringify(await state()))

await startRecorder()
await clickNav('Home')
await wait(10000)
console.log('3. scroll trace think-together -> Home:')
console.log('  ', await stopRecorder())
console.log('4. final:', JSON.stringify(await state()))

await page.mouse.move(700, 500)
for (let i = 0; i < 30; i += 1) { await page.mouse.wheel({ deltaY: 90 }); await wait(20) }
await wait(1500)
console.log('5. mid home again:', JSON.stringify(await state()))
await startRecorder()
await clickNav('Home')
await wait(7000)
console.log('6. scroll trace home -> Home button (must stay animated):')
console.log('  ', await stopRecorder())
console.log('errors', JSON.stringify(errors))
await browser.close()
