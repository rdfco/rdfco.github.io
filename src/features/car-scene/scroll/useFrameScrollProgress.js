import { useEffect, useState } from 'react'
import { clamp } from '../utils/math'

export function useFrameScrollProgress({ enabled, frameRef, scrollConfig }) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!enabled) return undefined
    const frameWindow = frameRef.current?.contentWindow
    if (!frameWindow) return undefined

    let animationFrame = 0

    const update = () => {
      const maximum = Math.max(1, frameWindow.document.documentElement.scrollHeight - frameWindow.innerHeight)
      const pageProgress = frameWindow.scrollY / maximum
      const sceneProgress = clamp(
        (pageProgress - scrollConfig.startAtPageProgress) /
          (scrollConfig.endAtPageProgress - scrollConfig.startAtPageProgress),
      )
      setProgress(sceneProgress)
    }

    const scheduleUpdate = () => {
      if (animationFrame) return
      animationFrame = frameWindow.requestAnimationFrame(() => {
        animationFrame = 0
        update()
      })
    }

    scheduleUpdate()
    frameWindow.addEventListener('scroll', scheduleUpdate, { passive: true })
    frameWindow.addEventListener('resize', scheduleUpdate)

    return () => {
      if (animationFrame) frameWindow.cancelAnimationFrame(animationFrame)
      frameWindow.removeEventListener('scroll', scheduleUpdate)
      frameWindow.removeEventListener('resize', scheduleUpdate)
    }
  }, [enabled, frameRef, scrollConfig])

  return progress
}
