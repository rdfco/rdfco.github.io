import { useEffect, useRef } from 'react'

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

// The shell's own scrollbar for the iframe's document: the thumb follows the
// frame's scroll position, and pressing the track moves it.
export const useLegacyScrollbar = (frameRef, status) => {
  const scrollbarThumbRef = useRef()

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
        const trackHeight = thumb.parentElement?.getBoundingClientRect().height || frameWindow.innerHeight
        // Keep the thumb proportional to the document it belongs to, so a short
        // routed page reads as short instead of matching the home page.
        const visibleRatio = Math.min(1, frameWindow.innerHeight / Math.max(1, root.scrollHeight))
        const thumbHeight = Math.max(44, Math.min(trackHeight * .62, trackHeight * visibleRatio))
        const travel = trackHeight - thumbHeight - 28
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
  }, [frameRef, status])

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
    const thumbRect = thumb.getBoundingClientRect()

    // The visible thumb is intentionally narrow, while its track is a wider
    // hit target. Treat the full track width alongside the thumb as draggable;
    // otherwise a press one or two pixels beside the green line is mistaken
    // for a track click and the page appears to move by itself.
    const pressedThumbBand = event.clientY >= thumbRect.top && event.clientY <= thumbRect.bottom

    if (!pressedThumbBand) {
      const direction = event.clientY < thumbRect.top ? -1 : 1
      // Just under a screen, so the line the visitor stopped reading on is
      // still there after the step.
      const step = frameWindow.innerHeight * .85
      const current = frameWindow.lenis?.targetScroll ?? frameWindow.scrollY
      setFrameScroll(frameWindow, Math.min(maxScroll, Math.max(0, current + direction * step)), true)
      return
    }

    // Pointer input happens in the React shell, outside the iframe. Tell the
    // legacy runtime to cancel any section-navigation scroll before dragging,
    // so its animation cannot pull the page away from the pointer afterward.
    frameWindow.dispatchEvent(new frameWindow.CustomEvent('fara:scrollbar-drag-start'))

    const startY = event.clientY
    const startScrollY = frameWindow.lenis?.animatedScroll ?? frameWindow.scrollY
    const thumbHeight = thumbRect.height
    const track = event.currentTarget
    const trackTravel = Math.max(1, track.getBoundingClientRect().height - thumbHeight - 28)
    const scrollPerPixel = maxScroll / trackTravel

    const handlePointerMove = moveEvent => {
      moveEvent.preventDefault()
      setFrameScroll(frameWindow, startScrollY + (moveEvent.clientY - startY) * scrollPerPixel, false)
    }

    const stopDragging = () => {
      document.body.classList.remove('fara-scrollbar-dragging')
      if (track.hasPointerCapture?.(event.pointerId)) track.releasePointerCapture(event.pointerId)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', stopDragging)
      window.removeEventListener('pointercancel', stopDragging)
    }

    document.body.classList.add('fara-scrollbar-dragging')
    track.setPointerCapture?.(event.pointerId)
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', stopDragging)
    window.addEventListener('pointercancel', stopDragging)
  }

  return { handleScrollbarPointerDown, scrollbarThumbRef }
}
