import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { appConfig } from '../../config'
import { content } from '../../content'

const normalizeRoute = value => {
  if (!value) return value
  const [path, query = ''] = String(value).split('?')
  const normalizedPath = path === '/' ? '/' : path.replace(/\/+$/, '')
  return query ? `${normalizedPath}?${query}` : normalizedPath
}

export default function LegacySite() {
  const location = useLocation()
  const navigate = useNavigate()
  const timerRef = useRef()
  const routeSyncRef = useRef()
  const frameRef = useRef()
  const scrollbarThumbRef = useRef()
  const previousPathRef = useRef(location.pathname)
  const routeRef = useRef(`${location.pathname}${location.search}`)
  const [status, setStatus] = useState(
    () => document.querySelector('.legacy-shell')?.dataset.status || 'loading',
  )
  const [menuOpen, setMenuOpen] = useState(false)
  const gateRef = useRef()
  const isHomeRoute = location.pathname === '/'

  useLayoutEffect(() => () => {
    window.clearTimeout(timerRef.current)
    window.clearInterval(routeSyncRef.current)
  }, [])

  useLayoutEffect(() => {
    routeRef.current = `${location.pathname}${location.search}`
  }, [location.pathname, location.search])

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [location.pathname, location.search])

  // Every route change gets the same loading gate, so a page only ever appears
  // once the frame reports that it finished rendering it. This raises the gate
  // in a layout effect, before the browser paints the new route, so the frame
  // is already hidden by the time anything is asked of it.
  useLayoutEffect(() => {
    const previousPath = previousPathRef.current
    previousPathRef.current = location.pathname
    if (previousPath !== location.pathname) setStatus('loading')
  }, [location.pathname])

  useEffect(() => {
    const onMessage = event => {
      if (event.origin !== window.location.origin || event.source !== frameRef.current?.contentWindow) return
      if (event.data?.type === appConfig.legacyRuntime.navigationMessage) {
        navigate(event.data.pathname)
        return
      }
      if (event.data?.type === 'fara:menu-state') {
        setMenuOpen(Boolean(event.data.open))
        return
      }
      if (event.data?.type === appConfig.legacyRuntime.readyMessage) {
        // A ready names the route it answers. Accepting any ready at all let a
        // leftover one from the previous route lift the gate over a page that
        // was still rendering - and answering it with another route message
        // bounced straight back as another ready, which is how the two sides
        // ended up trading tens of thousands of messages and freezing the tab.
        const answered = normalizeRoute(event.data.pathname)
        if (answered && answered !== normalizeRoute(routeRef.current)) return
        window.clearTimeout(timerRef.current)
        window.clearInterval(routeSyncRef.current)
        setStatus('ready')
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [navigate])

  // The frame answers a route message by jumping its document to the top and
  // swapping the page in the same task. Posting that message while the frame is
  // still on screen is what used to show the outgoing page snapping to its top
  // before the gate covered it, so the route is handed over only once the gate
  // has been committed and painted.
  useEffect(() => {
    if (status !== 'loading') return
    const frameWindow = frameRef.current?.contentWindow
    if (!frameWindow) return
    const route = `${location.pathname}${location.search}`
    const sendRoute = () => {
      frameWindow.postMessage(
        { type: appConfig.legacyRuntime.routeMessage, pathname: route },
        window.location.origin,
      )
    }
    // One frame commits the cover, the next one gets it on the glass.
    let paintedFrame = 0
    const committedFrame = window.requestAnimationFrame(() => {
      paintedFrame = window.requestAnimationFrame(sendRoute)
    })
    routeSyncRef.current = window.setInterval(sendRoute, appConfig.legacyRuntime.readyPollMs)
    timerRef.current = window.setTimeout(sendRoute, appConfig.legacyRuntime.readyTimeoutMs)
    return () => {
      window.cancelAnimationFrame(committedFrame)
      window.cancelAnimationFrame(paintedFrame)
      window.clearInterval(routeSyncRef.current)
      window.clearTimeout(timerRef.current)
    }
  }, [location.pathname, location.search, status])

  // The frame holds its section scroll until it hears this, so it starts only
  // once the top of the page is genuinely on screen rather than emerging from
  // the tail of the fade. The timer is the fallback: transitionend never fires
  // if the transition is interrupted or skipped.
  useEffect(() => {
    if (status !== 'ready') return
    const frameWindow = frameRef.current?.contentWindow
    const gate = gateRef.current
    if (!frameWindow) return
    let done = false
    let timer = 0
    const announce = () => {
      if (done) return
      done = true
      window.clearTimeout(timer)
      gate?.removeEventListener('transitionend', onTransitionEnd)
      frameWindow.postMessage({ type: 'fara:revealed' }, window.location.origin)
    }
    const onTransitionEnd = event => {
      if (event.propertyName === 'opacity') announce()
    }
    gate?.addEventListener('transitionend', onTransitionEnd)
    // The gate's opacity transition is 420ms; this only has to outlast it.
    timer = window.setTimeout(announce, 520)
    return () => {
      done = true
      window.clearTimeout(timer)
      gate?.removeEventListener('transitionend', onTransitionEnd)
    }
  }, [status])

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
        // Keep the thumb proportional to the document it belongs to, so a short
        // routed page reads as short instead of matching the home page.
        const visibleRatio = Math.min(1, frameWindow.innerHeight / Math.max(1, root.scrollHeight))
        const thumbHeight = Math.max(44, Math.min(frameWindow.innerHeight * .62, frameWindow.innerHeight * visibleRatio))
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
  }, [status])

  const easeOutCubic = progress => 1 - ((1 - progress) ** 3)

  // The page scrolls through Lenis, so the bar has to move it through Lenis
  // too. Writing scrollY behind Lenis's back leaves its own target where it
  // was, and it eases the page straight back on the next frame.
  const setFrameScroll = (frameWindow, top, smooth) => {
    const lenis = frameWindow.lenis
    if (lenis?.scrollTo) {
      lenis.scrollTo(top, smooth ? { duration: .55, easing: easeOutCubic, force: true } : { immediate: true, force: true })
      return
    }
    frameWindow.scrollTo({ top, left: 0, behavior: 'auto' })
  }

  // Pressing the line itself now moves the page. It steps roughly a screen in
  // the direction of the press rather than travelling to the spot pressed, so
  // the bar reads like a scrollbar track and not like a seek bar - the thumb is
  // still there to drag when someone wants to cover a long distance at once.
  // Before this, only the thumb was live and the line did nothing at all.
  const handleScrollbarPointerDown = event => {
    const frameWindow = frameRef.current?.contentWindow
    const frameDocument = frameRef.current?.contentDocument
    const thumb = scrollbarThumbRef.current
    if (!frameWindow || !frameDocument || !thumb) return

    event.preventDefault()
    const root = frameDocument.documentElement
    const maxScroll = Math.max(1, root.scrollHeight - frameWindow.innerHeight)

    if (!thumb.contains(event.target)) {
      const thumbRect = thumb.getBoundingClientRect()
      const direction = event.clientY < thumbRect.top ? -1 : 1
      // Just under a screen, so the line the visitor stopped reading on is
      // still there after the step.
      const step = frameWindow.innerHeight * .85
      const current = frameWindow.lenis?.targetScroll ?? frameWindow.scrollY
      setFrameScroll(frameWindow, Math.min(maxScroll, Math.max(0, current + direction * step)), true)
      return
    }

    const startY = event.clientY
    const startScrollY = frameWindow.scrollY
    const thumbHeight = thumb.getBoundingClientRect().height
    const trackTravel = Math.max(1, window.innerHeight - thumbHeight - 28)
    const scrollPerPixel = maxScroll / trackTravel

    const handlePointerMove = moveEvent => {
      moveEvent.preventDefault()
      setFrameScroll(frameWindow, startScrollY + (moveEvent.clientY - startY) * scrollPerPixel, false)
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
    <div
      className="legacy-shell"
      data-menu-open={menuOpen ? 'true' : 'false'}
      data-status={status}
      data-route-surface={isHomeRoute ? 'home' : 'content'}
    >
      <div ref={gateRef} className="site-gate" role={status === 'failed' ? 'alert' : 'status'}>
        {status === 'failed' ? (
          content.uiLabels.loadFailure
        ) : (
          <div className="site-loader" aria-label="Loading">
            <span className="site-loader__spinner" aria-hidden="true" />
          </div>
        )}
      </div>
      <iframe
        ref={frameRef}
        className="legacy-site"
        title={appConfig.legacyRuntime.iframeTitle}
        src={appConfig.legacyRuntime.iframeSource}
        onLoad={onLoad}
      />
      <div
        className="fara-scrollbar"
        aria-hidden="true"
        onPointerDown={handleScrollbarPointerDown}
      >
        <div ref={scrollbarThumbRef} className="fara-scrollbar__thumb" />
      </div>
    </div>
  )
}
