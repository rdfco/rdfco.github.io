import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--no-sandbox','--disable-gpu-sandbox','--enable-unsafe-swiftshader'] })
const test = async (url, frameMatch) => {
  const p = await b.newPage()
  await p.setViewport({ width: 1280, height: 720 })
  await p.goto(url, { waitUntil: 'networkidle2', timeout: 90000 })
  await new Promise(r => setTimeout(r, 11000))
  const fr = p.frames().find(f => f.url().includes(frameMatch)) || p.mainFrame()
  await p.mouse.move(200, 200); await new Promise(r => setTimeout(r, 300))
  await p.mouse.move(800, 500); await new Promise(r => setTimeout(r, 1200))
  const out = await fr.evaluate(() => {
    const c = document.querySelector('.cursor'); const app = window.__FARA_APP_EXPORTS?.a
    return { core: typeof app?.core, transform: c ? getComputedStyle(c).transform : 'no el', cls: c?.className }
  })
  await p.close()
  return out
}
console.log('DEPLOYED :', JSON.stringify(await test('https://rdfco.github.io/', '/legacy/fort-energy/')))
console.log('LOCAL    :', JSON.stringify(await test('http://localhost:5174/', '/legacy/main/')))
await b.close()
