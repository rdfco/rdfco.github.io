import puppeteer from 'puppeteer-core'

const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
  args: ['--no-sandbox', '--disable-gpu-sandbox'],
})
const page = await browser.newPage()
const errors = []
page.on('pageerror', error => errors.push(error.message))
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
page.on('requestfailed', request => errors.push(`${request.failure()?.errorText}: ${request.url()}`))

try {
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })
  await page.evaluateOnNewDocument(() => {
    window.__carLongTasks = []
    new PerformanceObserver(list => {
      window.__carLongTasks.push(...list.getEntries().map(entry => ({
        startTime: entry.startTime,
        duration: entry.duration,
      })))
    }).observe({ type: 'longtask', buffered: true })
  })
  await page.goto(process.env.SITE_URL || 'http://127.0.0.1:5173/', {
    waitUntil: 'networkidle0',
    timeout: 60_000,
  })
  const frame = page.frames().find(candidate => candidate.url().includes('/legacy/fort-energy/index.html'))
  if (!frame) throw new Error('Legacy frame did not load')
  await frame.waitForSelector('html[data-fara-ready="true"]', { timeout: 10_000 })
  await page.waitForSelector('.fara-car-scene canvas', { timeout: 30_000 })
  await page.waitForSelector('.fara-car-scene[data-model-ready="true"]', { timeout: 30_000 })
  await new Promise(resolve => setTimeout(resolve, 500))

  const beforeReveal = await page.$eval('.fara-car-scene', node => Number(getComputedStyle(node).opacity))
  await frame.evaluate(() => {
    const maximum = document.documentElement.scrollHeight - innerHeight
    scrollTo(0, maximum * 0.81)
  })
  await new Promise(resolve => setTimeout(resolve, 500))
  const revealStartedAt = await page.evaluate(() => performance.now())
  const opacities = []
  for (const pageProgress of [0.82, 0.825, 0.83, 0.84, 0.86, 0.9]) {
    await frame.evaluate(progress => {
      const maximum = document.documentElement.scrollHeight - innerHeight
      scrollTo(0, maximum * progress)
    }, pageProgress)
    await new Promise(resolve => setTimeout(resolve, 120))
    opacities.push(await page.$eval('.fara-car-scene', node => Number(getComputedStyle(node).opacity)))
  }
  const longTasks = await page.evaluate(
    startedAt => window.__carLongTasks.filter(entry => entry.startTime >= startedAt),
    revealStartedAt,
  )
  const maxLongTask = Math.max(0, ...longTasks.map(entry => entry.duration))
  const gradualReveal = opacities.some(value => value > 0.05 && value < 0.95)
  const pass = beforeReveal === 0 && gradualReveal && maxLongTask < 100 && errors.length === 0
  console.log(JSON.stringify({ pass, canvasWarmedBeforeReveal: true, beforeReveal, opacities, maxLongTask, errors }, null, 2))
  if (!pass) process.exitCode = 1
} finally {
  await browser.close()
}
