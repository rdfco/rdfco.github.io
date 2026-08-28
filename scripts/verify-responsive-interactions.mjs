import puppeteer from 'puppeteer-core'

const url = process.env.SITE_URL || 'http://127.0.0.1:5173/'
const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
  args: ['--no-sandbox', '--disable-gpu-sandbox'],
})
const page = await browser.newPage()
const errors = []
const failures = []
const results = []

page.on('pageerror', error => errors.push(error.message))
page.on('console', message => {
  if (message.type() === 'error') errors.push(message.text())
})
page.on('requestfailed', request => errors.push(`${request.failure()?.errorText}: ${request.url()}`))

const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

const loadRoute = async (pathname, viewport) => {
  await page.setViewport({ ...viewport, deviceScaleFactor: 1 })
  await page.goto(new URL(pathname, url).href, { waitUntil: 'domcontentloaded', timeout: 60_000 })
  await page.waitForSelector('iframe.legacy-site', { timeout: 30_000 })
  let frame
  for (let attempt = 0; attempt < 30 && !frame; attempt += 1) {
    frame = page.frames().find(candidate => candidate.url().includes('/legacy/main/index.html'))
    if (!frame) await wait(300)
  }
  if (!frame) throw new Error(`Legacy frame did not load for ${pathname}`)
  await frame.waitForSelector('html[data-fara-ready="true"]', { timeout: 60_000 })
  await page.waitForFunction(() => document.querySelector('.legacy-shell')?.dataset.status === 'ready', { timeout: 60_000 })
  await wait(500)
  return frame
}

const inspectHome = async (frame, label, minimumGutter, expectedScrollbar) => {
  const scrollbar = await page.$eval('.fara-scrollbar', element => getComputedStyle(element).display)
  const layout = await frame.evaluate(() => {
    const sections = document.querySelector('.fara-sections')
    const sectionRect = sections.getBoundingClientRect()
    const selectors = [
      '.fara-about > h2',
      '.fara-solutions > header h2',
      '.fara-ai > header h2',
      '.fara-industries > header h2',
    ]
    const circles = selectors.map(selector => {
      const heading = sections.querySelector(selector)
      const headingRect = heading.getBoundingClientRect()
      const markerAnchor = heading.querySelector('.fara-title-marker-anchor') || heading
      const markerAnchorRect = markerAnchor.getBoundingClientRect()
      const marker = getComputedStyle(markerAnchor, '::before')
      const markerLeft = Number.parseFloat(marker.left)
      const markerWidth = Number.parseFloat(marker.width)
      return {
        selector,
        headingLeft: Math.round(headingRect.left),
        markerAnchorLeft: Math.round(markerAnchorRect.left),
        fontSize: Number.parseFloat(getComputedStyle(heading).fontSize),
        attached: Number.isFinite(markerLeft)
          && markerAnchorRect.left + markerLeft < markerAnchorRect.left
          && markerAnchorRect.left + markerLeft + markerWidth > markerAnchorRect.left,
      }
    })
    return {
      gutterLeft: Math.round(sectionRect.left),
      gutterRight: Math.round(innerWidth - sectionRect.right),
      horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
      circles,
    }
  })

  let compactHeaderLabels = null
  if (expectedScrollbar === 'none') {
    await frame.evaluate(() => {
      const target = document.querySelector('.fara-industries')
      const top = target.getBoundingClientRect().top + window.scrollY
      window.lenis?.scrollTo?.(top, { immediate: true, force: true })
      window.scrollTo({ top, behavior: 'auto' })
      window.dispatchEvent(new Event('scroll'))
    })
    await wait(180)
    compactHeaderLabels = await frame.evaluate(() => (
      [...document.querySelectorAll('#header .menu-links-w > ul > li')]
        .filter(item => getComputedStyle(item).display !== 'none' && getComputedStyle(item).visibility !== 'hidden')
        .map(item => item.textContent.trim())
    ))
  }

  const result = { label, scrollbar, layout, compactHeaderLabels }
  results.push(result)
  if (scrollbar !== expectedScrollbar) failures.push(`${label}: custom scrollbar display is ${scrollbar}, expected ${expectedScrollbar}`)
  if (layout.gutterLeft < minimumGutter || layout.gutterRight < minimumGutter) failures.push(`${label}: home text gutter is too small`)
  if (layout.horizontalOverflow) failures.push(`${label}: home has horizontal overflow`)
  layout.circles.forEach(circle => {
    if (!circle.attached) failures.push(`${label}: ${circle.selector} marker is detached from its heading`)
    if (circle.headingLeft < minimumGutter) failures.push(`${label}: ${circle.selector} text touches the viewport edge`)
  })
  if (compactHeaderLabels && (compactHeaderLabels.length !== 1 || compactHeaderLabels[0] !== 'Home')) {
    failures.push(`${label}: compact header did not stay fixed on Home`)
  }
}

