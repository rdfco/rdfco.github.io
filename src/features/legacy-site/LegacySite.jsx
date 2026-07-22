import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { appConfig } from '../../config'
import { content } from '../../content'

const CarSceneOverlay = lazy(() =>
  import('../car-scene/CarSceneOverlay').then(module => ({ default: module.CarSceneOverlay })),
)

export default function LegacySite() {
  const location = useLocation()
  const navigate = useNavigate()
  const timerRef = useRef()
  const routeSyncRef = useRef()
  const criticalScenePollRef = useRef()
  const frameRef = useRef()
  const lastRouteRef = useRef()
  const [status, setStatus] = useState('loading')
  const [criticalSceneReady, setCriticalSceneReady] = useState(false)

  useLayoutEffect(() => () => {
    window.clearTimeout(timerRef.current)
    window.clearInterval(routeSyncRef.current)
    window.clearInterval(criticalScenePollRef.current)
  }, [])

  useEffect(() => {
    const frameWindow = frameRef.current?.contentWindow
    if (!frameWindow) return
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
      if (event.origin !== window.location.origin || event.source !== frameRef.current?.contentWindow) return
      if (event.data?.type === appConfig.legacyRuntime.navigationMessage) {
        navigate(event.data.pathname)
        return
      }
      if (event.data?.type === appConfig.legacyRuntime.readyMessage) {
        window.clearTimeout(timerRef.current)
        window.clearInterval(routeSyncRef.current)
        setStatus('ready')
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [navigate])

  useEffect(() => {
    const sendInitialRoute = () => {
      frameRef.current?.contentWindow?.postMessage(
        { type: appConfig.legacyRuntime.routeMessage, pathname: `${location.pathname}${location.search}` },
        window.location.origin,
      )
    }
    sendInitialRoute()
    routeSyncRef.current = window.setInterval(sendInitialRoute, appConfig.legacyRuntime.readyPollMs)
    timerRef.current = window.setTimeout(() => {
      window.clearInterval(routeSyncRef.current)
      setStatus(currentStatus => currentStatus === 'loading' ? 'failed' : currentStatus)
    }, appConfig.legacyRuntime.readyTimeoutMs)
    return () => {
      window.clearInterval(routeSyncRef.current)
      window.clearTimeout(timerRef.current)
    }
  }, [location.pathname, location.search])

  useEffect(() => {
    if (status !== 'ready') return undefined
    const frameWindow = frameRef.current?.contentWindow
    if (!frameWindow) return undefined

    const checkCriticalScene = () => {
      const loaded = frameWindow.performance.getEntriesByType('resource').some(entry => {
        try {
          return new URL(entry.name).pathname === appConfig.legacyRuntime.criticalSceneAsset && entry.responseEnd > 0
        } catch {
          return false
        }
      })
      if (!loaded) return
      window.clearInterval(criticalScenePollRef.current)
      setCriticalSceneReady(true)
    }

    checkCriticalScene()
    criticalScenePollRef.current = window.setInterval(
      checkCriticalScene,
      appConfig.legacyRuntime.readyPollMs,
    )
    return () => window.clearInterval(criticalScenePollRef.current)
  }, [status])

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
      {status === 'ready' && criticalSceneReady && (
        <Suspense fallback={null}>
          <CarSceneOverlay frameRef={frameRef} enabled />
        </Suspense>
      )}
    </div>
  )
}
