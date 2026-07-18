import puppeteer from 'puppeteer-core'

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
  args: ['--no-sandbox'],
})
const page = await browser.newPage()
await page.evaluateOnNewDocument(() => {
  window.__faraAudioStarts = 0
  window.__faraLongTasks = []
  new PerformanceObserver(entries => {
    window.__faraLongTasks.push(...entries.getEntries().map(entry => entry.duration))
  }).observe({ type: 'longtask', buffered: true })
  const nativeStart = AudioBufferSourceNode.prototype.start
  AudioBufferSourceNode.prototype.start = function (...args) {
    window.__faraAudioStarts += 1
    return nativeStart.apply(this, args)
  }
})
const errors = []
page.on('pageerror', error => errors.push(error.message))
page.on('console', message => {
  if (message.type() === 'error') errors.push(message.text())
})

await page.setViewport({ width: 1440, height: 900 })
await page.goto(process.env.SITE_URL || 'http://127.0.0.1:5174/', {
  waitUntil: 'networkidle0',
  timeout: 60_000,
})
const frame = page.frames().find(candidate => candidate.url().includes('/legacy/'))
if (!frame) throw new Error('Legacy frame did not load')
await frame.evaluate(() => { window.__faraLongTasks = [] })

await frame.click('.menu-cta')
await new Promise(resolve => setTimeout(resolve, 1_000))
const menuItems = await frame.evaluate(() =>
  [...document.querySelectorAll('.montfort-menu .grid-nav .nav-link')].map(link => {
    const linkRect = link.getBoundingClientRect()
    const textRect = link.querySelector('.text-content').getBoundingClientRect()
    return {
      label: link.textContent.trim(),
      link: { x: linkRect.x, y: linkRect.y, width: linkRect.width, height: linkRect.height },
      text: { x: textRect.x, y: textRect.y, width: textRect.width, height: textRect.height },
    }
  }),
)
const hitboxesMatch = await frame.evaluate(() =>
  [...document.querySelectorAll('.montfort-menu .grid-nav .nav-link')].filter(link => {
    const rect = link.getBoundingClientRect()
    return rect.top >= 0 && rect.bottom <= innerHeight
  }).every(link => {
    const text = link.querySelector('.text-content span').getBoundingClientRect()
    return document.elementFromPoint(text.left + text.width / 2, text.top + text.height / 2)?.closest('a') === link
  }),
)
const homeText = await frame.$('.montfort-menu .nav-link.active .text-content span')
const homeTextRect = await homeText.boundingBox()
await page.mouse.move(
  homeTextRect.x + homeTextRect.width * 0.25,
  homeTextRect.y + homeTextRect.height / 2,
)
await new Promise(resolve => setTimeout(resolve, 700))
const homeHoverWorks = await frame.evaluate(() => {
  const link = document.querySelector('.montfort-menu .nav-link.active')
  const text = link.querySelector('.text-content')
  const icon = link.querySelector('.svg-container')
  return link.matches(':hover') && getComputedStyle(text).transform === 'matrix(1, 0, 0, 1, 0, 0)' && getComputedStyle(icon).transform === 'matrix(1, 0, 0, 1, 0, 0)'
})

await frame.click('.montfort-menu .grid-nav li:nth-child(2) .nav-link')
await page.waitForFunction(() => location.pathname === '/knowing-fara')
await new Promise(resolve => setTimeout(resolve, 1_000))
const state = await frame.evaluate(() => ({
  menuActive: document.querySelector('.montfort-menu').classList.contains('active'),
  headerOpen: document.querySelector('#header').classList.contains('menu-open'),
  expanded: document.querySelector('.menu-cta').getAttribute('aria-expanded'),
  scrollLocked: document.documentElement.classList.contains('fara-menu-open'),
  activeLabel: document.querySelector('#header .nav-link.active')?.textContent.trim(),
  pageVisible: Boolean(document.querySelector('.fara-route-page')),
  soundDisabled: document.documentElement.classList.contains('fara-sound-disabled'),
  playingAudio: [...document.querySelectorAll('audio')].some(audio => !audio.paused),
  audioStarts: window.__faraAudioStarts,
}))

const routes = [
  ['solution', '/solution'],
  ['consulting', '/consulting'],
  ['industries', '/industries'],
  ['case-studies', '/case-studies'],
  ['think-together', '/think-together'],
  ['home', '/'],
  ['knowing-fara', '/knowing-fara'],
  ['privacy-policy', '/privacy-policy'],
  ['terms-of-use', '/terms-of-use'],
]
const routeCycles = []
for (const [key, pathname] of routes) {
  await frame.click('.menu-cta')
  await new Promise(resolve => setTimeout(resolve, 150))
  const link = await frame.$(`.montfort-menu a[data-fara-route="${pathname}"]`)
  const rect = await link.boundingBox()
  for (const ratio of [0.2, 0.5, 0.8, 0.5]) {
    await page.mouse.move(rect.x + rect.width * ratio, rect.y + rect.height / 2)
  }
  await link.click()
  await page.waitForFunction(expected => location.pathname === expected, {}, pathname)
  await new Promise(resolve => setTimeout(resolve, 100))
  if (key === 'knowing-fara') {
    await new Promise(resolve => setTimeout(resolve, 1_000))
    await page.screenshot({ path: 'navigation-knowing-fara-after-click.png' })
  }
  routeCycles.push(await frame.evaluate(expectedKey => ({
    key: expectedKey,
    menuActive: document.querySelector('.montfort-menu').classList.contains('active'),
    menuDisplay: getComputedStyle(document.querySelector('.montfort-menu')).display,
    legacyCloseState: document.querySelector('.menu-cta').classList.contains('close'),
    headerOpen: document.querySelector('#header').classList.contains('menu-open'),
    expanded: document.querySelector('.menu-cta').getAttribute('aria-expanded'),
    scrollLocked: document.documentElement.classList.contains('fara-menu-open'),
    activeKey: document.querySelector('#header .nav-link.active')?.dataset.faraRoute,
    pageVisible: expectedKey === 'home'
      ? !document.querySelector('body > main')?.hidden
      : Boolean(document.querySelector(`.fara-route-page[data-fara-page="${expectedKey}"]`)),
  }), key))
}

await new Promise(resolve => setTimeout(resolve, 1_200))
await page.screenshot({ path: 'navigation-after-menu-click.png' })
const routeCyclesPass = routeCycles.every(cycle =>
  !cycle.menuActive &&
  cycle.menuDisplay === 'none' &&
  !cycle.legacyCloseState &&
  !cycle.headerOpen &&
  cycle.expanded === 'false' &&
  !cycle.scrollLocked &&
  cycle.pageVisible,
)
const longTasks = await frame.evaluate(() => ({
  count: window.__faraLongTasks.length,
  maxDuration: Math.max(0, ...window.__faraLongTasks),
}))

console.log(JSON.stringify({ menuItems, hitboxesMatch, homeHoverWorks, state, routeCycles, routeCyclesPass, longTasks, errors }, null, 2))
await browser.close()

if (
  state.menuActive ||
  state.headerOpen ||
  state.expanded !== 'false' ||
  state.scrollLocked ||
  state.activeLabel !== 'Knowing FARA' ||
  !state.pageVisible ||
  !state.soundDisabled ||
  state.playingAudio ||
  state.audioStarts !== 0 ||
  !hitboxesMatch ||
  !homeHoverWorks ||
  !routeCyclesPass ||
  longTasks.maxDuration > 200 ||
  errors.length
) {
  process.exitCode = 1
}
