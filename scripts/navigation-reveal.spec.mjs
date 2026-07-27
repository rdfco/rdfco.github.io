import { test, expect } from '@playwright/test'

const siteUrl = 'http://localhost:5173/'
const screenshotRoot = 'C:/Users/Part Laptop/.codex/visualizations/2026/07/25/019f983d-86ea-71e2-b374-b35fcc04e23f'

test.use({
  viewport: { width: 1440, height: 900 },
  launchOptions: {
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  },
})

const getFrame = page => page.frames().find(frame => frame.url().includes('/legacy/'))

const waitForFrame = async page => {
  await expect.poll(() => Boolean(getFrame(page))).toBe(true)
  const frame = getFrame(page)
  await frame.waitForSelector('#header .menu-cta')
  return frame
}

const installRecorder = frame => frame.evaluate(() => {
  window.__faraVerify = {
    closeEnd: 0,
    revealStarts: [],
    revealEnds: [],
  }
  document.addEventListener('animationend', event => {
    if (event.animationName === 'fara-menu-close-overlay') {
      window.__faraVerify.closeEnd = performance.now()
    }
    if (event.animationName === 'fara-navbar-item-reveal') {
      window.__faraVerify.revealEnds.push({
        label: event.target.textContent.trim(),
        time: performance.now(),
      })
    }
  })
  document.addEventListener('animationstart', event => {
    if (event.animationName === 'fara-navbar-item-reveal') {
      window.__faraVerify.revealStarts.push({
        label: event.target.textContent.trim(),
        time: performance.now(),
      })
    }
  })
})

const menuState = frame => frame.evaluate(() => {
  const menu = document.querySelector('.montfort-menu')
  const header = document.querySelector('#header')
  const items = [...document.querySelectorAll('#header .menu-links-w > ul > li')]
  return {
    menuActive: menu.classList.contains('active'),
    menuClosing: menu.classList.contains('is-closing'),
    menuDisplay: getComputedStyle(menu).display,
    headerOpen: header.classList.contains('menu-open'),
    headerClosing: header.classList.contains('menu-closing'),
    headerRevealing: header.classList.contains('menu-revealing'),
    expanded: document.querySelector('#header .menu-cta').getAttribute('aria-expanded'),
    scrollLocked: document.documentElement.classList.contains('fara-menu-open'),
    itemOpacity: items.map(item => Number(getComputedStyle(item).opacity)),
    labels: items.map(item => item.textContent.trim()),
  }
})

test('original close and delayed menu navigation keep the original reveal', async ({ page }) => {
  const browserErrors = []
  page.on('pageerror', error => browserErrors.push(error.message))
  page.on('console', message => {
    if (message.type() === 'error') browserErrors.push(message.text())
  })

  await page.goto(siteUrl, { waitUntil: 'networkidle' })
  const frame = await waitForFrame(page)
  await installRecorder(frame)

  await frame.click('#header .menu-cta')
  await expect.poll(async () => (await menuState(frame)).menuActive).toBe(true)
  await page.screenshot({ path: `${screenshotRoot}/menu-open.png` })

  await frame.click('.fara-overlay-close')
  await expect.poll(async () => (await menuState(frame)).headerRevealing, { timeout: 5_000 }).toBe(true)
  const closeRevealState = await menuState(frame)
  expect(closeRevealState.menuActive).toBe(false)
  expect(closeRevealState.menuClosing).toBe(false)
  expect(closeRevealState.menuDisplay).toBe('none')
  expect(closeRevealState.headerOpen).toBe(false)
  expect(closeRevealState.headerClosing).toBe(false)
  expect(closeRevealState.expanded).toBe('false')
  expect(closeRevealState.scrollLocked).toBe(false)
  await page.screenshot({ path: `${screenshotRoot}/navbar-reveal-after-close.png` })

  await expect.poll(async () => (await frame.evaluate(() => window.__faraVerify.revealEnds.length)), { timeout: 5_000 }).toBe(7)
  const closeRecord = await frame.evaluate(() => structuredClone(window.__faraVerify))
  expect(closeRecord.revealStarts).toHaveLength(7)
  expect(closeRecord.revealStarts.every(item => item.time >= closeRecord.closeEnd)).toBe(true)
  expect(closeRecord.revealStarts.map(item => item.label)).toEqual(closeRevealState.labels)

  await installRecorder(frame)
  await frame.click('#header .menu-cta')
  await expect.poll(async () => (await menuState(frame)).menuActive).toBe(true)
  const routeBeforeClick = new URL(page.url()).pathname
  await frame.click('.montfort-menu a[data-fara-route="/AI & Tech"]')
  await page.waitForTimeout(250)
  expect(new URL(page.url()).pathname).toBe(routeBeforeClick)
  await expect.poll(() => new URL(page.url()).pathname, { timeout: 5_000 }).toBe('/AI & Tech')
  await expect.poll(async () => (await frame.evaluate(() => window.__faraVerify.revealEnds.length)), { timeout: 5_000 }).toBe(7)

  const routeRecord = await frame.evaluate(() => structuredClone(window.__faraVerify))
  const routeState = await menuState(frame)
  expect(routeRecord.revealStarts).toHaveLength(7)
  expect(routeRecord.revealStarts.every(item => item.time >= routeRecord.closeEnd)).toBe(true)
  expect(routeRecord.revealStarts.map(item => item.label)).toEqual(routeState.labels)
  expect(routeRecord.revealStarts.map(item => item.time)).toEqual(
    [...routeRecord.revealStarts].map(item => item.time).sort((a, b) => a - b),
  )
  expect(await frame.locator('.fara-route-page[data-fara-page="AI & Tech"]').count()).toBe(1)
  await page.screenshot({ path: `${screenshotRoot}/AI & Tech-after-menu-close.png` })

  await frame.click('#header .nav-link[data-fara-route="/"]')
  await expect.poll(() => new URL(page.url()).pathname).toBe('/')
  await expect.poll(async () => frame.locator('body[data-fara-page="home"]').count()).toBe(1)
  const homeState = await frame.evaluate(() => ({
    mainSuspended: document.querySelector('body > main')?.classList.contains('fara-legacy-main-suspended'),
    routePage: Boolean(document.querySelector('.fara-route-page')),
    headerRevealing: document.querySelector('#header').classList.contains('menu-revealing'),
    canvasVisible: [...document.querySelectorAll('canvas')].some(canvas => {
      const style = getComputedStyle(canvas)
      const rect = canvas.getBoundingClientRect()
      return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0
    }),
  }))
  expect(homeState.mainSuspended).toBe(false)
  expect(homeState.routePage).toBe(false)
  expect(homeState.headerRevealing).toBe(false)
  expect(homeState.canvasVisible).toBe(true)
  await page.screenshot({ path: `${screenshotRoot}/home-after-navbar.png` })

  const firstLink = frame.locator('#header .menu-links-w .nav-link').first()
  const navbar = frame.locator('#header .navbar')
  const beforeHover = await navbar.evaluate(node => getComputedStyle(node).transform)
  await firstLink.hover()
  await page.waitForTimeout(700)
  const duringHover = await navbar.evaluate(node => getComputedStyle(node).transform)
  expect(duringHover).not.toBe('')
  expect(browserErrors).toEqual([])

  console.log(JSON.stringify({
    closeRecord,
    routeRecord,
    closeRevealState,
    routeState,
    homeState,
    hover: { beforeHover, duringHover },
    browserErrors,
  }, null, 2))
})
