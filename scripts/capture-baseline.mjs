import { mkdir, writeFile } from 'node:fs/promises'
import puppeteer from 'puppeteer-core'

const baseUrl = process.env.SITE_URL || 'http://127.0.0.1:4174/'
const outputDir = process.env.BASELINE_DIR || 'work/baseline'
await mkdir(outputDir, { recursive: true })

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
  args: ['--no-sandbox', '--disable-gpu-sandbox'],
})

const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
]

const results = {}
for (const viewport of viewports) {
  const page = await browser.newPage()
  await page.setViewport({ ...viewport, deviceScaleFactor: 1 })
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
  await page.goto(baseUrl, { waitUntil: 'networkidle0', timeout: 60000 })
  await new Promise(resolve => setTimeout(resolve, 1200))

  results[viewport.name] = await page.evaluate(() => {
    const box = selector => {
      const node = document.querySelector(selector)
      if (!node) return null
      const rect = node.getBoundingClientRect()
      const style = getComputedStyle(node)
      return {
        x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(rect.width), height: Math.round(rect.height),
        display: style.display, position: style.position, color: style.color,
        backgroundColor: style.backgroundColor, fontSize: style.fontSize,
      }
    }
    return {
      title: document.title,
      bodyText: document.body.innerText,
      scrollHeight: document.documentElement.scrollHeight,
      horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
      counts: {
        navigation: document.querySelectorAll('#header .menu-links-w .nav-link').length,
        solutions: document.querySelectorAll('.solutions-grid .fara-card').length,
        industries: document.querySelectorAll('.industries-grid .fara-card').length,
        industryButtons: document.querySelectorAll('.industries-grid .fara-expand').length,
        footerCases: document.querySelectorAll('.fara-case-item').length,
      },
      boxes: {
        header: box('#header'), hero: box('.hero'), sections: box('.fara-sections'),
        about: box('.fara-about'), solutions: box('.fara-solutions'), ai: box('.fara-ai'),
        industries: box('.fara-industries'), footer: box('.fara-footer'),
        footerHeading: box('.fara-footer header'), footerBottom: box('.fara-footer-bottom'),
      },
      footerHtml: document.querySelector('.fara-footer')?.innerHTML,
      errors: [],
    }
  })
  results[viewport.name].errors = errors

  for (const [label, selector] of Object.entries({ hero: '.hero', content: '.fara-sections', footer: '.fara-footer' })) {
    const element = await page.$(selector)
    if (element) await element.screenshot({ path: `${outputDir}/${viewport.name}-${label}.png` })
  }
  await page.close()
}

await writeFile(`${outputDir}/metrics.json`, JSON.stringify(results, null, 2))
console.log(JSON.stringify(Object.fromEntries(Object.entries(results).map(([key, value]) => [key, { counts: value.counts, boxes: value.boxes, errors: value.errors }])) , null, 2))
await browser.close()
