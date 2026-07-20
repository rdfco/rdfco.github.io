import { mkdir, writeFile } from 'node:fs/promises'
import puppeteer from 'puppeteer-core'

const url = process.env.SITE_URL || 'http://127.0.0.1:4174/'
const mode = process.env.BASELINE_MODE || 'auto'
const output = process.env.OUTPUT_FILE || 'work/milestone-0/performance.json'

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
  args: ['--no-sandbox', '--disable-gpu-sandbox'],
})

const report = {}
for (const viewport of [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
]) {
  const page = await browser.newPage()
  await page.setViewport({ width: viewport.width, height: viewport.height, deviceScaleFactor: 1 })
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('requestfailed', request => errors.push(`${request.failure()?.errorText}: ${request.url()}`))

  const startedAt = performance.now()
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 60_000 })
  const navigationMs = Math.round(performance.now() - startedAt)
  await new Promise(resolve => setTimeout(resolve, 2500))

  const legacyFrame = page.frames().find(frame => frame.url().includes('/legacy/fort-energy/index.html'))
  const target = mode === 'legacy' || (mode === 'auto' && legacyFrame) ? legacyFrame : page.mainFrame()
  if (!target) throw new Error(`No measurement target found for ${mode}`)
  if (legacyFrame) await legacyFrame.waitForSelector('html[data-fara-ready="true"]', { timeout: 10_000 })

  const metrics = await target.evaluate(async () => {
    const canvases = [...document.querySelectorAll('canvas')]
    const resources = performance.getEntriesByType('resource')
    const frames = []
    await new Promise(resolve => {
      const begin = performance.now()
      const tick = now => {
        frames.push(now)
        if (now - begin >= 2000) resolve()
        else requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    })
    const durations = frames.slice(1).map((value, index) => value - frames[index])
    const avgFrameMs = durations.length ? durations.reduce((sum, value) => sum + value, 0) / durations.length : 0
    const webgl = canvases.map(canvas => {
      const context = canvas.getContext('webgl2') || canvas.getContext('webgl')
      if (!context) return { width: canvas.width, height: canvas.height, context: null }
      const debug = context.getExtension('WEBGL_debug_renderer_info')
      return {
        width: canvas.width,
        height: canvas.height,
        context: context instanceof WebGL2RenderingContext ? 'webgl2' : 'webgl',
        vendor: debug ? context.getParameter(debug.UNMASKED_VENDOR_WEBGL) : null,
        renderer: debug ? context.getParameter(debug.UNMASKED_RENDERER_WEBGL) : null,
      }
    })
    return {
      document: { width: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight },
      canvasCount: canvases.length,
      webgl,
      animation: {
        sampleMs: 2000,
        frameCount: frames.length,
        averageFrameMs: Number(avgFrameMs.toFixed(2)),
        approximateFps: avgFrameMs ? Number((1000 / avgFrameMs).toFixed(1)) : 0,
        framesOver32Ms: durations.filter(value => value > 32).length,
      },
      resources: {
        count: resources.length,
        transferBytes: Math.round(resources.reduce((sum, entry) => sum + (entry.transferSize || 0), 0)),
        decodedBytes: Math.round(resources.reduce((sum, entry) => sum + (entry.decodedBodySize || 0), 0)),
      },
      heap: performance.memory
        ? { usedBytes: performance.memory.usedJSHeapSize, totalBytes: performance.memory.totalJSHeapSize }
        : null,
    }
  })

  report[viewport.name] = { viewport, navigationMs, ...metrics, errors }
  await page.close()
}

await browser.close()
await mkdir(output.slice(0, Math.max(output.lastIndexOf('/'), output.lastIndexOf('\\'))), { recursive: true })
await writeFile(output, `${JSON.stringify(report, null, 2)}\n`)
console.log(JSON.stringify(report, null, 2))
if (Object.values(report).some(result => result.errors.length)) process.exitCode = 1
