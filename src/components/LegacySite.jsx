import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { appConfig } from '../config'
import { content } from '../content'
import { CarSceneOverlay } from './CarSceneOverlay'

export default function LegacySite() {
  const location = useLocation()
  const navigate = useNavigate()
  const timerRef = useRef()
  const frameRef = useRef()
  const lastRouteRef = useRef()
  const [status, setStatus] = useState('loading')

  useLayoutEffect(() => () => window.clearTimeout(timerRef.current), [])

  useEffect(() => {
    const frameWindow = frameRef.current?.contentWindow
    if (!frameWindow || status === 'loading') return
    const route = `${location.pathname}${location.search}`
    if (lastRouteRef.current === route) return
    lastRouteRef.current = route
    frameWindow.postMessage(
      { type: appConfig.legacyRuntime.routeMessage, pathname: route },
      window.location.origin,
    )
  }, [location.pathname, location.search, status])

  useEffect(() => {
    const onMessage = event => {
      if (event.origin !== window.location.origin || event.data?.type !== appConfig.legacyRuntime.navigationMessage) return
      navigate(event.data.pathname)
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [navigate])

  const updateFooter = document => {
    const footer = document?.querySelector('#footer')
    if (!footer) return
    footer.querySelector('.menu-links')?.replaceChildren()
    const logo = footer.querySelector('.legal-info-container .logo')
    if (logo?.tagName.toLowerCase() === 'svg') {
      logo.replaceChildren()
      logo.setAttribute('viewBox', '0 0 667 80')
      logo.setAttribute('aria-label', content.brand.logoText)
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text')
      label.setAttribute('x', '0')
      label.setAttribute('y', '58')
      label.setAttribute('fill', '#2D628C')
      label.setAttribute('font-family', 'FARA Gotham')
      label.setAttribute('font-size', '52')
      label.setAttribute('letter-spacing', '12')
      label.textContent = content.brand.logoText
      logo.append(label)
    }
    const copyright = footer.querySelector('.copyright-info p')
    if (copyright) copyright.textContent = content.footer.copyright
  }

  const onLoad = event => {
    const frameDocument = event.currentTarget.contentDocument
    if (!frameDocument) {
      setStatus('failed')
      return
    }
    const route = `${location.pathname}${location.search}`
    lastRouteRef.current = route
    frameDocument.defaultView?.postMessage(
      { type: appConfig.legacyRuntime.routeMessage, pathname: route },
      window.location.origin,
    )
    updateFooter(frameDocument)
    frameDocument.defaultView?.setTimeout(
      () => updateFooter(frameDocument),
      appConfig.legacyRuntime.delayedFooterSyncMs,
    )

    const startedAt = Date.now()
    const waitUntilCustomized = () => {
      if (frameDocument.documentElement.dataset.faraReady === 'true') {
        window.clearTimeout(timerRef.current)
        setStatus('ready')
        return
      }
      if (Date.now() - startedAt >= appConfig.legacyRuntime.readyTimeoutMs) {
        setStatus('failed')
        return
      }
      timerRef.current = window.setTimeout(waitUntilCustomized, appConfig.legacyRuntime.readyPollMs)
    }
    waitUntilCustomized()
  }

  return (
    <div className="legacy-shell" data-status={status}>
      {status !== 'ready' && (
        <div className="site-gate" role={status === 'failed' ? 'alert' : 'status'}>
          {status === 'failed' ? (
            content.uiLabels.loadFailure
          ) : (
            <div className="site-loader" aria-label={content.uiLabels.loading}>
              <span className="site-loader__spinner" aria-hidden="true" />
            </div>
          )}
        </div>
      )}
      <iframe
        ref={frameRef}
        className="legacy-site"
        title={appConfig.legacyRuntime.iframeTitle}
        src={appConfig.legacyRuntime.iframeSource}
        sandbox={appConfig.legacyRuntime.sandbox}
        onLoad={onLoad}
      />
      <CarSceneOverlay frameRef={frameRef} enabled={status === 'ready'} />
    </div>
  )
}
