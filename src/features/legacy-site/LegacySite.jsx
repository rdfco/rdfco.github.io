import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { appConfig } from '../../config'
import { content } from '../../content'

export default function LegacySite() {
  const location = useLocation()
  const navigate = useNavigate()
  const timerRef = useRef()
  const routeSyncRef = useRef()
  const frameRef = useRef()
  const scrollbarThumbRef = useRef()
  const lastRouteRef = useRef()
  const previousPathRef = useRef(location.pathname)
  const [homeResetKey, setHomeResetKey] = useState(0)
  const [status, setStatus] = useState(
    () => document.querySelector('.legacy-shell')?.dataset.status || 'loading',
  )
  const isHomeRoute = location.pathname === '/'
  const frameKey = isHomeRoute ? `home-${homeResetKey}` : 'content'

  useLayoutEffect(() => () => {
    window.clearTimeout(timerRef.current)
    window.clearInterval(routeSyncRef.current)
  }, [])

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [location.pathname, location.search])

  useEffect(() => {
    const previousPath = previousPathRef.current
    previousPathRef.current = location.pathname
    if (location.pathname === '/' && previousPath !== '/') {
      setHomeResetKey(key => key + 1)
      setStatus('loading')
    }
  }, [location.pathname])

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
        frameRef.current?.contentWindow?.postMessage(
          { type: appConfig.legacyRuntime.routeMessage, pathname: `${window.location.pathname}${window.location.search}` },
          window.location.origin,
        )
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
      sendInitialRoute()
    }, appConfig.legacyRuntime.readyTimeoutMs)
    return () => {
      window.clearInterval(routeSyncRef.current)
      window.clearTimeout(timerRef.current)
    }
  }, [location.pathname, location.search])

  useEffect(() => {
    const frameWindow = frameRef.current?.contentWindow
    const frameDocument = frameRef.current?.contentDocument
    const thumb = scrollbarThumbRef.current
    if (!frameWindow || !frameDocument || !thumb || status !== 'ready') return

    let frameId = 0
    const updateScrollbar = () => {
      window.cancelAnimationFrame(frameId)
      frameId = window.requestAnimationFrame(() => {
        const root = frameDocument.documentElement
        const maxScroll = Math.max(1, root.scrollHeight - frameWindow.innerHeight)
        const progress = Math.min(1, Math.max(0, frameWindow.scrollY / maxScroll))
        const thumbHeight = Math.max(48, Math.min(132, frameWindow.innerHeight * (frameWindow.innerHeight / root.scrollHeight)))
        const travel = frameWindow.innerHeight - thumbHeight - 28
        thumb.style.height = `${thumbHeight}px`
        thumb.style.transform = `translate3d(0, ${14 + progress * Math.max(0, travel)}px, 0)`
      })
    }

    updateScrollbar()
    frameWindow.addEventListener('scroll', updateScrollbar, { passive: true })
    frameWindow.addEventListener('resize', updateScrollbar, { passive: true })
    return () => {
      window.cancelAnimationFrame(frameId)
      frameWindow.removeEventListener('scroll', updateScrollbar)
      frameWindow.removeEventListener('resize', updateScrollbar)
    }
  }, [frameKey, status])

  const handleScrollbarPointerDown = event => {
    const frameWindow = frameRef.current?.contentWindow
    const frameDocument = frameRef.current?.contentDocument
    const thumb = scrollbarThumbRef.current
    if (!frameWindow || !frameDocument || !thumb) return

    event.preventDefault()
    const startY = event.clientY
    const startScrollY = frameWindow.scrollY
    const root = frameDocument.documentElement
    const maxScroll = Math.max(1, root.scrollHeight - frameWindow.innerHeight)
    const thumbHeight = thumb.getBoundingClientRect().height
    const trackTravel = Math.max(1, window.innerHeight - thumbHeight - 28)
    const scrollPerPixel = maxScroll / trackTravel

    const handlePointerMove = moveEvent => {
      moveEvent.preventDefault()
      frameWindow.scrollTo({ top: startScrollY + (moveEvent.clientY - startY) * scrollPerPixel, behavior: 'auto' })
    }

    const stopDragging = () => {
      document.body.classList.remove('fara-scrollbar-dragging')
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', stopDragging)
      window.removeEventListener('pointercancel', stopDragging)
    }

    document.body.classList.add('fara-scrollbar-dragging')
    event.currentTarget.setPointerCapture?.(event.pointerId)
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', stopDragging)
    window.addEventListener('pointercancel', stopDragging)
  }

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
    <div className="legacy-shell" data-status={status} data-route-surface={isHomeRoute ? 'home' : 'content'}>
      {status !== 'ready' && (
        <div className="site-gate" role={status === 'failed' ? 'alert' : 'status'}>
          {status === 'failed' ? (
            content.uiLabels.loadFailure
          ) : (
            <div className="site-loader" aria-label="Loading">
              <span className="site-loader__spinner" aria-hidden="true" />
            </div>
          )}
        </div>
      )}
      <iframe
        key={frameKey}
        ref={frameRef}
        className="legacy-site"
        title={appConfig.legacyRuntime.iframeTitle}
        src={appConfig.legacyRuntime.iframeSource}
        onLoad={onLoad}
      />
      <div className="fara-scrollbar" aria-hidden="true">
        <div
          ref={scrollbarThumbRef}
          className="fara-scrollbar__thumb"
          onPointerDown={handleScrollbarPointerDown}
        />
      </div>
    </div>
  )
}