const inspectRoute = async (frame, label, selector, minimumGutter) => {
  const layout = await frame.$eval(selector, shell => {
    const rect = shell.getBoundingClientRect()
    return {
      gutterLeft: Math.round(rect.left),
      gutterRight: Math.round(innerWidth - rect.right),
      horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
      headingFontSize: Number.parseFloat(getComputedStyle(shell.querySelector('h1')).fontSize),
      compactHeaderLabels: innerWidth <= 1023
        ? [...document.querySelectorAll('#header .menu-links-w > ul > li')]
          .filter(item => getComputedStyle(item).display !== 'none' && getComputedStyle(item).visibility !== 'hidden')
          .map(item => item.textContent.trim())
        : null,
    }
  })
  results.push({ label, layout })
  if (layout.gutterLeft < minimumGutter || layout.gutterRight < minimumGutter) failures.push(`${label}: routed-page text gutter is too small`)
  if (layout.horizontalOverflow) failures.push(`${label}: routed page has horizontal overflow`)
  if (layout.compactHeaderLabels && (layout.compactHeaderLabels.length !== 1 || layout.compactHeaderLabels[0] !== 'Home')) {
    failures.push(`${label}: compact routed-page header did not stay fixed on Home`)
  }
}

const verifyScrollbarDrag = async frame => {
  const startScroll = await frame.evaluate(() => Math.round(window.scrollY))
  const geometry = await page.$eval('.fara-scrollbar', track => {
    const trackRect = track.getBoundingClientRect()
    const thumbRect = track.querySelector('.fara-scrollbar__thumb').getBoundingClientRect()
    return {
      x: Math.round(trackRect.left + 2),
      y: Math.round(thumbRect.top + thumbRect.height / 2),
    }
  })

  // Start beside the 5px visual thumb but inside its 22px hit strip. This is
  // the exact miss that used to trigger an automatic track step.
  await page.mouse.move(geometry.x, geometry.y)
  await page.mouse.down()
  await page.mouse.move(geometry.x, geometry.y + 180, { steps: 6 })
  await page.mouse.up()
  await wait(180)
  const draggedScroll = await frame.evaluate(() => Math.round(window.scrollY))
  await wait(1_200)
  const settledScroll = await frame.evaluate(() => Math.round(window.scrollY))
  const result = { label: 'small-laptop-scrollbar-drag', startScroll, draggedScroll, settledScroll, drift: settledScroll - draggedScroll }
  results.push(result)
  if (draggedScroll <= startScroll + 100) failures.push('small-laptop-scrollbar-drag: dragging the thumb did not move the page')
  if (Math.abs(result.drift) > 2) failures.push(`small-laptop-scrollbar-drag: page drifted ${result.drift}px after release`)
}

try {
  const laptopFrame = await loadRoute('/', { width: 1024, height: 768 })
  await inspectHome(laptopFrame, 'small-laptop-home', 47, 'flex')
  await verifyScrollbarDrag(laptopFrame)

  const laptopThinkFrame = await loadRoute('/think-together', { width: 1024, height: 768 })
  await inspectRoute(laptopThinkFrame, 'small-laptop-think', '.fara-page-shell', 47)

  const tabletFrame = await loadRoute('/', { width: 768, height: 1024 })
  await inspectHome(tabletFrame, 'tablet-home', 37, 'none')

  const compactBoundaryFrame = await loadRoute('/', { width: 462, height: 935 })
  await inspectHome(compactBoundaryFrame, 'phone-below-463-home', 22, 'none')

  const phoneFrame = await loadRoute('/', { width: 390, height: 844 })
  await inspectHome(phoneFrame, 'phone-home', 23, 'none')

  const phoneThinkFrame = await loadRoute('/think-together', { width: 390, height: 844 })
  await inspectRoute(phoneThinkFrame, 'phone-think', '.fara-page-shell', 23)

  const phoneLegalFrame = await loadRoute('/privacy-policy', { width: 390, height: 844 })
  await inspectRoute(phoneLegalFrame, 'phone-privacy', '.fara-content-shell', 23)

  console.log(JSON.stringify({ results, errors, failures }, null, 2))
  if (errors.length || failures.length) process.exitCode = 1
} finally {
  await browser.close()
}
