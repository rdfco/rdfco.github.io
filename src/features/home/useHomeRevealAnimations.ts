import { useLayoutEffect, type RefObject } from 'react'
import { animationRuntime as gsap } from '../../animations'
import { homeAnimationConfig as config } from './home-animation-config'

export function useHomeRevealAnimations(
  scope: RefObject<HTMLElement | null>,
) {
  useLayoutEffect(() => {
    if (!scope.current) return

    const context = gsap.context(() => {
      gsap.utils
        .toArray<HTMLElement>(config.revealSelector)
        .forEach((element) =>
          gsap.from(element, {
            y: config.offsetY,
            opacity: config.opacity,
            duration: config.duration,
            ease: config.ease,
            scrollTrigger: {
              trigger: element,
              start: config.scrollStart,
            },
          }),
        )
    }, scope)

    return () => context.revert()
  }, [scope])
}
