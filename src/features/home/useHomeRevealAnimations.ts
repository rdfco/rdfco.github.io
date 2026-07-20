import { useLayoutEffect, type RefObject } from 'react'
import { animationRuntime as gsap } from '../../animations'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { homeAnimationConfig as config } from './home-animation-config'

export function useHomeRevealAnimations(
  scope: RefObject<HTMLElement | null>,
) {
  const reducedMotion = useReducedMotion()

  useLayoutEffect(() => {
    if (!scope.current) return

    const context = gsap.context(() => {
      const elements = gsap.utils.toArray<HTMLElement>(config.revealSelector)
      if (reducedMotion) {
        gsap.set(elements, { clearProps: 'transform,opacity' })
        return
      }

      elements.forEach((element) =>
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
  }, [reducedMotion, scope])
}
