import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { appConfig } from '../../config'
import { normalizeRoute } from '../../config/normalize-route'

// The whole conversation between the shell and the legacy iframe: which route
// the frame should render, when it may be uncovered, and whether its menu is
// open. The shell owns the loading gate, so this hook owns the gate's state.
export const useLegacyRouteBridge = frameRef => {
  const location = useLocation()
  const navigate = useNavigate()
  const timerRef = useRef()
  const routeSyncRef = useRef()
  const previousPathRef = useRef(location.pathname)
  const routeRef = useRef(`${location.pathname}${location.search}`)
  const gateRef = useRef()
  const [status, setStatus] = useState(
    () => document.querySelector('.legacy-shell')?.dataset.status || 'loading',
  )
  const [menuOpen, setMenuOpen] = useState(false)

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
  }, [frameRef, navigate])

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
  }, [frameRef, location.pathname, location.search, status])

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
  }, [frameRef, status])

  return { gateRef, location, menuOpen, setStatus, status }
}
