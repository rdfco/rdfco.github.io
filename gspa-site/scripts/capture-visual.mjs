import { mkdir } from 'node:fs/promises'
import puppeteer from 'puppeteer-core'

const output = process.env.OUTPUT_DIR || 'work/visual'
const url = process.env.SITE_URL || 'http://127.0.0.1:4174/'
await mkdir(output, { recursive: true })

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
  args: ['--no-sandbox', '--disable-gpu-sandbox'],
})

for (const viewport of [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
]) {
  const page = await browser.newPage()
  await page.setViewport({ width: viewport.width, height: viewport.height, deviceScaleFactor: 1 })
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 })
  await new Promise(resolve => setTimeout(resolve, 3000))
  await page.screenshot({ path: `${output}/${viewport.name}.png`, fullPage: true })
  await page.close()
}

await browser.close()
