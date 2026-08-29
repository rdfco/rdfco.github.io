import puppeteer from 'puppeteer-core'

const url = process.env.SITE_URL || 'http://127.0.0.1:5173/'
const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
  args: ['--no-sandbox', '--disable-gpu-sandbox'],
})

const page = await browser.newPage()
await page.setViewport({
  width: Number(process.env.VIEWPORT_WIDTH || 1920),
  height: Number(process.env.VIEWPORT_HEIGHT || 906),
  deviceScaleFactor: Number(process.env.DEVICE_SCALE_FACTOR || 1),
})
const errors = []
page.on('pageerror', error => errors.push(error.message))
page.on('console', message => {
  if (message.type() === 'error') errors.push(message.text())
})
page.on('requestfailed', request => errors.push(`${request.failure()?.errorText}: ${request.url()}`))

try {
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 60_000 })
  const frame = page.frames().find(candidate => candidate.url().includes('/legacy/main/index.html'))
  if (!frame) throw new Error('Legacy frame did not load')
  await frame.waitForSelector('html[data-fara-ready="true"]', { timeout: 15_000 })

  const measureScroll = async () => {
    const measurement = frame.evaluate(async () => {
      const frames = []
      const start = performance.now()
      await new Promise(resolve => {
        const tick = now => {
          frames.push({ now, scrollY: window.scrollY })
          if (now - start >= 2_000) resolve()
          else requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      })
      const durations = frames.slice(1).map((frame, index) => ({
        duration: frame.now - frames[index].now,
        scrollY: frame.scrollY,
      }))
      const values = durations.map(frame => frame.duration)
      return {
        frameCount: frames.length,
        averageFrameMs: values.reduce((sum, value) => sum + value, 0) / values.length,
        maxFrameMs: Math.max(...values),
        framesOver32Ms: values.filter(value => value > 32).length,
        framesOver50Ms: values.filter(value => value > 50).length,
        slowestFrames: durations.toSorted((a, b) => b.duration - a.duration).slice(0, 5),
        scrollY: window.scrollY,
      }
    })
    await page.mouse.move(720, 450)
    for (let index = 0; index < 24; index += 1) {
      await page.mouse.wheel({ deltaY: 90 })
      await new Promise(resolve => setTimeout(resolve, 24))
    }
    return measurement
  }

  const cycleDurations = []
  const closeFrames = []
  const hoverChecks = []
  const runMenuCycle = async position => {
    await frame.evaluate(() => document.querySelector('#header .menu-cta')?.click())
    await frame.waitForSelector('.fara-menu.active', { visible: true })
    await new Promise(resolve => setTimeout(resolve, 1_200))

    const links = await frame.$$('.fara-menu .grid-nav a, .fara-menu .grid-terms a')
    for (const link of links) {
      const box = await link.boundingBox()
      if (!box) {
        const diagnostic = await link.evaluate(node => {
          const menu = node.closest('.fara-menu')
          return {
            label: node.textContent.trim().replace(/\s+/g, ' '),
            nodeDisplay: getComputedStyle(node).display,
            nodeVisibility: getComputedStyle(node).visibility,
            menuClass: menu.className,
            menuDisplay: getComputedStyle(menu).display,
            menuOpacity: getComputedStyle(menu).opacity,
            scrollY: window.scrollY,
          }
        })
        throw new Error(`A menu link lost its hit target while open: ${JSON.stringify(diagnostic)}`)
      }
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
      await new Promise(resolve => setTimeout(resolve, 70))
      hoverChecks.push(await link.evaluate(node => ({
        label: node.textContent.trim().replace(/\s+/g, ' '),
        hovered: node.matches(':hover') || node.querySelector(':hover') !== null,
      })))
    }

    const startedAt = await frame.evaluate(() => performance.now())
    const closeFrameMeasurement = frame.evaluate(async () => {
      const frames = []
      const styles = []
      const started = performance.now()
      await new Promise(resolve => {
        const tick = now => {
          frames.push(now)
          if (!styles.length || now - styles.at(-1).sampledAt >= 90) {
            const menu = document.querySelector('.fara-menu')
            const overlay = menu.querySelector('.overlay')
            styles.push({
              sampledAt: now,
              elapsed: now - started,
              menuClass: menu.className,
              menuBackground: getComputedStyle(menu).backgroundColor,
              menuOpacity: getComputedStyle(menu).opacity,
              overlayBackground: getComputedStyle(overlay).backgroundColor,
              overlayOpacity: getComputedStyle(overlay).opacity,
              itemOpacities: [...menu.querySelectorAll('ul li')].map(item => Number(getComputedStyle(item).opacity)),
            })
          }
          if (now - started >= 1_400) resolve()
          else requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      })
      const durations = frames.slice(1).map((now, index) => now - frames[index])
      return {
        averageFrameMs: durations.reduce((sum, value) => sum + value, 0) / durations.length,
        maxFrameMs: Math.max(...durations),
        framesOver32Ms: durations.filter(value => value > 32).length,
        framesOver50Ms: durations.filter(value => value > 50).length,
        styles,
        scrollY: window.scrollY,
      }
    })
    await frame.click('.fara-overlay-close')
    await frame.waitForFunction(() => getComputedStyle(document.querySelector('.fara-menu')).display === 'none')
    const endedAt = await frame.evaluate(() => performance.now())
    cycleDurations.push(endedAt - startedAt)
    const closeMeasurement = await closeFrameMeasurement
    const panelFadeSamples = closeMeasurement.styles.filter(sample => Number(sample.menuOpacity) < 0.95)
    closeMeasurement.sequenceVerified = panelFadeSamples.length > 0
      && panelFadeSamples.every(sample => sample.itemOpacities.every(opacity => opacity <= 0.05))
    delete closeMeasurement.styles
    closeFrames.push({ ...closeMeasurement, position })
    await new Promise(resolve => setTimeout(resolve, 1_750))
  }

  // Reproduce the recording exactly: open and close the menu before the first
  // scroll, while the 3D scene is still in its cold-start state.
  await runMenuCycle('top')

  const scrollBeforeMenus = await measureScroll()
  await runMenuCycle('middle')

  await frame.evaluate(() => {
    const target = Math.max(0, document.documentElement.scrollHeight - window.innerHeight - 100)
    window.lenis?.scrollTo(target, { immediate: true, force: true })
  })
  await new Promise(resolve => setTimeout(resolve, 500))
  await runMenuCycle('bottom')

  await frame.evaluate(() => window.lenis?.scrollTo(0, { immediate: true, force: true }))
  await new Promise(resolve => setTimeout(resolve, 500))
  await runMenuCycle('returned-top')

  const scrollAfterMenus = await measureScroll()

  const navigateViaMenu = async (pathname, selector) => {
    await frame.evaluate(() => document.querySelector('#header .menu-cta')?.click())
    await frame.waitForSelector('.fara-menu.active', { visible: true })
    await frame.click(selector)
    await page.waitForFunction(expected => window.location.pathname === expected, { timeout: 15_000 }, pathname)
    await frame.waitForFunction(expected => document.body.dataset.faraPage === expected, { timeout: 15_000 }, (
      pathname === '/' ? 'home' : pathname.slice(1)
    ))
  }

  await navigateViaMenu('/think-together', '.fara-menu [data-fara-route="/think-together"]')
  await new Promise(resolve => setTimeout(resolve, 10_000))
  await runMenuCycle('think-together-after-10s')
  await navigateViaMenu('/', '.fara-menu [data-fara-section-route="/"]')
  await new Promise(resolve => setTimeout(resolve, 10_000))
  await frame.evaluate(() => window.lenis?.scrollTo(1_560, { immediate: true, force: true }))
  await new Promise(resolve => setTimeout(resolve, 500))
  await runMenuCycle('home-return-after-10s-middle')

  const finalState = await frame.evaluate(() => {
    const menu = document.querySelector('.fara-menu')
    const renderer = window.__FARA_APP_EXPORTS?.a?.webgl?.renderer
    const canvas = renderer?.domElement
    return {
      menuClass: menu.className,
      menuDisplay: getComputedStyle(menu).display,
      rootClass: document.documentElement.className,
      lenis: Boolean(window.lenis),
      renderer: renderer ? {
        pixelRatio: renderer.getPixelRatio?.(),
        canvasWidth: canvas?.width,
        canvasHeight: canvas?.height,
        clientWidth: canvas?.clientWidth,
        clientHeight: canvas?.clientHeight,
        maxTextureSize: renderer.capabilities?.maxTextureSize,
        programs: renderer.info?.programs?.length,
        render: renderer.info?.render,
      } : null,
    }
  })

  const report = {
    cycleDurations,
    closeFrames,
    hoverSummary: {
      checks: hoverChecks.length,
      labels: [...new Set(hoverChecks.map(check => check.label))],
      allRetained: hoverChecks.every(check => check.hovered),
    },
    scrollBeforeMenus,
    scrollAfterMenus,
    finalState,
    errors,
  }
  console.log(JSON.stringify(report, null, 2))

  if (cycleDurations.some(duration => duration < 950 || duration > 1_250)) {
    throw new Error(`Menu close duration left the expected 950-1250ms range: ${cycleDurations.join(', ')}`)
  }
  if (closeFrames.some(measurement => measurement.framesOver50Ms > 0)) {
    throw new Error('Menu close animation dropped a frame longer than 50ms')
  }
  if (closeFrames.some(measurement => !measurement.sequenceVerified)) {
    throw new Error('The panel began fading before every menu item reached opacity 0')
  }
  if (hoverChecks.some(check => !check.hovered)) throw new Error('At least one menu hover target was lost')
  if (scrollBeforeMenus.framesOver50Ms > 1 || scrollAfterMenus.framesOver50Ms > 1) {
    throw new Error('Scroll produced repeated frames over 50ms')
  }
  if (finalState.menuDisplay !== 'none' || finalState.rootClass.includes('fara-menu-closing')) {
    throw new Error('Menu did not settle into its final closed state')
  }
  if (!finalState.lenis) throw new Error('The single Lenis scroll owner was not published')
  if (errors.length) throw new Error(`Browser errors: ${errors.join(' | ')}`)
} finally {
  await browser.close()
}
