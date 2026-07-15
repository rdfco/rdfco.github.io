import { useRef, useState } from 'react'

/**
 * Phase 1 boundary: the mirrored Astro document owns its own DOM and runtime.
 * Do not add markup inside this component or manipulate the frame document.
 */
export default function LegacySite() {
  const timerRef = useRef()
  const [status, setStatus] = useState('loading')

  const updateFooter = document => {
    const footer = document?.querySelector('#footer')
    if (!footer) return

    // Preserve the legacy footer DOM and selectors while removing the retired brand menu.
    const brandMenu = footer.querySelector('.menu-links')
    brandMenu?.replaceChildren()

    const logo = footer.querySelector('.legal-info-container .logo')
    if (logo?.tagName.toLowerCase() === 'svg') {
      logo.replaceChildren()
      logo.setAttribute('viewBox', '0 0 667 80')
      logo.setAttribute('aria-label', 'FARA')

      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text')
      label.setAttribute('x', '0')
      label.setAttribute('y', '58')
      label.setAttribute('fill', '#2D628C')
      label.setAttribute('font-family', 'Century Gothic, Arial, sans-serif')
      label.setAttribute('font-size', '52')
      label.setAttribute('letter-spacing', '12')
      label.textContent = 'FARA'
      logo.append(label)
    }

    const copyright = footer.querySelector('.copyright-info p')
    if (copyright) copyright.textContent = '© 2026 | FARA - All rights reserved'
  }

  const onLoad = event => {
    const frameDocument = event.currentTarget.contentDocument
    if (!frameDocument) {
      setStatus('failed')
      return
    }
    updateFooter(frameDocument)
    // The legacy page applies its existing content customizer after load.
    // Re-apply only the requested footer changes after that work completes.
    frameDocument.defaultView?.setTimeout(() => updateFooter(frameDocument), 1000)

    const startedAt = Date.now()
    const waitUntilCustomized = () => {
      if (frameDocument.documentElement.dataset.faraReady === 'true') {
        window.clearTimeout(timerRef.current)
        setStatus('ready')
        return
      }
      if (Date.now() - startedAt >= 5000) {
        setStatus('failed')
        return
      }
      timerRef.current = window.setTimeout(waitUntilCustomized, 50)
    }
    waitUntilCustomized()
  }

  return (
    <div className="legacy-shell" data-status={status}>
      {status !== 'ready' && (
        <div className="site-gate" role={status === 'failed' ? 'alert' : 'status'}>
          {status === 'failed' ? 'FARA could not be loaded. Please refresh the page.' : 'Loading FARA…'}
        </div>
      )}
      <iframe
        className="legacy-site"
        title="FARA"
        src="/legacy/fort-energy/index.html"
        sandbox="allow-scripts allow-same-origin"
        onLoad={onLoad}
      />
    </div>
  )
}
