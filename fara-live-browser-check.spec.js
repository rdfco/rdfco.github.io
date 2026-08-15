import { test } from '@playwright/test'

for (const browserName of ['firefox', 'webkit']) {
  test(`live scroll contract ${browserName}`, async ({ page, browserName: currentBrowser }) => {
    test.skip(currentBrowser !== browserName)
    const logs = []
    const fails = []
    page.on('console', message => logs.push({ type: message.type(), text: message.text() }))
    page.on('requestfailed', request => fails.push({ url: request.url(), failure: request.failure()?.errorText }))
    page.on('response', response => {
      if (response.status() >= 400) fails.push({ url: response.url(), status: response.status() })
    })
    await page.goto('https://rdfco.github.io/', { waitUntil: 'networkidle', timeout: 90_000 })
    await page.waitForTimeout(7_000)
    const info = await page.evaluate(async () => {
      const iframe = document.querySelector('iframe')
      const cw = iframe?.contentWindow
      const cd = iframe?.contentDocument
      if (!cw || !cd) return { hasIframe: !!iframe }
      cw.scrollTo(0, 1600)
      await new Promise(resolve => setTimeout(resolve, 400))
      const beforeDuplicate = cw.scrollY
      cw.postMessage({ type: 'fara:set-route', pathname: '/' }, location.origin)
      await new Promise(resolve => setTimeout(resolve, 900))
      const afterDuplicate = cw.scrollY
      cw.dispatchEvent(new WheelEvent('wheel', { deltaY: 360, cancelable: true, bubbles: true }))
      await new Promise(resolve => setTimeout(resolve, 400))
      return {
        hasIframe: true,
        hasSandbox: iframe.hasAttribute('sandbox'),
        ready: cw.__FARA_WEBGL_READY,
        bodyClass: cd.body.className,
        docH: cd.documentElement.scrollHeight,
        winH: cw.innerHeight,
        beforeDuplicate,
        afterDuplicate,
        afterWheel: cw.scrollY,
      }
    })
    console.log(JSON.stringify({
      browserName,
      info,
      logs: logs.filter(log => /GSAP|error|not found|iframe|404|failed|TypeError|ReferenceError/i.test(log.text)),
      failCount: fails.length,
      fails: fails.slice(0, 20),
    }, null, 2))
  })
}
